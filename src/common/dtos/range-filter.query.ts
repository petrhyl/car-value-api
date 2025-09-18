import { AppUtils } from "@/common/utils/app.utils"
import { Transform } from "class-transformer"
import { IsOptional, IsInt } from "class-validator"
import { AtLeastOneField } from "../validators/at-least-one-field.validator"

export class RangeFilter {
    @IsOptional()
    @Transform(({ value }) => AppUtils.parseNumberOrNull(value))
    @IsInt()
    gte?: number

    @IsOptional()
    @Transform(({ value }) => AppUtils.parseNumberOrNull(value))
    @IsInt()
    lte?: number

    @IsOptional()
    @Transform(({ value }) => AppUtils.parseNumberOrNull(value))
    @IsInt()
    eq?: number

    @AtLeastOneField()
    private readonly atLeastOneFieldCheck?: never
}
