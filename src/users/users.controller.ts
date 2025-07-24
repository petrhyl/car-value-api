import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Put,
    Query
} from "@nestjs/common"
import { UsersService } from "./users.service"
import { AppUtils } from "src/app.utils"
import { UpdateUserDto } from "./dtos/update-user.dto"
import { Serialize } from "src/interceptors/serialize.interceptor"
import { UserDto } from "./dtos/user.dto"
import { Authorized } from "src/decorators/auth.decorator"

@Controller("users")
@Authorized()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Serialize(UserDto)
    @Get()
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

    @Serialize(UserDto)
    @Get(":id")
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

    @Serialize(UserDto)
    @Put(":id")
    async updateUser(@Param("id") id: string, @Body() body: UpdateUserDto) {
        const parsedId = AppUtils.parseNumberOrNull(id)

        if (parsedId === null) {
            throw new BadRequestException("Invalid user ID")
        }

        const result = await this.usersService.update(parsedId, body)

        return result
    }

    @Delete(":id")
    async deleteUser(@Param("id") id: string) {
        const parsedId = AppUtils.parseNumberOrNull(id)

        if (parsedId === null) {
            throw new BadRequestException("Invalid user ID")
        }

        await this.usersService.deleteById(parsedId)

        return { message: "User deleted successfully" }
    }
}
