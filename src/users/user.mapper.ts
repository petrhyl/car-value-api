import { CreateUserDto } from "../auth/dtos/create-user.dto"
import { UserAuthDto } from "../auth/dtos/user-auth.dto"
import { User } from "./user.entity"

export class UserMapper {
    static toNewEntity(dto: CreateUserDto): User {
        return new User(dto.email, dto.name, dto.nickname)
    }

    static toAuthDto(user: User, accessToken: string, refreshToken: string): UserAuthDto {
        const userAuthDto = new UserAuthDto()
        userAuthDto.id = user.id
        userAuthDto.email = user.email
        userAuthDto.name = user.name
        userAuthDto.nickname = user.nickname
        userAuthDto.accessToken = accessToken
        userAuthDto.refreshToken = refreshToken
        userAuthDto.roles = user.roles.map(role => role.name)

        return userAuthDto
    }
}
