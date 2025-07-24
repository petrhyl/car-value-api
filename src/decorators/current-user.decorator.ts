import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { AppRequest } from "src/app.request"

export const CurrentUser = createParamDecorator((data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AppRequest>()

    return request.user
})
