import { Test } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { UsersService } from "../users/users.service"
import { CreateUserDto } from "./dtos/create-user.dto"
import { ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { getRepositoryToken } from "@nestjs/typeorm"
import { RefreshToken } from "./refresh-token.entity"
import { JwtModule } from "@nestjs/jwt"
import * as argon2 from "argon2"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { Repository } from "typeorm"
import { User } from "src/users/user.entity"
import { UserAuthDto } from "./dtos/user-auth.dto"

describe("AuthService", () => {
    let service: AuthService
    let mockUsersService: UsersService
    let mockRefreshTokenRepository: Partial<Repository<RefreshToken>>

    const newUserDto: CreateUserDto = {
        email: "test@example.com",
        name: "Test User",
        password: "StrongPassword123*"
    }

    const loginUserDto = {
        email: newUserDto.email,
        password: newUserDto.password,
        clientId: "test-client-id"
    }

    let users: Partial<User>[] = []

    const setupMocks = () => {
        users = []

        mockUsersService = jest.createMockFromModule<UsersService>("../users/users.service")
        mockUsersService.findByEmail = jest.fn().mockImplementation(async (email: string) => {
            return Promise.resolve(users.find(user => user.email === email) || null)
        })
        mockUsersService.findById = jest.fn().mockImplementation(async (id: number) => {
            return Promise.resolve(users.find(user => user.id === id) || null)
        })
        mockUsersService.create = jest.fn().mockImplementation(async (user: User) => {
            const existingUser = users.find(u => u.email === user.email)
            if (existingUser) {
                throw new Error("mocked UsersService - User with this e-mail already exists")
            }

            const newUser = {
                ...user,
                id: users.length + 1,
                passwordHash: user.passwordHash,
                tokenVersion: 0,
                refreshTokens: undefined
            }
            users.push(newUser)

            return Promise.resolve(newUser)
        })

        mockRefreshTokenRepository = {
            findOneBy: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            create: jest.fn().mockImplementation(data => ({
                id: 1,
                ...data
            }))
        }
    }

    beforeEach(async () => {
        setupMocks()

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                {
                    provide: getRepositoryToken(RefreshToken),
                    useValue: mockRefreshTokenRepository
                }
            ],
            imports: [
                ConfigModule.forRoot({
                    ignoreEnvFile: process.env.NODE_ENV === "production",
                    isGlobal: true
                }),
                JwtModule.registerAsync({
                    useFactory: (configService: ConfigService) => ({
                        secret: configService.get<string>("JWT_SECRET"),
                        signOptions: { expiresIn: "1d" }
                    }),
                    inject: [ConfigService]
                })
            ]
        }).compile()

        service = module.get<AuthService>(AuthService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe("signup", () => {
        it("should create a new user", async () => {
            const result = await service.signup(newUserDto)
            expect(result).toEqual({
                id: expect.any(Number) as number,
                email: newUserDto.email,
                name: newUserDto.name,
                passwordHash: expect.any(String) as string,
                tokenVersion: 0,
                nickname: null,
                refreshTokens: undefined
            })
        })
    })

    describe("login", () => {
        beforeEach(async () => {
            await service.signup(newUserDto)
        })

        it("should throw an error if user logs in with non-existing email", async () => {
            const invalidEmail = "nonexisting@example.com"
            await expect(service.login({ ...loginUserDto, email: invalidEmail })).rejects.toMatchObject({
                message: "Invalid credentials",
                name: UnauthorizedException.name
            })
        })

        it("should throw an error if user logs in with incorrect password", async () => {
            await expect(service.login({ ...loginUserDto, password: "WrongPassword" })).rejects.toMatchObject({
                message: "Invalid credentials",
                name: UnauthorizedException.name
            })
        })

        it("should generate access and refresh tokens on successful login", async () => {
            const result = await service.login(loginUserDto)

            expect(result).toHaveProperty("accessToken")
            expect(result).toHaveProperty("refreshToken")
        })
    })

    describe("refreshToken", () => {
        let authUser: UserAuthDto

        beforeEach(async () => {
            await service.signup(newUserDto)
            authUser = await service.login(loginUserDto)
        })

        it("should throw an exception if given refresh token doesn't exist", async () => {
            mockRefreshTokenRepository.findOneBy = jest.fn().mockResolvedValue(null)

            const refreshTokenDto = {
                userId: authUser.id,
                clientId: loginUserDto.clientId,
                refreshToken: authUser.refreshToken
            }

            await expect(service.refreshToken(refreshTokenDto)).rejects.toMatchObject({
                message: "Refresh token not found",
                name: ForbiddenException.name
            })
        })

        it("should throw an exception if the refresh token is invalid", async () => {
            mockRefreshTokenRepository.findOneBy = jest.fn().mockResolvedValue({
                id: 1,
                userId: authUser.id,
                clientId: loginUserDto.clientId,
                tokenHash: await argon2.hash(authUser.refreshToken)
            })

            const refreshTokenDto = {
                userId: authUser.id,
                clientId: loginUserDto.clientId,
                refreshToken: "invalidRefreshToken"
            }

            await expect(service.refreshToken(refreshTokenDto)).rejects.toMatchObject({
                message: "Invalid refresh token",
                name: ForbiddenException.name
            })
        })

        it("should successfully refresh the tokens", async () => {
            mockRefreshTokenRepository.findOneBy = jest.fn().mockResolvedValue({
                id: 1,
                userId: authUser.id,
                clientId: loginUserDto.clientId,
                tokenHash: await argon2.hash(authUser.refreshToken)
            })

            const refreshTokenDto = {
                userId: authUser.id,
                clientId: loginUserDto.clientId,
                refreshToken: authUser.refreshToken
            }

            const result = await service.refreshToken(refreshTokenDto)

            expect(result).toHaveProperty("accessToken")
            expect(result).toHaveProperty("refreshToken")
        })
    })
})
