import { ForbiddenException, Inject, Injectable } from "@nestjs/common"
import { CreateCarReportDto } from "./dtos/create-car-report.dto"
import { CarReport } from "./car-report.entity"
import { UserAuthDto } from "@/auth/dtos/user-auth.dto"
import { RolesGuard } from "@/guards/role.guard"
import { RoleName } from "@/users/role.entity"
import { GetAllCarReportsQuery } from "./dtos/get-all-car-reports.query"
import { EstimateDto } from "./dtos/estimate.dto"
import { GetEstimateQuery } from "./dtos/get-estimate.query"
import { CAR_REPORTS_REPOSITORY, CarReportRepository } from "./car-reports.repository.provider"

@Injectable()
export class CarReportsService {
    constructor(@Inject(CAR_REPORTS_REPOSITORY) private readonly reportsRepository: CarReportRepository) {}

    async create(user: UserAuthDto, report: CreateCarReportDto) {
        const newReport = this.reportsRepository.create(report)
        newReport.creatorId = user.id

        return await this.reportsRepository.save(newReport)
    }

    async findById(id: number): Promise<CarReport | null> {
        return await this.reportsRepository.findOne({
            where: { id },
            relations: ["creator"]
        })
    }

    async findList(query: GetAllCarReportsQuery, user: UserAuthDto): Promise<CarReport[]> {
        if (!RolesGuard.hasRoles(user, [RoleName.ADMIN, RoleName.MODERATOR])) {
            query.approved = true
        }

        return this.reportsRepository.findWithFilters(query)
    }

    async changeApproval(id: number, approved: boolean): Promise<CarReport | null> {
        const report = await this.findById(id)
        if (!report) {
            return null
        }

        if (report.approved === approved) {
            return report
        }

        report.approved = approved
        return await this.reportsRepository.save(report)
    }

    async update(id: number, user: UserAuthDto, reportData: CreateCarReportDto): Promise<CarReport | null> {
        const report = await this.findById(id)
        if (!report) {
            return null
        }

        if (
            report.creatorId !== user.id &&
            RolesGuard.hasRoles(user, [RoleName.ADMIN, RoleName.MODERATOR]) === false
        ) {
            throw new ForbiddenException("You do not have permission to update this report")
        }

        Object.assign(report, reportData)
        report.approved = false

        return await this.reportsRepository.save(report)
    }

    async generateEstimate(query: GetEstimateQuery, user: UserAuthDto): Promise<EstimateDto | null> {
        if (!RolesGuard.hasRoles(user, [RoleName.ADMIN, RoleName.MODERATOR])) {
            query.approved = true
        }

        return this.reportsRepository.getAveragePriceWithCount(query)
    }
}
