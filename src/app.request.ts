import { Request } from "express"
import { UserAuthDto } from "./auth/dtos/user-auth.dto"

export interface AppRequest extends Request {
    user?: UserAuthDto
}
