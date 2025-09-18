import { IsNotEmpty, IsString, MaxLength } from "class-validator"

export class RefreshTokenRequest {
    @IsString()
    @IsNotEmpty()
    refreshToken: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    clientId: string
}
