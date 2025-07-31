import { IsOptional, IsString, MinLength } from "class-validator"

export class UpdateUserProfileDto {
    @IsString()
    @MinLength(2)
    name: string

    @IsString()
    @MinLength(2)
    @IsOptional()
    nickname?: string
}
