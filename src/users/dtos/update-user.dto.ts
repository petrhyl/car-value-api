import { RoleName } from "../role.entity"
import { UpdateUserProfileDto } from "./update-user-profile.dto"
import { IsArray, IsEnum } from "class-validator"

export class UpdateUserDto extends UpdateUserProfileDto {
    @IsArray()
    @IsEnum(RoleName, { each: true })
    roles?: RoleName[]
}
