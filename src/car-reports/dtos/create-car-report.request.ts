import {
    IsInt,
    IsLatitude,
    IsLongitude,
    IsNumber,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength
} from "class-validator"

export class CreateCarReporRequest {
    @IsNumber()
    @Min(0)
    @Max(1_000_000_000)
    price: number

    @IsString()
    @MinLength(2)
    @MaxLength(100)
    make: string

    @IsString()
    @MinLength(1)
    @MaxLength(100)
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
