import { Body, Controller, Get, HttpCode, Post, UnauthorizedException, Query } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { CreateUserDto } from "./dtos/create-user.dto"
import { LoginUserDto } from "./dtos/login-user.dto"
import { RefreshTokenDto } from "./dtos/refresh-token.dto"
import { Authorized } from "src/decorators/auth.decorator"
import { CurrentUser } from "src/decorators/current-user.decorator"
import { User } from "src/users/user.entity"
import { Serialize } from "src/interceptors/serialize.interceptor"
import { UserDto } from "src/users/dtos/user.dto"

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("signup")
    @HttpCode(201)
    async signup(@Body() body: CreateUserDto) {
        await this.authService.signup(body)
    }

    @Post("login")
    login(@Body() body: LoginUserDto) {
        return this.authService.login(body)
    }

    @Post("logout")
    @Authorized()
    @HttpCode(204)
    async logout(@CurrentUser() user: User, @Query("clientId") clientId: string) {
        if (!clientId) {
            throw new UnauthorizedException("clientId is required")
        }
        await this.authService.logout(user, clientId)
    }

    @Post("refresh")
    async refresh(@Body() body: RefreshTokenDto) {
        return this.authService.refreshToken(body)
    }

    @Get("current-user")
    @Authorized()
    @Serialize(UserDto)
    currentUser(@CurrentUser() user: User) {
        if (!user) {
            throw new UnauthorizedException("User is not authenticated")
        }

        return user
    }
}
