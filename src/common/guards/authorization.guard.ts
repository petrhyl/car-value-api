import { ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

export class AuthorizationGuard extends AuthGuard("jwt") {
    canActivate(context: ExecutionContext) {
        // Add any custom logic here if needed
        return super.canActivate(context)
    }

    handleRequest(err: any, user: any, _info: any) {
        if (!user) {
            throw new UnauthorizedException("User is not authenticated")
        }

        if (err) {
            throw err
        }

        return user
    }
}
