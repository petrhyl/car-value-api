import { Request } from "express"
import { CurrentUser } from "./current.user"

export interface AppRequest extends Request {
    user?: CurrentUser
}
