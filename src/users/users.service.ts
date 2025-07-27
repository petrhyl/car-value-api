import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common"
import { Repository } from "typeorm"
import { User } from "./user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { UpdateUserDto } from "./dtos/update-user.dto"

@Injectable()
export class UsersService {
    static readonly MAX_OFFSET = 100_000_000
    static readonly MAX_LIMIT = 1_000

    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

    async create(user: User): Promise<User> {
        const existingUser = await this.usersRepository.findOneBy({ email: user.email })
        if (existingUser) {
            throw new UnprocessableEntityException("User with this e-mail already exists")
        }

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

    async update(userId: number, user: UpdateUserDto): Promise<User> {
        const existingUser = await this.usersRepository.findOneBy({ id: userId })

        if (!existingUser) {
            throw new NotFoundException("User not found")
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
