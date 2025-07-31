import { Module } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from "./user.entity"
import { Role } from "./role.entity"

@Module({
    imports: [TypeOrmModule.forFeature([User, Role])],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService]
})
export class UsersModule {}
