import { Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common"
import { User } from "@/users/entities/user.entity"
import { UsersService } from "@/users/users.service"
import { SignupUserRequest } from "./dtos/signup-user.request"
import * as argon2 from "argon2"
import { UserMapper } from "@/users/user.mapper"
import { LoginUserRequest } from "./dtos/login-user.request"
import { UserAuthResponse } from "./dtos/user-auth.response"
import { RefreshTokenRequest } from "./dtos/refresh-token.request"
import { RefreshTokenService } from "./services/refresh-token/refresh-token.service"
import JwtGenerator from "./services/jwt/jwt.generator"
import { CurrentUser } from "@/common/types/current.user"

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly refreshTokenService: RefreshTokenService,
        private readonly jwtGenerator: JwtGenerator
    ) {}

    async signup(request: SignupUserRequest): Promise<User> {
        const hash = await argon2.hash(request.password)

        const newUser = UserMapper.toNewEntity(request)
        newUser.passwordHash = hash

        const user = await this.usersService.create(newUser)

        return user
    }

    async login(payload: LoginUserRequest): Promise<UserAuthResponse> {
        const user = await this.usersService.findByEmail(payload.email)
        let passwordHash = ""
        if (user) {
            passwordHash = user.passwordHash
        }

        let isPasswordValid = false
        try {
            isPasswordValid = await argon2.verify(passwordHash, payload.password)
        } catch {
            isPasswordValid = false
        }

        if (!user || !isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials")
        }

        await this.refreshTokenService.revokeAllTokensOfUser(user.id, payload.clientId)

        const [refreshToken, tokenEntity] = await this.refreshTokenService.createRefreshToken(
            user,
            payload.clientId
        )

        const accessToken = await this.jwtGenerator.generateToken(
            user,
            tokenEntity.familyId,
            tokenEntity.id.toString()
        )

        return UserMapper.toAuthDto(user, accessToken, refreshToken)
    }

    async logout(user: CurrentUser, payload: RefreshTokenRequest): Promise<void> {
        const tokenRecord = await this.refreshTokenService.findRefreshTokenEntity(payload.refreshToken)
        if (!tokenRecord) {
            await this.revokeAllTokensOfUser(user.id)

            throw new UnauthorizedException("Refresh token not found")
        }

        if (tokenRecord.userId !== user.id) {
            await this.revokeAllTokensOfUser(user.id)
            await this.revokeAllTokensOfUser(tokenRecord.userId)

            throw new ForbiddenException("You do not have permission to perform this action")
        }

        await this.refreshTokenService.revokeFamilyOfUser(tokenRecord.familyId, tokenRecord.userId)
    }

    async refreshToken(payload: RefreshTokenRequest): Promise<UserAuthResponse> {
        const tokenEntity = await this.refreshTokenService.findRefreshTokenEntity(payload.refreshToken)

        if (!tokenEntity) {
            throw new UnauthorizedException("Refresh token not found")
        }

        const user = await this.usersService.findById(tokenEntity.userId)

        if (!user) {
            await this.refreshTokenService.revokeAllTokensOfUser(tokenEntity.userId)

            throw new ForbiddenException("User no longer exists")
        }

        const isTokenValid = await this.refreshTokenService.isTokenValueValid(
            tokenEntity,
            payload.refreshToken,
            payload.clientId
        )

        if (!isTokenValid) {
            await this.refreshTokenService.revokeAllTokensOfUserByVersion(
                tokenEntity.userId,
                user.tokenVersion
            )

            await this.incrementTokenVersion(user)

            throw new ForbiddenException("Invalid refresh token")
        }

        if (this.refreshTokenService.isExpired(tokenEntity)) {
            throw new UnauthorizedException("Refresh token has expired")
        }

        const [newRefreshToken, newTokenEntity] = await this.refreshTokenService.createRefreshToken(
            user,
            payload.clientId,
            tokenEntity.familyId
        )

        await this.refreshTokenService.replaceTokenById(tokenEntity, newTokenEntity.id)

        const accessToken = await this.jwtGenerator.generateToken(
            user,
            newTokenEntity.familyId,
            newTokenEntity.id.toString()
        )

        return UserMapper.toAuthDto(user, accessToken, newRefreshToken)
    }

    async incrementTokenVersion(user: User): Promise<void> {
        user.tokenVersion++
        await this.usersService.updateUserEntity(user)
    }

    private async revokeAllTokensOfUser(userId: number): Promise<void> {
        const user = await this.usersService.findById(userId)
        if (!user) {
            await this.refreshTokenService.revokeAllTokensOfUser(userId)

            return
        }

        await this.refreshTokenService.revokeAllTokensOfUserByVersion(userId, user.tokenVersion)

        await this.incrementTokenVersion(user)
    }
}
