import { IsInt, IsLatitude, IsLongitude, IsNumber, IsString, Max, Min, MinLength } from "class-validator"

export class CreateCarReportDto {
    @IsNumber()
    @Min(0)
    @Max(1_000_000_000)
    price: number

    @IsString()
    @MinLength(2)
    make: string

    @IsString()
    @MinLength(1)
    model: string

    @IsInt()
    @Min(1886)
    @Max(new Date().getFullYear())
    year: number

    @IsLongitude()
    @IsNumber()
    longitude: number

    @IsLatitude()
    @IsNumber()
    latitude: number

    @IsNumber()
    @Min(0)
    @Max(1_000_000)
    mileage: number
}
