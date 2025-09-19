import { Module } from "@nestjs/common"
import { UsersModule } from "@/users/users.module"
import { CarReportsModule } from "@/car-reports/car-reports.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { AuthModule } from "@/auth/auth.module"
import { Seeder } from "@/common/database/seeder"
import { Role } from "@/users/entities/role.entity"
import { User } from "@/users/entities/user.entity"
import { RolesGuard } from "@/common/guards/role.guard"
import { APP_GUARD } from "@nestjs/core"
import { AuthenticationGuard } from "@/common/guards/authentication.guard"
import { validateEnv } from "@/common/config/env-vars.validation"
import { databaseOptionsFactory } from "@/common/database/database.options.factory"
import { databaseConf } from "@/common/database/database.conf"
import { jwtConf } from "@/auth/services/jwt/jwt.conf"
import { refreshTokenServiceConf } from "@/auth/services/refresh-token/refresh-token.conf"
import { authRedisConf } from "@/auth/store/auth.redis.config"
import { cacheRedisConf } from "./common/cache/cache.redis.config"
import CacheRedisModule from "./common/cache/cache.redis.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            ignoreEnvFile: process.env.NODE_ENV === "production",
            isGlobal: true,
            expandVariables: true,
            envFilePath: `.env.${process.env.NODE_ENV}`,
            validate: validateEnv,
            load: [databaseConf, jwtConf, refreshTokenServiceConf, authRedisConf, cacheRedisConf]
        }),
        TypeOrmModule.forRootAsync({
            useFactory: databaseOptionsFactory,
            inject: [ConfigService]
        }),
        TypeOrmModule.forFeature([Role, User]),
        CacheRedisModule,
        UsersModule,
        CarReportsModule,
        AuthModule
    ],
    providers: [
        Seeder,
        { provide: APP_GUARD, useClass: AuthenticationGuard },
        { provide: APP_GUARD, useClass: RolesGuard }
    ]
})
export class AppModule {}
