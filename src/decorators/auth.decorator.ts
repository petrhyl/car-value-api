import { AuthorizationGuard } from "@/guards/authorization.guard"
import { UseGuards } from "@nestjs/common"

export function Authorized() {
    return UseGuards(AuthorizationGuard)
}
