import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { AppRequest } from "@/app.request"
import { User } from "@/users/user.entity"

export const CurrentUser = createParamDecorator<never, User | undefined>(
    (_data: never, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<AppRequest>()

        return request.user
    }
)
