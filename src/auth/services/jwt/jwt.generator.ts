import { JwtService } from "@nestjs/jwt"
import { jwtConf, JwtConfig } from "./jwt.conf"
import { Inject } from "@nestjs/common"
import { User } from "@/users/entities/user.entity"
import { randomUUID } from "node:crypto"

export default class JwtGenerator {
    public static readonly TokenType = "access"

    constructor(
        private readonly jwtService: JwtService,
        @Inject(jwtConf.KEY) private readonly jwtConfig: JwtConfig
    ) {}

    async generateToken(user: User, sessionId: string, refreshTokenId: string): Promise<string> {
        const claims: Omit<JwtClaims, "aud" | "iss"> = {
            sub: user.id,
            email: user.email,
            roles: user.roles.map(r => r.name),
            iat: Date.now(),
            type: JwtGenerator.TokenType,
            jti: randomUUID(),
            sid: sessionId,
            ver: user.tokenVersion,
            rtid: refreshTokenId
        }

        return this.jwtService.signAsync(claims, {
            expiresIn: this.jwtConfig.expiresIn
        })
    }
}

export type JwtClaims = {
    sub: number
    email: string
    aud: string
    iss: string
    roles: string[]
    iat: number
    type: string
    jti: string
    sid: string
    rtid: string
    ver: number
}
