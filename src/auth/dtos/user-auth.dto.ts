import { Expose } from "class-transformer"
import { UserDto } from "../../users/dtos/user.dto"

export class UserAuthDto extends UserDto {
    @Expose()
    accessToken: string

    @Expose()
    refreshToken: string
}
