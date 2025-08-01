import { Test, TestingModule } from "@nestjs/testing"
import { CarReportsService } from "./car-reports.service"
import { carReportsRepositoryProvider } from "./car-reports.repository.provider"

describe("ReportsService", () => {
    let service: CarReportsService
    const mockedRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        findWithFilters: jest.fn(),
        getAveragePriceWithCount: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CarReportsService,
                {
                    provide: carReportsRepositoryProvider.provide,
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
