import AuthRedisProvider from "@/auth/store/auth.redis.provider"
import { Injectable } from "@nestjs/common"

@Injectable()
export default class AuthRevocationService {
    public static readonly PREFIX = "user:"
    public static readonly SESSION_PREFIX = "session:"
    public static readonly TOKEN_VERSION_PREFIX = "version:"
    public static readonly REFRESH_TOKEN_PREFIX = "refresh:"
    public static readonly REVOKED_VALUE = "revoked"

    constructor(private readonly redisProvider: AuthRedisProvider) {}

    async isTokenRevoked(
        userId: string,
        refreshTokenId: string,
        sessionId: string,
        tokenVersion: string
    ): Promise<boolean> {
        const userKey = `${AuthRevocationService.PREFIX}${userId}`

        const versionResult = await this.redisProvider.client.get(
            `${userKey}:${AuthRevocationService.TOKEN_VERSION_PREFIX}${tokenVersion}`
        )

        if (versionResult === AuthRevocationService.REVOKED_VALUE) {
            return true
        }

        const sessionResult = await this.redisProvider.client.get(
            `${userKey}:${AuthRevocationService.SESSION_PREFIX}${sessionId}`
        )

        if (sessionResult === AuthRevocationService.REVOKED_VALUE) {
            return true
        }

        const refreshResult = await this.redisProvider.client.get(
            `${userKey}:${AuthRevocationService.REFRESH_TOKEN_PREFIX}${refreshTokenId}`
        )

        if (refreshResult === AuthRevocationService.REVOKED_VALUE) {
            return true
        }

        return false
    }

    async revokeTokenVersionOfUser(tokenVersion: string, userId: string): Promise<void> {
        await this.redisProvider.client.set(
            `${AuthRevocationService.PREFIX}${userId}:${AuthRevocationService.TOKEN_VERSION_PREFIX}${tokenVersion}`,
            AuthRevocationService.REVOKED_VALUE
        )
    }

    async revokeSessionOfUser(sessionId: string, userId: string): Promise<void> {
        await this.redisProvider.client.set(
            `${AuthRevocationService.PREFIX}${userId}:${AuthRevocationService.SESSION_PREFIX}${sessionId}`,
            AuthRevocationService.REVOKED_VALUE
        )
    }

    async revokeRefreshTokenOfUser(tokenId: string, userId: string): Promise<void> {
        await this.redisProvider.client.set(
            `${AuthRevocationService.PREFIX}${userId}:${AuthRevocationService.REFRESH_TOKEN_PREFIX}${tokenId}`,
            AuthRevocationService.REVOKED_VALUE
        )
    }
}
