import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Put, Query } from "@nestjs/common"
import { CarReportsService } from "./car-reports.service"
import { CreateCarReportDto } from "./dtos/create-car-report.dto"
import { Authorized } from "@/decorators/auth.decorator"
import { CurrentUser } from "@/decorators/current-user.decorator"
import { Serialize } from "@/interceptors/serialize.interceptor"
import { CarReportDto } from "./dtos/car-report.dto"
import { ApproveCarReportDto } from "./dtos/approve-car-report.dto"
import { Roles } from "@/decorators/role.decorator"
import { RoleName } from "@/users/role.entity"
import { GetAllCarReportsQuery } from "./dtos/get-all-car-reports.query"
import { GetEstimateQuery } from "./dtos/get-estimate.query"
import { User } from "@/users/user.entity"

@Controller("reports")
export class CarReportsController {
    constructor(private readonly reportsService: CarReportsService) {}

    @Post()
    @Authorized()
    @Serialize(CarReportDto)
    async createReport(@Body() report: CreateCarReportDto, @CurrentUser() user: User) {
        return await this.reportsService.create(user, report)
    }

    @Get("estimate")
    async getEstimate(@Query() query: GetEstimateQuery, @CurrentUser() user: User) {
        const result = await this.reportsService.generateEstimate(query, user)

        if (!result) {
            throw new NotFoundException("No reports found to generate the estimate")
        }

        return result
    }

    @Get(":id")
    @Serialize(CarReportDto)
    async getReportById(@Param("id") id: number) {
        const result = await this.reportsService.findById(id)
        if (!result) {
            throw new NotFoundException("Report not found")
        }

        return result
    }

    @Get()
    @Serialize(CarReportDto)
    async getReports(@Query() query: GetAllCarReportsQuery, @CurrentUser() user: User) {
        return await this.reportsService.findList(query, user)
    }

    @Patch(":id/approval")
    @Authorized()
    @Serialize(CarReportDto)
    @Roles(RoleName.ADMIN, RoleName.MODERATOR)
    async changeReportApproval(@Param("id") id: number, @Body() body: ApproveCarReportDto) {
        const result = await this.reportsService.changeApproval(id, body.approved)
        if (!result) {
            throw new NotFoundException("Report not found")
        }

        return result
    }

    @Put(":id")
    @Authorized()
    @Serialize(CarReportDto)
    async updateReport(@Param("id") id: number, @Body() body: CreateCarReportDto, @CurrentUser() user: User) {
        const result = await this.reportsService.update(id, user, body)
        if (!result) {
            throw new NotFoundException("Report not found")
        }

        return result
    }
}
