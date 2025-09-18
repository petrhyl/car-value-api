import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UsersModule } from "@/users/users.module"
import { JwtModule } from "@nestjs/jwt"
import { JwtStrategy } from "./services/jwt/jwt.strategy"
import { ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RefreshToken } from "./entities/refresh-token.entity"
import { RefreshTokenService } from "./services/refresh-token/refresh-token.service"
import JwtGenerator from "./services/jwt/jwt.generator"
import { JwtConfig } from "./services/jwt/jwt.conf"
import AuthRevocationService from "./services/auth.revocation.service"
import AuthRedisProvider from "./store/auth.redis.provider"

@Module({
    imports: [
        TypeOrmModule.forFeature([RefreshToken]),
        UsersModule,
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
    ],
    providers: [
        AuthService,
        JwtStrategy,
        RefreshTokenService,
        JwtGenerator,
        AuthRedisProvider,
        AuthRevocationService
    ],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule {}
