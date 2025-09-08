import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { CreateUserDto } from "./dtos/create-user.dto"
import { LoginUserDto } from "./dtos/login-user.dto"
import { RefreshTokenDto } from "./dtos/refresh-token.dto"
import { Authorized } from "@/decorators/auth.decorator"
import { CurrentUser } from "@/decorators/current-user.decorator"
import { User } from "@/users/user.entity"
import { Serialize } from "@/interceptors/serialize.interceptor"
import { UserDto } from "@/users/dtos/user.dto"

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("signup")
    @HttpCode(201)
    @Serialize(UserDto)
    async signup(@Body() body: CreateUserDto) {
        return this.authService.signup(body)
    }

    @Post("login")
    @HttpCode(200)
    login(@Body() body: LoginUserDto) {
        return this.authService.login(body)
    }

    @Post("logout")
    @Authorized()
    @HttpCode(204)
    async logout(@CurrentUser() user: User, @Body() body: RefreshTokenDto) {
        await this.authService.logout(user, body)
    }

    @Post("refresh-token")
    @HttpCode(200)
    async refresh(@Body() body: RefreshTokenDto) {
        return this.authService.refreshToken(body)
    }

    @Get("current-user")
    @Authorized()
    @Serialize(UserDto)
    currentUser(@CurrentUser() user: User) {
        return user
    }
}
