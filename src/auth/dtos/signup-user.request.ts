import { IsEmail, IsOptional, IsString, IsStrongPassword, MinLength } from "class-validator"

export class SignupUserRequest {
    @IsEmail()
    email: string

    @IsString()
    @MinLength(2)
    name: string

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    password: string

    @IsString()
    @MinLength(2)
    @IsOptional()
    nickname?: string
}
