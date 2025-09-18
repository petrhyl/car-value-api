import { Expose } from "class-transformer"
import { UserResponse } from "../../users/dtos/user.response"

export class UserAuthResponse extends UserResponse {
    @Expose()
    accessToken: string

    @Expose()
    refreshToken: string
}
