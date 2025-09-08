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
import { RefreshTokenService } from "./refresh-token.service"

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly refreshTokenService: RefreshTokenService,
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

        const existingRefreshTokens = await this.refreshTokenService.findRefreshTokenByUserIdAndClientId(
            user.id,
            payload.clientId
        )
        if (existingRefreshTokens) {
            await this.refreshTokenService.invalidateRefreshTokens(existingRefreshTokens)
        }

        // Generate access token
        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                tokenVersion: user.tokenVersion,
                type: "access"
            },
            {
                expiresIn: "1h"
            }
        )

        const refreshToken = await this.refreshTokenService.createRefreshToken(user, payload.clientId)

        return UserMapper.toAuthDto(user, accessToken, refreshToken)
    }

    async logout(user: User, payload: RefreshTokenDto): Promise<void> {
        const tokenRecord = await this.refreshTokenService.findValidRefreshTokenEntity(payload.refreshToken)

        if (!tokenRecord || tokenRecord.userId !== user.id) {
            await this.refreshTokenService.invalidateAllTokensOfUser(user.id)

            throw new ForbiddenException("You do not have permission to perform this action")
        }

        await this.refreshTokenService.invalidateRefreshTokens([tokenRecord])
    }

    async refreshToken(payload: RefreshTokenDto): Promise<UserAuthDto> {
        const tokenRecord = await this.refreshTokenService.findValidRefreshTokenEntity(payload.refreshToken)

        const user = await this.usersService.findById(tokenRecord.userId)
        if (!user) {
            await this.refreshTokenService.invalidateAllTokensOfUser(tokenRecord.userId)

            throw new ForbiddenException("User no longer exists")
        }

        await this.refreshTokenService.invalidateRefreshTokens([tokenRecord])

        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.id,
                email: user.email,
                tokenVersion: user.tokenVersion,
                type: "access"
            },
            {
                expiresIn: "15m"
            }
        )

        const newRefreshToken = await this.refreshTokenService.createRefreshToken(user, payload.clientId)

        return UserMapper.toAuthDto(user, accessToken, newRefreshToken)
    }
}
