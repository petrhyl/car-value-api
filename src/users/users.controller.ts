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
import { AppUtils } from "../app.utils"
import { UpdateUserProfileDto } from "./dtos/update-user-profile.dto"
import { Serialize } from "../interceptors/serialize.interceptor"
import { UserDto } from "./dtos/user.dto"
import { Authorized } from "../decorators/auth.decorator"
import { Roles } from "@/decorators/role.decorator"
import { RoleName } from "./role.entity"
import { CurrentUser } from "@/decorators/current-user.decorator"
import { UserAuthDto } from "@/auth/dtos/user-auth.dto"
import { RolesGuard } from "@/guards/role.guard"
import { UpdateUserDto } from "./dtos/update-user.dto"

@Controller("users")
@Authorized()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(RoleName.ADMIN, RoleName.MODERATOR)
    @Serialize(UserDto)
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
    @Serialize(UserDto)
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
    @Serialize(UserDto)
    async updateUser(@CurrentUser() user: UserAuthDto, @Param("id") id: string, @Body() body: UpdateUserDto) {
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
    @Serialize(UserDto)
    async updateUserProfile(
        @CurrentUser() user: UserAuthDto,
        @Param("id") id: string,
        @Body() body: UpdateUserProfileDto
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
