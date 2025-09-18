import { Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { RefreshToken } from "@/auth/entities/refresh-token.entity"
import { Repository } from "typeorm"
import { User } from "@/users/entities/user.entity"
import * as crypto from "node:crypto"
import { AppUtils } from "@/common/utils/app.utils"
import { refreshTokenServiceConf, RefreshTokenServiceConfig } from "./refresh-token.conf"
import AuthRevocationService from "@/auth/services/auth.revocation.service"

@Injectable()
export class RefreshTokenService {
    constructor(
        @Inject(refreshTokenServiceConf.KEY)
        private readonly config: RefreshTokenServiceConfig,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly revocationService: AuthRevocationService
    ) {}

    async findRefreshTokenEntity(refreshToken: string): Promise<RefreshToken | null> {
        const tokenIdAndValue = this.split(refreshToken)

        if (tokenIdAndValue === null) {
            return null
        }

        const [id, _token] = tokenIdAndValue

        const tokenEntity = await this.refreshTokenRepository.findOneBy({ id })

        return tokenEntity
    }

    /**
     * Generates refresh token and creates new refresh token entity.
     * @param user user entity of the authenticated user
     * @param clientId id of the client app where the user is logged in
     * @param familyId id of the family of refresh tokens
     * @returns {[string, RefreshToken]} tuple of refresh token to provide to user and created refresh token entity
     */
    async createRefreshToken(
        user: User,
        clientId: string,
        familyId?: string
    ): Promise<[string, RefreshToken]> {
        const rawToken = this.generateToken()
        const hashedRefreshToken = await this.hash(rawToken)

        if (!familyId) {
            familyId = crypto.randomUUID()
        }

        const refreshToken = this.refreshTokenRepository.create({
            userId: user.id,
            tokenHash: hashedRefreshToken,
            clientId,
            familyId,
            expiresAt: this.newExpirationDate()
        })

        await this.refreshTokenRepository.save(refreshToken)

        const wiredToken = this.wire(rawToken, refreshToken.id)

        return [wiredToken, refreshToken]
    }

    async replaceTokenById(oldTokenEntity: RefreshToken, replacedById: number): Promise<void> {
        oldTokenEntity.replacedByTokenId = replacedById
        oldTokenEntity.revokedAt = new Date()

        await this.refreshTokenRepository.save(oldTokenEntity)
    }

    async revokeAllTokensOfUser(userId: number, clientId?: string): Promise<void> {
        const now = new Date()

        const command = this.refreshTokenRepository
            .createQueryBuilder()
            .update(RefreshToken)
            .set({ revokedAt: now })
            .where("userId = :userId", { userId })
            .andWhere("revokedAt IS NULL")

        if (clientId) {
            command.andWhere("clientId = :clientId", { clientId })
        }

        await command.execute()
    }

    async revokeFamilyOfUser(familyId: string, userId: number): Promise<void> {
        const now = new Date()
        await this.refreshTokenRepository
            .createQueryBuilder()
            .update(RefreshToken)
            .set({ revokedAt: now })
            .where("familyId = :familyId", { familyId })
            .andWhere("userId = :userId", { userId })
            .andWhere("revokedAt IS NULL")
            .execute()

        await this.revocationService.revokeSessionOfUser(familyId, userId.toString())
    }

    async revokeAllTokensOfUserByVersion(userId: number, tokenVersion: number): Promise<void> {
        const now = new Date()

        await this.refreshTokenRepository
            .createQueryBuilder()
            .update(RefreshToken)
            .set({ revokedAt: now })
            .where("userId = :userId", { userId })
            .andWhere("revokedAt IS NULL")
            .execute()

        await this.revocationService.revokeTokenVersionOfUser(tokenVersion.toString(), userId.toString())
    }

    async isTokenValueValid(tokenEntity: RefreshToken, token: string, clientId: string): Promise<boolean> {
        const tokenIdAndValue = this.split(token)

        if (tokenIdAndValue === null) {
            return false
        }

        const [id, rawToken] = tokenIdAndValue

        const previousTokenHash = await this.hash(rawToken)

        if (
            id === tokenEntity.id &&
            previousTokenHash === tokenEntity.tokenHash &&
            !tokenEntity.isRevoked() &&
            tokenEntity.clientId === clientId
        ) {
            return true
        }

        return false
    }

    isExpired(tokenEntity: RefreshToken): boolean {
        return tokenEntity.isExpired(new Date())
    }

    async hash(token: string): Promise<string> {
        return new Promise(resolve => {
            const hashed = crypto
                .createHmac(this.config.hashingAlgorithm, this.currentSecret())
                .update(token)
                .digest("base64url")

            resolve(hashed)
        })
    }

    private currentSecret(): string {
        const secret = this.config.keysDictionary[this.config.currentKeyId]
        if (!secret) {
            throw new Error(`Current secret not found for key: ${this.config.currentKeyId}`)
        }

        return secret
    }

    private generateToken(): string {
        return crypto.randomBytes(this.config.bytes).toString("base64url")
    }

    private wire(rawToken: string, id: number): string {
        return `${id}.${rawToken}`
    }

    /**
     *
     * @param refreshToken refresh token string in format `<id>.<token>`
     * @returns tuple of [id, rawToken] or null if the token is malformed
     */
    private split(refreshToken: string): [number, string] | null {
        const idx = refreshToken.indexOf(".")
        if (idx <= 0) {
            return null
        }

        const id = AppUtils.parseNumberOrNull(refreshToken.slice(0, idx))

        if (id === null) {
            return null
        }

        return [id, refreshToken.slice(idx + 1)]
    }

    private newExpirationDate(): Date {
        return new Date(Date.now() + this.config.expiresInSeconds * 1000)
    }
}
