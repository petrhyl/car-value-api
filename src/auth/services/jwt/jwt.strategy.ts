import { Inject, Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { JwtConfig, jwtConf } from "./jwt.conf"
import { CurrentUser } from "@/common/types/current.user"
import { RoleName } from "@/users/entities/role.entity"
import JwtGenerator, { JwtClaims } from "./jwt.generator"
import AuthRevocationService from "../auth.revocation.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(jwtConf.KEY) jwtConfig: JwtConfig,
        private readonly authRevocationService: AuthRevocationService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConfig.secret,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audApi
        })
    }

    async validate(payload: JwtClaims): Promise<CurrentUser | null> {
        if (payload.type !== JwtGenerator.TokenType) {
            return null
        }

        const isRevoked = await this.authRevocationService.isTokenRevoked(
            payload.sub.toString(),
            payload.rtid,
            payload.sid,
            payload.ver.toString()
        )

        if (isRevoked) {
            return null
        }

        return {
            id: payload.sub,
            email: payload.email,
            roles: payload.roles as RoleName[]
        }
    }
}
