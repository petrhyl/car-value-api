import { IsBoolean } from "class-validator"

export class ApproveCarReportRequest {
    @IsBoolean()
    approved: boolean
}
