import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UsersModule } from "./users/users.module"
import { ReportsModule } from "./reports/reports.module"
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from "./users/user.entity"
import { Report } from "./reports/report.entity"
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from "./auth/auth.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            ignoreEnvFile: process.env.NODE_ENV === "production",
            isGlobal: true
        }),
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: "car_value.db",
            entities: [User, Report],
            synchronize: process.env.DB_SCHEMA_SYNC === "true"
        }),
        UsersModule,
        ReportsModule,
        AuthModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
