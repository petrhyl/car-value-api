import { Injectable, UnauthorizedException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { RefreshToken } from "./refresh-token.entity"
import { Repository } from "typeorm"
import { User } from "@/users/user.entity"
import * as argon2 from "argon2"
import * as crypto from "node:crypto"
import { AppUtils } from "@/app.utils"

@Injectable()
export class RefreshTokenService {
    public static readonly EXPIRATION_SKEW_MS = 3000

    constructor(
        @InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>
    ) {}

    async findValidRefreshTokenEntity(refreshToken: string): Promise<RefreshToken> {
        const [id, token] = this.split(refreshToken)

        const tokenEntity = await this.refreshTokenRepository.findOneBy({ id })

        if (!tokenEntity) {
            throw new UnauthorizedException("Refresh token not found")
        }

        const isValid = await this.isTokenValueValid(tokenEntity, token)

        if (!isValid) {
            await this.invalidateAllTokensOfUser(tokenEntity.userId)

            throw new UnauthorizedException("Invalid refresh token")
        }

        if (this.isExpired(tokenEntity)) {
            await this.invalidateRefreshTokens([tokenEntity])

            throw new UnauthorizedException("Expired refresh token")
        }

        return tokenEntity
    }

    async findRefreshTokenByUserIdAndClientId(userId: number, clientId: string): Promise<RefreshToken[]> {
        return this.refreshTokenRepository.findBy({ userId, clientId })
    }

    async createRefreshToken(user: User, clientId: string): Promise<string> {
        const rawToken = this.generateToken()
        const hashedRefreshToken = await this.hash(rawToken)

        const refreshToken = this.refreshTokenRepository.create({
            userId: user.id,
            tokenHash: hashedRefreshToken,
            clientId,
            expiresAt: this.newExpirationDate()
        })

        await this.refreshTokenRepository.save(refreshToken)

        const wiredToken = this.wire(rawToken, refreshToken.id)
        return wiredToken
    }

    async invalidateRefreshTokens(tokenEntities: RefreshToken[]): Promise<void> {
        await this.refreshTokenRepository.remove(tokenEntities)
    }

    async isTokenValueValid(tokenEntity: RefreshToken, rawToken: string): Promise<boolean> {
        return argon2.verify(tokenEntity.tokenHash, rawToken)
    }

    isExpired(tokenEntity: RefreshToken): boolean {
        const now = new Date()
        now.setUTCMilliseconds(now.getUTCMilliseconds() + RefreshTokenService.EXPIRATION_SKEW_MS)

        return tokenEntity.isExpired(now)
    }

    async hash(token: string): Promise<string> {
        return argon2.hash(token)
    }

    async invalidateAllTokensOfUser(userId: number): Promise<void> {
        await this.refreshTokenRepository.delete({ userId })
    }

    private generateToken(): string {
        return crypto.randomBytes(64).toString("base64url")
    }

    private wire(rawToken: string, id: number): string {
        return `${id}.${rawToken}`
    }

    /**
     *
     * @param refreshToken refresh token string in format `<id>.<token>`
     * @returns tuple of [id, rawToken]
     */
    private split(refreshToken: string): [number, string] {
        const idx = refreshToken.indexOf(".")
        if (idx <= 0) {
            throw new UnauthorizedException("Malformed refresh token")
        }

        const id = AppUtils.parseNumberOrNull(refreshToken.slice(0, idx))

        if (id === null) {
            throw new UnauthorizedException("Malformed refresh token")
        }

        return [id, refreshToken.slice(idx + 1)]
    }

    private newExpirationDate(): Date {
        return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    }
}
