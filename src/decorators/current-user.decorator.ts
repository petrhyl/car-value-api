import { UserAuthDto } from "@/auth/dtos/user-auth.dto"
import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { AppRequest } from "src/app.request"

export const CurrentUser = createParamDecorator<never, UserAuthDto | undefined>(
    (_data: never, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<AppRequest>()

        return request.user
    }
)
