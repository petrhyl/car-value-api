import { IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class UpdateUserProfileRequest {
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    name: string

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    nickname?: string
}
