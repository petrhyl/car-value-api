import { Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common"
import { User } from "../users/user.entity"
import { UsersService } from "../users/users.service"
import { CreateUserDto } from "./dtos/create-user.dto"
import * as argon2 from "argon2"
import { UserMapper } from "../users/user.mapper"
import { LoginUserDto } from "./dtos/login-user.dto"
import { JwtService } from "@nestjs/jwt"
import { UserAuthDto } from "./dtos/user-auth.dto"
import { RefreshTokenDto } from "./dtos/refresh-token.dto"
import { RefreshToken } from "./refresh-token.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly jwtService: JwtService
    ) {}

    async signup(request: CreateUserDto): Promise<User> {
        const hash = await argon2.hash(request.password)

        const newUser = UserMapper.toNewEntity(request)
        newUser.passwordHash = hash

        const user = await this.usersService.create(newUser)

        return user
    }

    async login(payload: LoginUserDto): Promise<UserAuthDto> {
        const user = await this.usersService.findByEmail(payload.email)
        let passwordHash = ""
        if (user) {
            passwordHash = user.passwordHash
        }

        let isValid = false
        try {
            isValid = await argon2.verify(passwordHash, payload.password)
        } catch {
            isValid = false
        }

        if (!user || !isValid) {
            throw new UnauthorizedException("Invalid credentials")
        }

        // Generate access token
        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                tokenVersion: user.tokenVersion
            },
            {
                expiresIn: "1h"
            }
        )

        // Generate refresh token
        const refreshToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                tokenVersion: user.tokenVersion,
                type: "refresh"
            },
            {
                expiresIn: "1y"
            }
        )

        const existing = await this.findRefreshTokenByUserAndClient(user.id, payload.clientId)
        if (existing) {
            await this.updateRefreshToken(user.id, payload.clientId, refreshToken)
        } else {
            await this.createRefreshToken(user.id, refreshToken, payload.clientId)
        }

        return UserMapper.toAuthDto(user, accessToken, refreshToken)
    }

    async logout(user: User, clientId: string): Promise<void> {
        await this.usersService.incrementTokenVersion(user)
        await this.removeRefreshTokenByUserAndClient(user.id, clientId)
    }

    async refreshToken(payload: RefreshTokenDto): Promise<UserAuthDto> {
        const user = await this.usersService.findById(payload.userId)
        if (!user) {
            throw new ForbiddenException("User not found")
        }

        const tokenRecord = await this.findRefreshTokenByUserAndClient(payload.userId, payload.clientId)
        if (!tokenRecord) {
            throw new ForbiddenException("Refresh token not found")
        }

        // Validate refresh token
        const isValid = await argon2.verify(tokenRecord.tokenHash, payload.refreshToken)
        if (!isValid) {
            throw new ForbiddenException("Invalid refresh token")
        }

        // Rotate: issue new tokens and update stored hash
        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                tokenVersion: user.tokenVersion
            },
            {
                expiresIn: "15m"
            }
        )
        const newRefreshToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                tokenVersion: user.tokenVersion,
                type: "refresh"
            },
            {
                expiresIn: "7d"
            }
        )

        const existing = await this.findRefreshTokenByUserAndClient(user.id, payload.clientId)
        if (existing) {
            await this.updateRefreshToken(user.id, payload.clientId, newRefreshToken)
        } else {
            await this.createRefreshToken(user.id, newRefreshToken, payload.clientId)
        }

        return UserMapper.toAuthDto(user, accessToken, newRefreshToken)
    }

    async createRefreshToken(userId: number, token: string, clientId: string): Promise<RefreshToken> {
        const hashedRefreshToken = await argon2.hash(token)

        const refreshToken = this.refreshTokenRepository.create({
            userId,
            tokenHash: hashedRefreshToken,
            clientId
        })
        return this.refreshTokenRepository.save(refreshToken)
    }

    async findRefreshTokenByUserAndClient(userId: number, clientId: string): Promise<RefreshToken | null> {
        return this.refreshTokenRepository.findOneBy({ userId, clientId })
    }

    async removeRefreshTokenByUserAndClient(userId: number, clientId: string): Promise<void> {
        await this.refreshTokenRepository.delete({ userId, clientId })
    }

    async updateRefreshToken(userId: number, clientId: string, token: string): Promise<void> {
        const hashedRefreshToken = await argon2.hash(token)

        await this.refreshTokenRepository.update({ userId, clientId }, { tokenHash: hashedRefreshToken })
    }
}
