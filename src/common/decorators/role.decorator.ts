import { RoleName } from "@/users/entities/role.entity"
import { SetMetadata } from "@nestjs/common"

export const ROLES_KEY = "roles"
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles)
