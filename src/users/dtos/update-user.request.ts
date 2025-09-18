import { RoleName } from "../entities/role.entity"
import { UpdateUserProfileRequest } from "./update-user-profile.request"
import { IsArray, IsEnum } from "class-validator"

export class UpdateUserRequest extends UpdateUserProfileRequest {
    @IsArray()
    @IsEnum(RoleName, { each: true })
    roles?: RoleName[]
}
