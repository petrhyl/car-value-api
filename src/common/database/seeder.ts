import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Role, RoleName } from "@/users/entities/role.entity"
import { User } from "@/users/entities/user.entity"
import * as argon2 from "argon2"

@Injectable()
export class Seeder implements OnApplicationBootstrap {
    private readonly logger: Logger

    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {
        this.logger = new Logger(Seeder.name)
    }

    async onApplicationBootstrap() {
        const roles = [
            { name: RoleName.ADMIN, description: "Administrator with full access" },
            { name: RoleName.USER, description: "Regular user with limited access" },
            { name: RoleName.MODERATOR, description: "Moderator with elevated privileges" }
        ]

        let adminRole: Role

        for (const role of roles) {
            let existingRole = await this.roleRepository.findOneBy({ name: role.name })
            if (!existingRole) {
                existingRole = this.roleRepository.create(role)
                await this.roleRepository.save(existingRole)
                this.logger.log(`Role "${role.name}" seeded successfully`)
            }

            if (role.name === RoleName.ADMIN) {
                adminRole = existingRole
            }
        }

        const adminUser = await this.userRepository.findOneBy({ name: "app" })
        if (!adminUser) {
            const newAdmin = this.userRepository.create({
                email: "admin@example.com",
                name: "app",
                passwordHash: await argon2.hash("Pa$$sw0rd"),
                roles: [adminRole!]
            })

            await this.userRepository.save(newAdmin)

            this.logger.log("Admin user seeded successfully")
        }
    }
}
