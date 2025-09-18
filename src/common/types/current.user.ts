import { RoleName } from "@/users/entities/role.entity"

export type CurrentUser = {
    id: number
    email: string
    roles: RoleName[]
}
