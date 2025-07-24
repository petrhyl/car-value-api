import { UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

export function Authorized() {
    return UseGuards(AuthGuard("jwt"))
}
