import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class RefreshTokenDto {
    @IsNumber()
    userId: number

    @IsString()
    @IsNotEmpty()
    refreshToken: string

    @IsString()
    @IsNotEmpty()
    clientId: string
}
