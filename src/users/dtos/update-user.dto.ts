import { IsOptional, IsString, MinLength } from "class-validator"

export class UpdateUserDto {
    @IsString()
    @MinLength(2)
    name: string

    @IsString()
    @MinLength(2)
    @IsOptional()
    nickname?: string
}
