import { IsBoolean } from "class-validator"

export class ApproveCarReportDto {
    @IsBoolean()
    approved: boolean
}
