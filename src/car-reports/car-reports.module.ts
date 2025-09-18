import { Module } from "@nestjs/common"
import { CarReportsService } from "./car-reports.service"
import { CarReportsController } from "./car-reports.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { CarReport } from "./entities/car-report.entity"
import { carReportsRepositoryProvider } from "./car-reports.repository.provider"

@Module({
    imports: [TypeOrmModule.forFeature([CarReport])],
    providers: [CarReportsService, carReportsRepositoryProvider],
    controllers: [CarReportsController]
})
export class CarReportsModule {}
