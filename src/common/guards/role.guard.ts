import { AppRequest } from "@/common/types/app.request"
import { ROLES_KEY } from "@/common/decorators/role.decorator"
import { RoleName } from "@/users/entities/role.entity"
import { User } from "@/users/entities/user.entity"
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { CurrentUser } from "@/common/types/current.user"

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if (!requiredRoles?.length) {
            return true
        }

        const { user } = context.switchToHttp().getRequest<AppRequest>()

        if (!user?.roles) {
            return false
        }

        return RolesGuard.hasRoles(user, requiredRoles)
    }

    static hasRoles(user: CurrentUser | null, roles: RoleName[]): boolean {
        if (!user || !user.roles?.length) {
            return false
        }

        return roles.some(r => user.roles.includes(r))
    }

    static hasUserRoles(user: User, roles: RoleName[]): boolean {
        if (!user || !user.roles?.length) {
            return false
        }

        return user.roles.some(role => roles.includes(role.name))
    }
}
