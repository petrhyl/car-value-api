import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { UsersService } from "../users/users.service"
import { plainToInstance } from "class-transformer"
import { UserAuthDto } from "./dtos/user-auth.dto"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly usersService: UsersService
    ) {
        const jwtSecret = configService.get<string>("JWT_SECRET")
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in environment variables")
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret
        })
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.findById(payload.sub)
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            return null
        }

        const authUser = plainToInstance(UserAuthDto, user, {
            excludeExtraneousValues: true
        })

        return authUser
    }
}

export type JwtPayload = {
    sub: number
    email: string
    tokenVersion: number
}
