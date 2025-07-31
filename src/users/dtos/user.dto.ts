import { Expose, Transform } from "class-transformer"
import { User } from "../user.entity"

export class UserDto {
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
