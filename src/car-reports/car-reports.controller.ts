import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Put, Query } from "@nestjs/common"
import { CarReportsService } from "./car-reports.service"
import { CreateCarReporRequest } from "./dtos/create-car-report.request"
import { Authorized } from "@/common/decorators/auth.decorator"
import { AuthUser } from "@/common/decorators/auth-user.decorator"
import { Serialize } from "@/common/interceptors/serialize.interceptor"
import { CarReportResponse } from "./dtos/car-report.response"
import { ApproveCarReportRequest } from "./dtos/approve-car-report.request"
import { Roles } from "@/common/decorators/role.decorator"
import { RoleName } from "@/users/entities/role.entity"
import { GetAllCarReportsQuery } from "./dtos/get-all-car-reports.query"
import { GetEstimateQuery } from "./dtos/get-estimate.query"
import { CurrentUser } from "@/common/types/current.user"

@Controller("reports")
export class CarReportsController {
    constructor(private readonly reportsService: CarReportsService) {}

    @Post()
    @Authorized()
    @Serialize(CarReportResponse)
    async createReport(@Body() report: CreateCarReporRequest, @AuthUser() user: CurrentUser) {
        return await this.reportsService.create(user.id, report)
    }

    @Get("estimate")
    async getEstimate(@Query() query: GetEstimateQuery, @AuthUser() user: CurrentUser) {
        const result = await this.reportsService.generateEstimate(query, user)

        if (!result) {
            throw new NotFoundException("No reports found to generate the estimate")
        }

        return result
    }

    @Get(":id")
    @Serialize(CarReportResponse)
    async getReportById(@Param("id") id: number) {
        const result = await this.reportsService.findById(id)
        if (!result) {
            throw new NotFoundException("Report not found")
        }

        return result
    }

    @Get()
    @Serialize(CarReportResponse)
    async getReports(@Query() query: GetAllCarReportsQuery, @AuthUser() user: CurrentUser) {
        return await this.reportsService.findList(query, user)
    }

    @Patch(":id/approval")
    @Authorized()
    @Serialize(CarReportResponse)
    @Roles(RoleName.ADMIN, RoleName.MODERATOR)
    async changeReportApproval(@Param("id") id: number, @Body() body: ApproveCarReportRequest) {
        const result = await this.reportsService.changeApproval(id, body.approved)
        if (!result) {
            throw new NotFoundException("Report not found")
        }

        return result
    }

    @Put(":id")
    @Authorized()
    @Serialize(CarReportResponse)
    async updateReport(
        @Param("id") id: number,
        @Body() body: CreateCarReporRequest,
        @AuthUser() user: CurrentUser
    ) {
        const result = await this.reportsService.update(id, user, body)
        if (!result) {
            throw new NotFoundException("Report not found")
        }

        return result
    }
}
