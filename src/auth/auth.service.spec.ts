import { Test } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { UsersService } from "@/users/users.service"
import { SignupUserRequest } from "@/auth/dtos/signup-user.request"
import { ForbiddenException, UnauthorizedException } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { User } from "@/users/entities/user.entity"
import { UserAuthResponse } from "@/auth/dtos/user-auth.response"
import { RoleName } from "@/users/entities/role.entity"
import { RefreshTokenService } from "@/auth/services/refresh-token/refresh-token.service"
import { databaseConf } from "@/common/database/database.conf"
import { jwtConf, JwtConfig } from "@/auth/services/jwt/jwt.conf"
import { refreshTokenServiceConf } from "@/auth/services/refresh-token/refresh-token.conf"
import JwtGenerator from "./services/jwt/jwt.generator"

describe("AuthService", () => {
    let service: AuthService
    let mockUsersService: UsersService
    let mockRefreshTokenService: Partial<RefreshTokenService>

    const newUserDto: SignupUserRequest = {
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
                roles: [
                    { id: 1, name: RoleName.USER, description: "Regular user with limited access", users: [] }
                ],
                tokenVersion: 0,
                refreshTokens: undefined
            }
            users.push(newUser)

            return Promise.resolve(newUser)
        })

        mockUsersService.updateUserEntity = jest.fn().mockImplementation(async (user: User) => {
            const existingUserIndex = users.findIndex(u => u.id === user.id)
            if (existingUserIndex === -1) {
                throw new Error("mocked UsersService - User not found")
            }

            users[existingUserIndex] = {
                ...users[existingUserIndex],
                ...user
            }

            return Promise.resolve(users[existingUserIndex] as User)
        })

        mockRefreshTokenService = {
            findRefreshTokenEntity: jest.fn(),
            createRefreshToken: jest.fn(),
            revokeAllTokensOfUser: jest.fn().mockResolvedValue(Promise.resolve()),
            revokeAllTokensOfUserByVersion: jest.fn().mockResolvedValue(Promise.resolve()),
            revokeFamilyOfUser: jest.fn().mockResolvedValue(Promise.resolve()),
            replaceTokenById: jest.fn().mockResolvedValue(Promise.resolve()),
            isTokenValueValid: jest.fn(),
            isExpired: jest.fn()
        }
    }

    beforeEach(async () => {
        setupMocks()

        const module = await Test.createTestingModule({
            providers: [
                JwtGenerator,
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: RefreshTokenService, useValue: mockRefreshTokenService }
            ],
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    expandVariables: true,
                    envFilePath: ".env.test",
                    load: [databaseConf, jwtConf, refreshTokenServiceConf]
                }),
                JwtModule.registerAsync({
                    useFactory: (configService: ConfigService) => {
                        const jwtConf = configService.get<JwtConfig>("jwt")!
                        return {
                            secret: jwtConf.secret,
                            signOptions: {
                                expiresIn: jwtConf.expiresIn,
                                issuer: jwtConf.issuer,
                                audience: jwtConf.audApi
                            }
                        }
                    },
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
                refreshTokens: undefined,
                roles: [
                    {
                        id: 1,
                        name: RoleName.USER,
                        description: "Regular user with limited access",
                        users: []
                    }
                ]
            })
        })
    })

    describe("login", () => {
        beforeEach(async () => {
            await service.signup(newUserDto)

            mockRefreshTokenService.revokeAllTokensOfUser = jest.fn().mockResolvedValue(undefined)
            mockRefreshTokenService.createRefreshToken = jest
                .fn()
                .mockImplementation(async (user, clientId: string) =>
                    Promise.resolve([
                        "1.mockedRefreshToken",
                        {
                            id: 1,
                            familyId: "mockedFamilyId",
                            userId: 1,
                            clientId: clientId,
                            tokenHash: "hash",
                            expiresAt: new Date(Date.now() + 10000)
                        }
                    ])
                )
        })

        it("should throw an error if user logs in with non-existing email", async () => {
            const invalidEmail = "nonexisting@example.com"
            await expect(service.login({ ...loginUserDto, email: invalidEmail })).rejects.toMatchObject({
                message: "Invalid credentials",
                name: UnauthorizedException.name
            })
        })

        it("should throw an error if user logs in with incorrect password", async () => {
            await expect(service.login({ ...loginUserDto, password: "WrongPassword" })).rejects.toMatchObject(
                {
                    message: "Invalid credentials",
                    name: UnauthorizedException.name
                }
            )
        })

        it("should generate access and refresh tokens on successful login", async () => {
            const loginResponse = await service.login(loginUserDto)

            expect(loginResponse).toHaveProperty("accessToken")
            expect(loginResponse).toHaveProperty("refreshToken")
            expect(mockRefreshTokenService.revokeAllTokensOfUser).toHaveBeenCalledWith(
                1,
                loginUserDto.clientId
            )
            expect(mockRefreshTokenService.createRefreshToken).toHaveBeenCalledWith(
                expect.objectContaining({ id: loginResponse.id, email: loginResponse.email }),
                loginUserDto.clientId
            )
        })
    })

    describe("refreshToken", () => {
        let authUser: UserAuthResponse

        beforeEach(async () => {
            await service.signup(newUserDto)
            mockRefreshTokenService.createRefreshToken = jest.fn().mockResolvedValue(
                Promise.resolve([
                    "1.mockedRefreshToken",
                    {
                        id: 1,
                        familyId: "mockedFamilyId",
                        userId: 1,
                        clientId: "mockedClientId",
                        tokenHash: "hash",
                        expiresAt: new Date(Date.now() + 10000)
                    }
                ])
            )
            authUser = await service.login(loginUserDto)
        })

        it("should throw an exception if given refresh token doesn't exist", async () => {
            mockRefreshTokenService.findRefreshTokenEntity = jest.fn().mockResolvedValue(null)

            const refreshTokenDto = {
                clientId: loginUserDto.clientId,
                refreshToken: authUser.refreshToken
            }

            await expect(service.refreshToken(refreshTokenDto)).rejects.toMatchObject({
                message: "Refresh token not found",
                name: UnauthorizedException.name
            })
        })

        it("should throw an exception and call revokeAllTokensOfUser of RefreshTokenService if the user no longer exists", async () => {
            mockRefreshTokenService.findRefreshTokenEntity = jest.fn().mockResolvedValue(
                Promise.resolve({
                    id: 1,
                    userId: authUser.id,
                    clientId: loginUserDto.clientId,
                    familyId: "mockedFamilyId",
                    tokenHash: "hash",
                    isRevoked: () => false,
                    isExpired: () => false
                })
            )
            mockRefreshTokenService.isTokenValueValid = jest.fn().mockResolvedValue(true)

            mockUsersService.findById = jest.fn().mockResolvedValue(null)

            const refreshTokenDto = {
                clientId: loginUserDto.clientId,
                refreshToken: authUser.refreshToken
            }

            await expect(service.refreshToken(refreshTokenDto)).rejects.toMatchObject({
                message: "User no longer exists",
                name: ForbiddenException.name
            })
        })

        it("should throw an exception and call revokeAllTokensOfUserByVersion of RefreshTokenService if the refresh token is invalid", async () => {
            mockRefreshTokenService.findRefreshTokenEntity = jest.fn().mockResolvedValue(
                Promise.resolve({
                    id: 1,
                    userId: authUser.id,
                    clientId: loginUserDto.clientId,
                    familyId: "mockedFamilyId",
                    tokenHash: "hash",
                    isRevoked: () => false,
                    isExpired: () => false
                })
            )
            mockRefreshTokenService.isTokenValueValid = jest.fn().mockResolvedValue(false)

            const refreshTokenDto = {
                clientId: loginUserDto.clientId,
                refreshToken: "invalidRefreshToken"
            }

            const tokenVersion = users.find(u => u.id === authUser.id)!.tokenVersion!

            await expect(service.refreshToken(refreshTokenDto)).rejects.toMatchObject({
                message: "Invalid refresh token",
                name: ForbiddenException.name
            })

            expect(mockRefreshTokenService.revokeAllTokensOfUserByVersion).toHaveBeenCalledWith(
                authUser.id,
                tokenVersion
            )

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(mockUsersService.updateUserEntity).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: authUser.id,
                    email: authUser.email,
                    tokenVersion: tokenVersion + 1
                })
            )
        })

        it("should throw an exception if the refresh token is expired", async () => {
            mockRefreshTokenService.findRefreshTokenEntity = jest.fn().mockResolvedValue(
                Promise.resolve({
                    id: 1,
                    userId: authUser.id,
                    clientId: loginUserDto.clientId,
                    familyId: "mockedFamilyId",
                    tokenHash: "hash",
                    isRevoked: () => false,
                    isExpired: () => true
                })
            )
            mockRefreshTokenService.isTokenValueValid = jest.fn().mockResolvedValue(true)
            mockRefreshTokenService.isExpired = jest.fn().mockReturnValue(true)

            const refreshTokenDto = {
                clientId: loginUserDto.clientId,
                refreshToken: authUser.refreshToken
            }

            await expect(service.refreshToken(refreshTokenDto)).rejects.toMatchObject({
                message: "Refresh token has expired",
                name: UnauthorizedException.name
            })
        })

        it("should successfully refresh the tokens", async () => {
            const mockedFamilyId = "mockedFamilyId"
            mockRefreshTokenService.findRefreshTokenEntity = jest.fn().mockResolvedValue(
                Promise.resolve({
                    id: 1,
                    userId: authUser.id,
                    clientId: loginUserDto.clientId,
                    familyId: mockedFamilyId,
                    tokenHash: "hash",
                    isRevoked: () => false,
                    isExpired: () => false
                })
            )
            mockRefreshTokenService.isTokenValueValid = jest.fn().mockResolvedValue(true)
            mockRefreshTokenService.createRefreshToken = jest.fn().mockResolvedValue(
                Promise.resolve([
                    "2.newMockedRefreshToken",
                    {
                        id: 2,
                        familyId: mockedFamilyId,
                        userId: authUser.id,
                        clientId: loginUserDto.clientId,
                        tokenHash: "hash",
                        expiresAt: new Date(Date.now() + 10000)
                    }
                ])
            )

            const refreshTokenDto = {
                clientId: loginUserDto.clientId,
                refreshToken: authUser.refreshToken
            }

            const result = await service.refreshToken(refreshTokenDto)

            expect(result).toHaveProperty("accessToken")
            expect(result).toHaveProperty("refreshToken")

            expect(mockRefreshTokenService.replaceTokenById).toHaveBeenCalledWith(
                expect.objectContaining({ id: 1, userId: authUser.id, familyId: mockedFamilyId }),
                2
            )

            expect(mockRefreshTokenService.createRefreshToken).toHaveBeenCalledWith(
                expect.objectContaining({ id: authUser.id, email: authUser.email }),
                loginUserDto.clientId,
                mockedFamilyId
            )
        })
    })

    describe("logout", () => {
        let authUser: UserAuthResponse

        beforeEach(async () => {
            await service.signup(newUserDto)
            mockRefreshTokenService.revokeAllTokensOfUser = jest.fn().mockResolvedValue(Promise.resolve())
            mockRefreshTokenService.createRefreshToken = jest.fn().mockResolvedValue(
                Promise.resolve([
                    "1.mockedRefreshToken",
                    {
                        id: 1,
                        familyId: "mockedFamilyId",
                        userId: 1,
                        clientId: "mockedClientId",
                        tokenHash: "hash",
                        expiresAt: new Date(Date.now() + 10000)
                    }
                ])
            )
            authUser = await service.login(loginUserDto)
        })

        it("should call revokeAllTokensOfUser on RefreshTokenService and throw an exception if the refresh token is not found", async () => {
            mockRefreshTokenService.findRefreshTokenEntity = jest.fn().mockResolvedValue(null)

            const clientId = "test-client-id"

            await expect(
                service.logout(
                    { id: authUser.id, email: authUser.email, roles: authUser.roles as RoleName[] },
                    { refreshToken: "2.invalid-refresh-token", clientId }
                )
            ).rejects.toMatchObject({ message: "Refresh token not found", name: UnauthorizedException.name })

            expect(mockRefreshTokenService.revokeAllTokensOfUser).toHaveBeenCalledWith(authUser.id, clientId)
        })

        it("should call revokeAllTokensOfUser twice on RefreshTokenService and throw the exception if the refresh token belongs to different user", async () => {
            const differentUserId = authUser.id + 1

            mockRefreshTokenService.findRefreshTokenEntity = jest.fn().mockResolvedValue(
                Promise.resolve({
                    id: 1,
                    userId: differentUserId,
                    clientId: loginUserDto.clientId,
                    familyId: "mockedFamilyId",
                    tokenHash: "hash",
                    isRevoked: () => false,
                    isExpired: () => false
                })
            )
            mockRefreshTokenService.revokeAllTokensOfUser = jest.fn().mockResolvedValue(Promise.resolve())

            const clientId = "test-client-id"
            const tokenVersion = users.find(u => u.id === authUser.id)!.tokenVersion

            await expect(
                service.logout(
                    { id: authUser.id, email: authUser.email, roles: authUser.roles as RoleName[] },
                    { refreshToken: authUser.refreshToken, clientId }
                )
            ).rejects.toMatchObject({
                message: "You do not have permission to perform this action",
                name: ForbiddenException.name
            })

            expect(mockRefreshTokenService.revokeAllTokensOfUser).toHaveBeenCalledWith(differentUserId)
            expect(mockRefreshTokenService.revokeAllTokensOfUserByVersion).toHaveBeenCalledWith(
                authUser.id,
                tokenVersion
            )
        })

        it("should call revokeFamilyOfUser on RefreshTokenService if the refresh token is valid", async () => {
            mockRefreshTokenService.findRefreshTokenEntity = jest.fn().mockResolvedValue(
                Promise.resolve({
                    id: 1,
                    userId: authUser.id,
                    clientId: loginUserDto.clientId,
                    familyId: "mockedFamilyId",
                    tokenHash: "hash",
                    isRevoked: () => false,
                    isExpired: () => false
                })
            )

            const clientId = "test-client-id"

            await service.logout(
                { id: authUser.id, email: authUser.email, roles: authUser.roles as RoleName[] },
                { refreshToken: authUser.refreshToken, clientId }
            )

            expect(mockRefreshTokenService.revokeFamilyOfUser).toHaveBeenCalledWith(
                "mockedFamilyId",
                authUser.id
            )
        })
    })
})
