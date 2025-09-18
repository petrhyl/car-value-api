import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnprocessableEntityException
} from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { UpdateUserProfileRequest } from "./dtos/update-user-profile.request"
import { Role, RoleName } from "./entities/role.entity"
import { UpdateUserRequest } from "./dtos/update-user.request"

@Injectable()
export class UsersService {
    static readonly MAX_OFFSET = 100_000_000
    static readonly MAX_LIMIT = 1_000

    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        @InjectRepository(Role) private readonly rolesRepository: Repository<Role>
    ) {}

    async create(user: User): Promise<User> {
        const existingUser = await this.usersRepository.findOneBy({ email: user.email })
        if (existingUser) {
            throw new UnprocessableEntityException("User with this e-mail already exists")
        }

        const role = await this.rolesRepository.findOneBy({ name: RoleName.USER })
        if (!role) {
            throw new InternalServerErrorException("Default user role not found")
        }

        user.roles = [role]

        return this.usersRepository.save(user)
    }

    async findById(id: number): Promise<User | null> {
        return this.usersRepository.findOneBy({ id })
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email })
    }

    async findAll(offset: number, limit: number): Promise<User[]> {
        return this.usersRepository.find({
            skip: offset,
            take: limit
        })
    }

    async update(id: number, user: UpdateUserRequest): Promise<User | null> {
        const existingUser = await this.usersRepository.findOneBy({ id })

        if (!existingUser) {
            return null
        }

        existingUser.name = user.name || existingUser.name
        if (user.nickname) {
            existingUser.nickname = user.nickname
        }

        return this.usersRepository.save(existingUser)
    }

    async updateUserEntity(user: User): Promise<User> {
        return this.usersRepository.save(user)
    }

    async updateProfile(userId: number, user: UpdateUserProfileRequest): Promise<User | null> {
        const existingUser = await this.usersRepository.findOneBy({ id: userId })

        if (!existingUser) {
            return null
        }

        existingUser.name = user.name || existingUser.name
        if (user.nickname) {
            existingUser.nickname = user.nickname
        }

        return this.usersRepository.save(existingUser)
    }

    async deleteById(id: number): Promise<void> {
        const existingUser = await this.usersRepository.findOneBy({ id })

        if (!existingUser) {
            throw new NotFoundException("User not found")
        }

        await this.usersRepository.remove(existingUser)
    }

    async incrementTokenVersion(user: User): Promise<void> {
        user.tokenVersion += 1
        await this.usersRepository.save(user)
    }
}
