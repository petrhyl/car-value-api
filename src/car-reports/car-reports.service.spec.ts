import { Test, TestingModule } from "@nestjs/testing"
import { CarReportsService } from "./car-reports.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { CarReport } from "./car-report.entity"

describe("ReportsService", () => {
    let service: CarReportsService
    const mockedRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CarReportsService,
                {
                    provide: getRepositoryToken(CarReport),
                    useValue: mockedRepository
                }
            ]
        }).compile()

        service = module.get<CarReportsService>(CarReportsService)
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })
})
