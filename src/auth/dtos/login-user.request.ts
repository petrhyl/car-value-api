import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class LoginUserRequest {
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    clientId: string
}
