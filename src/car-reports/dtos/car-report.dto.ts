import { Expose, Transform } from "class-transformer"
import { CarReport } from "../car-report.entity"

export class CarReportDto {
    @Expose()
    id: number

    @Expose()
    creatorId: number

    @Transform(({ obj }: { obj: CarReport }) => obj.creator?.nickname || obj.creator?.name)
    @Expose()
    creatorName: string

    @Expose()
    price: number

    @Expose()
    make: string

    @Expose()
    model: string

    @Expose()
    year: number

    @Expose()
    longitude: number

    @Expose()
    latitude: number

    @Expose()
    mileage: number

    @Expose()
    approved: boolean

    @Expose()
    createdAt: Date
}
