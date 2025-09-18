import { Test, TestingModule } from "@nestjs/testing"
import { UsersService } from "./users.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { User } from "./entities/user.entity"
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common"
import { Role } from "./entities/role.entity"

describe("UsersService", () => {
    let service: UsersService
    const mockedUserRepository = {
        findOneBy: jest.fn().mockResolvedValue(null),
        save: jest.fn(),
        find: jest.fn(),
        remove: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockedUserRepository
                },
                {
                    provide: getRepositoryToken(Role),
                    useValue: {
                        findOneBy: jest.fn().mockImplementation(async (criteria: { name: string }) =>
                            Promise.resolve({
                                id: 1,
                                name: criteria.name,
                                description: "Default role description"
                            })
                        ),
                        save: jest.fn()
                    }
                }
            ]
        }).compile()

        service = module.get<UsersService>(UsersService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should create a user", async () => {
        const user = { email: "test@example.com" } as User
        mockedUserRepository.save.mockResolvedValue(user)

        const result = await service.create(user)

        expect(mockedUserRepository.findOneBy).toHaveBeenCalledWith({ email: user.email })
        expect(mockedUserRepository.save).toHaveBeenCalledWith(user)
        expect(result).toEqual(user)
    })

    it("should throw an error if user already exists", async () => {
        const user = { email: "test@example.com" } as User
        mockedUserRepository.findOneBy.mockResolvedValueOnce(user)

        await expect(service.create(user)).rejects.toThrow(UnprocessableEntityException)
    })

    it("should find a user by id", async () => {
        const user = { id: 1 } as User
        mockedUserRepository.findOneBy.mockResolvedValueOnce(user)

        const result = await service.findById(1)

        expect(mockedUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
        expect(result).toEqual(user)
    })

    it("should return null if user is not found by id", async () => {
        const result = await service.findById(1)

        expect(mockedUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
        expect(result).toBeNull()
    })

    it("should find a user by email", async () => {
        const user = { email: "test@example.com" } as User
        mockedUserRepository.findOneBy.mockResolvedValueOnce(user)

        const result = await service.findByEmail("test@example.com")

        expect(mockedUserRepository.findOneBy).toHaveBeenCalledWith({ email: "test@example.com" })
        expect(result).toEqual(user)
    })

    it("should return null if user is not found by email", async () => {
        const result = await service.findByEmail("test@example.com")

        expect(mockedUserRepository.findOneBy).toHaveBeenCalledWith({ email: "test@example.com" })
        expect(result).toBeNull()
    })

    it("should find all users with offset and limit", async () => {
        const users = [{ id: 1 }, { id: 2 }] as User[]
        mockedUserRepository.find.mockResolvedValueOnce(users)

        const result = await service.findAll(0, 10)

        expect(mockedUserRepository.find).toHaveBeenCalledWith({ skip: 0, take: 10 })
        expect(result).toEqual(users)
    })

    it("should update a user's profile", async () => {
        const user = { id: 1, name: "Old Name" } as User
        const updatedUser = { id: 1, name: "New Name" } as User
        mockedUserRepository.findOneBy.mockResolvedValueOnce(user)
        mockedUserRepository.save.mockResolvedValue(updatedUser)

        const result = await service.updateProfile(1, { name: "New Name" })

        expect(mockedUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
        expect(mockedUserRepository.save).toHaveBeenCalledWith({ ...user, name: "New Name" })
        expect(result).toEqual(updatedUser)
    })

    it("should return null if user to update its profile is not found", async () => {
        const result = await service.updateProfile(1, { name: "New Name" })

        expect(mockedUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
        expect(result).toBeNull()
    })

    it("should delete a user by id", async () => {
        const user = { id: 1 } as User
        mockedUserRepository.findOneBy.mockResolvedValueOnce(user)

        await service.deleteById(1)

        expect(mockedUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 })
        expect(mockedUserRepository.remove).toHaveBeenCalledWith(user)
    })

    it("should throw an error if user to delete is not found", async () => {
        await expect(service.deleteById(1)).rejects.toThrow(NotFoundException)
    })

    it("should increment token version", async () => {
        const user = { id: 1, tokenVersion: 1 } as User
        mockedUserRepository.save.mockResolvedValueOnce({ ...user, tokenVersion: 2 })

        await service.incrementTokenVersion(user)

        expect(mockedUserRepository.save).toHaveBeenCalledWith({ ...user, tokenVersion: 2 })
    })
})
