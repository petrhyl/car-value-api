import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { AppRequest } from "@/common/types/app.request"
import { CurrentUser } from "@/common/types/current.user"

export const AuthUser = createParamDecorator<never, CurrentUser | undefined>(
    (_data: never, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<AppRequest>()

        return request.user
    }
)
