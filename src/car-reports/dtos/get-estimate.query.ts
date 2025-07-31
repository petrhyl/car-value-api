import { AppUtils } from "@/app.utils"
import { RangeFilter } from "@/common/dtos/range-filter.query"
import { Transform, Type } from "class-transformer"
import {
    IsBoolean,
    IsLatitude,
    IsLongitude,
    IsOptional,
    IsString,
    MinLength,
    ValidateNested
} from "class-validator"

export class GetEstimateQuery {
    @IsOptional()
    @ValidateNested()
    @Type(() => RangeFilter)
    year?: RangeFilter

    @IsOptional()
    @ValidateNested()
    @Type(() => RangeFilter)
    mileage?: RangeFilter

    @IsOptional()
    @IsString()
    @MinLength(2)
    make?: string

    @IsOptional()
    @IsString()
    @MinLength(1)
    model?: string

    @IsOptional()
    @Transform(({ value }) => AppUtils.parseNumberOrNull(value))
    @IsLongitude()
    longitude?: number

    @IsOptional()
    @Transform(({ value }) => AppUtils.parseNumberOrNull(value))
    @IsLatitude()
    latitude?: number

    @IsOptional()
    @IsBoolean()
    approved?: boolean
}
