import { Body, Controller, Get, HttpCode, NotFoundException, Post } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { SignupUserRequest } from "./dtos/signup-user.request"
import { LoginUserRequest } from "./dtos/login-user.request"
import { RefreshTokenRequest } from "./dtos/refresh-token.request"
import { Authorized } from "@/common/decorators/auth.decorator"
import { AuthUser } from "@/common/decorators/auth-user.decorator"
import { Serialize } from "@/common/interceptors/serialize.interceptor"
import { UserResponse } from "@/users/dtos/user.response"
import { CurrentUser } from "@/common/types/current.user"
import { UsersService } from "@/users/users.service"

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    @Post("signup")
    @HttpCode(201)
    @Serialize(UserResponse)
    async signup(@Body() body: SignupUserRequest) {
        return this.authService.signup(body)
    }

    @Post("login")
    @HttpCode(200)
    login(@Body() body: LoginUserRequest) {
        return this.authService.login(body)
    }

    @Post("logout")
    @Authorized()
    @HttpCode(204)
    async logout(@AuthUser() user: CurrentUser, @Body() body: RefreshTokenRequest) {
        await this.authService.logout(user, body)
    }

    @Post("refresh-token")
    @HttpCode(200)
    async refresh(@Body() body: RefreshTokenRequest) {
        return this.authService.refreshToken(body)
    }

    @Get("current-user")
    @Authorized()
    @Serialize(UserResponse)
    async currentUser(@AuthUser() user: CurrentUser) {
        console.log("user", user)

        const userEntity = await this.usersService.findById(user.id)

        if (!userEntity) {
            throw new NotFoundException("User not found")
        }

        return userEntity
    }
}
