import { Type, Transform } from "class-transformer"
import { IsInt, IsOptional, ValidateNested } from "class-validator"
import { RangeFilter } from "@/common/dtos/range-filter.query"
import { AppUtils } from "@/common/utils/app.utils"
import { OrderCarReportQuery } from "./order-car-report.query"
import { GetEstimateQuery } from "./get-estimate.query"

export class GetAllCarReportsQuery extends GetEstimateQuery {
    @IsOptional()
    @ValidateNested()
    @Type(() => RangeFilter)
    price?: RangeFilter

    @Transform(({ value }) => AppUtils.parseNumberOrNull(value))
    @IsInt()
    offset: number

    @Transform(({ value }) => AppUtils.parseNumberOrNull(value))
    @IsInt()
    limit: number

    @IsOptional()
    @Type(() => OrderCarReportQuery)
    orderBy?: OrderCarReportQuery
}
