import { OrderByValue } from "@/common/dtos/order-by-value.enum"
import { IsEnum, IsOptional } from "class-validator"

export class OrderCarReportQuery {
    @IsOptional()
    @IsEnum(OrderByValue)
    make?: OrderByValue

    @IsOptional()
    @IsEnum(OrderByValue)
    model?: OrderByValue

    @IsOptional()
    @IsEnum(OrderByValue)
    year?: OrderByValue

    @IsOptional()
    @IsEnum(OrderByValue)
    price?: OrderByValue

    @IsOptional()
    @IsEnum(OrderByValue)
    mileage?: OrderByValue
}
