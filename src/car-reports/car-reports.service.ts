import { ForbiddenException, Inject, Injectable } from "@nestjs/common"
import { CreateCarReporRequest } from "./dtos/create-car-report.request"
import { CarReport } from "./entities/car-report.entity"
import { RolesGuard } from "@/common/guards/role.guard"
import { RoleName } from "@/users/entities/role.entity"
import { GetAllCarReportsQuery } from "./dtos/get-all-car-reports.query"
import { EstimateResponse } from "./dtos/estimate.response"
import { GetEstimateQuery } from "./dtos/get-estimate.query"
import { CAR_REPORTS_REPOSITORY, CarReportRepository } from "./car-reports.repository.provider"
import { CurrentUser } from "@/common/types/current.user"

@Injectable()
export class CarReportsService {
    constructor(@Inject(CAR_REPORTS_REPOSITORY) private readonly reportsRepository: CarReportRepository) {}

    async create(userId: number, report: CreateCarReporRequest) {
        const newReport = this.reportsRepository.create(report)
        newReport.creatorId = userId

        return await this.reportsRepository.save(newReport)
    }

    async findById(id: number): Promise<CarReport | null> {
        return await this.reportsRepository.findOne({
            where: { id },
            relations: ["creator"]
        })
    }

    async findList(query: GetAllCarReportsQuery, user: CurrentUser | null): Promise<CarReport[]> {
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

    async update(
        id: number,
        user: CurrentUser,
        reportData: CreateCarReporRequest
    ): Promise<CarReport | null> {
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

    async generateEstimate(
        query: GetEstimateQuery,
        user: CurrentUser | null
    ): Promise<EstimateResponse | null> {
        if (!RolesGuard.hasRoles(user, [RoleName.ADMIN, RoleName.MODERATOR])) {
            query.approved = true
        }

        return this.reportsRepository.getAveragePriceWithCount(query)
    }
}
