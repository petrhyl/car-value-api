import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UsersModule } from "./users/users.module"
import { ReportsModule } from "./reports/reports.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from "./users/user.entity"
import { Report } from "./reports/report.entity"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { AuthModule } from "./auth/auth.module"
import { RefreshToken } from "./auth/refresh-token.entity"

@Module({
    imports: [
        ConfigModule.forRoot({
            ignoreEnvFile: process.env.NODE_ENV === "production",
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "sqlite",
                database: configService.get("DB_NAME"),
                entities: [User, Report, RefreshToken],
                synchronize: configService.get("DB_SCHEMA_SYNC") === "true"
            })
        }),
        UsersModule,
        ReportsModule,
        AuthModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
