import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Put,
    Query
} from "@nestjs/common"
import { UsersService } from "./users.service"
import { AppUtils } from "@/common/utils/app.utils"
import { UpdateUserProfileRequest } from "@/users/dtos/update-user-profile.request"
import { Serialize } from "@/common/interceptors/serialize.interceptor"
import { UserResponse } from "@/users/dtos/user.response"
import { Authorized } from "@/common/decorators/auth.decorator"
import { Roles } from "@/common/decorators/role.decorator"
import { RoleName } from "@/users/entities/role.entity"
import { AuthUser } from "@/common/decorators/auth-user.decorator"
import { RolesGuard } from "@/common/guards/role.guard"
import { UpdateUserRequest } from "./dtos/update-user.request"
import { CurrentUser } from "@/common/types/current.user"

@Controller("users")
@Authorized()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(RoleName.ADMIN, RoleName.MODERATOR)
    @Serialize(UserResponse)
    getAllUsers(@Query("offset") offset?: string, @Query("limit") limit?: string) {
        const parsedOffset = AppUtils.parseNumberOrNull(offset) || 0
        const parsedLimit = AppUtils.parseNumberOrNull(limit) || 10

        if (
            parsedOffset < 0 ||
            parsedLimit <= 0 ||
            parsedOffset > UsersService.MAX_OFFSET ||
            parsedLimit > UsersService.MAX_LIMIT
        ) {
            throw new BadRequestException("Invalid offset or limit")
        }

        return this.usersService.findAll(parsedOffset, parsedLimit)
    }

    @Get(":id")
    @Roles(RoleName.ADMIN, RoleName.MODERATOR)
    @Serialize(UserResponse)
    async getUser(@Param("id") id: string) {
        const parsedId = AppUtils.parseNumberOrNull(id)

        if (parsedId === null) {
            throw new BadRequestException("Invalid user ID")
        }

        const user = await this.usersService.findById(parsedId)

        if (!user) {
            throw new NotFoundException("User not found")
        }

        return user
    }

    @Put(":id")
    @Roles(RoleName.ADMIN)
    @Serialize(UserResponse)
    async updateUser(@Param("id") id: string, @Body() body: UpdateUserRequest) {
        const parsedId = AppUtils.parseNumberOrNull(id)

        if (parsedId === null) {
            throw new BadRequestException("Invalid user ID")
        }

        const result = await this.usersService.update(parsedId, body)

        if (!result) {
            throw new NotFoundException("User not found")
        }

        return result
    }

    @Put(":id/profile")
    @Serialize(UserResponse)
    async updateUserProfile(
        @AuthUser() user: CurrentUser,
        @Param("id") id: string,
        @Body() body: UpdateUserProfileRequest
    ) {
        const parsedId = AppUtils.parseNumberOrNull(id)

        if (parsedId === null) {
            throw new BadRequestException("Invalid user ID")
        }

        if (user.id !== parsedId && RolesGuard.hasRoles(user, [RoleName.ADMIN]) === false) {
            throw new ForbiddenException("Cannot update this user")
        }

        const result = await this.usersService.updateProfile(parsedId, body)

        if (!result) {
            throw new NotFoundException("User not found")
        }

        return result
    }

    @Delete(":id")
    @Roles(RoleName.ADMIN)
    async deleteUser(@Param("id") id: string) {
        const parsedId = AppUtils.parseNumberOrNull(id)

        if (parsedId === null) {
            throw new BadRequestException("Invalid user ID")
        }

        await this.usersService.deleteById(parsedId)

        return { message: "User deleted successfully" }
    }
}
