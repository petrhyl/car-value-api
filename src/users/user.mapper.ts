import { SignupUserRequest } from "@/auth/dtos/signup-user.request"
import { UserAuthResponse } from "@/auth/dtos/user-auth.response"
import { User } from "./entities/user.entity"

export class UserMapper {
    static toNewEntity(dto: SignupUserRequest): User {
        return new User(dto.email, dto.name, dto.nickname)
    }

    static toAuthDto(user: User, accessToken: string, refreshToken: string): UserAuthResponse {
        const userAuthDto = new UserAuthResponse()
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
