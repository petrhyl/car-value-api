import { AppRequest } from "@/app.request"
import { ROLES_KEY } from "@/decorators/role.decorator"
import { RoleName } from "@/users/role.entity"
import { User } from "@/users/user.entity"
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Request } from "express"

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

    static hasRoles(user: User, roles: RoleName[]): boolean {
        if (!user || !user.roles?.length) {
            return false
        }

        return user.roles.some(role => roles.includes(role.name))
    }
}
