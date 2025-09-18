import { Expose, Transform } from "class-transformer"
import { User } from "../entities/user.entity"

export class UserResponse {
    @Expose()
    id: number

    @Expose()
    email: string

    @Expose()
    name: string

    @Expose()
    nickname: string | null

    @Expose()
    @Transform(({ obj }: { obj: User }) => obj.roles.map(role => role.name))
    roles: string[]
}
