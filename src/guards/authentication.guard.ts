import { Injectable, ExecutionContext } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class AuthenticationGuard extends AuthGuard("jwt") {
    handleRequest<TUser = any>(
        _err: any,
        user: TUser,
        _info: any,
        _context: ExecutionContext,
        _status?: any
    ): TUser {
        return user
    }
}
