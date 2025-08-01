import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UsersModule } from "./users/users.module"
import { CarReportsModule } from "./car-reports/car-reports.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from "./auth/auth.module"
import { AppSeeder } from "./app.seeder"
import { Role } from "./users/role.entity"
import { User } from "./users/user.entity"
import { RolesGuard } from "./guards/role.guard"
import { APP_GUARD } from "@nestjs/core"
import { AuthenticationGuard } from "./guards/authentication.guard"
import { AppDataSourceOptions } from "./app.data-source"

@Module({
    imports: [
        ConfigModule.forRoot({
            ignoreEnvFile: process.env.NODE_ENV === "production",
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`
        }),
        TypeOrmModule.forRoot({ ...AppDataSourceOptions, autoLoadEntities: true }),
        TypeOrmModule.forFeature([Role, User]),
        UsersModule,
        CarReportsModule,
        AuthModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        AppSeeder,
        { provide: APP_GUARD, useClass: AuthenticationGuard },
        { provide: APP_GUARD, useClass: RolesGuard }
    ]
})
export class AppModule {}
