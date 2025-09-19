import { DataSource, Repository, SelectQueryBuilder } from "typeorm"
import { CarReport } from "./entities/car-report.entity"
import { GetAllCarReportsQuery } from "./dtos/get-all-car-reports.query"
import { GetEstimateQuery } from "./dtos/get-estimate.query"
import { RangeFilter } from "@/common/dtos/range-filter.query"
import { OrderByValue } from "@/common/dtos/order-by-value.enum"
import { EstimateResponse } from "./dtos/estimate.response"

export const CAR_REPORTS_REPOSITORY = "CAR_REPORTS_REPOSITORY"

export interface CarReportRepository extends Repository<CarReport> {
    findWithFilters(filters: GetAllCarReportsQuery): Promise<CarReport[]>
    getAveragePriceWithCount(filters: GetEstimateQuery): Promise<EstimateResponse | null>
}

export const carReportsRepositoryProvider = {
    provide: CAR_REPORTS_REPOSITORY,
    useFactory: (dataSource: DataSource) => {
        const carReportRepository = dataSource.getRepository(CarReport)
        return carReportRepository.extend({
            findWithFilters: (filters: GetAllCarReportsQuery) => {
                return buildCarReportQuery(filters, carReportRepository).getMany()
            },
            getAveragePriceWithCount: async (filters: GetEstimateQuery): Promise<EstimateResponse | null> => {
                const qb = buildCarReportQuery(filters, carReportRepository)
                const rawResult = await qb
                    .select("AVG(report.price)", "averagePrice")
                    .addSelect("COUNT(report.id)", "carsCount")
                    .getRawOne<EstimateResponse>()

                const avg = rawResult?.averagePrice

                return avg === null || avg === undefined
                    ? null
                    : { averagePrice: avg, carsCount: rawResult!.carsCount }
            }
        })
    },
    inject: [DataSource]
}

function buildCarReportQuery(
    query: GetEstimateQuery | GetAllCarReportsQuery,
    repository: Repository<CarReport>
): SelectQueryBuilder<CarReport> {
    const qb = repository.createQueryBuilder("report")

    // Filtering
    for (const key in query) {
        if (!Object.prototype.hasOwnProperty.call(query, key)) continue

        const value: unknown = query[key]
        if (value === undefined || value === null) continue

        if (key === "orderBy" || key === "offset" || key === "limit") continue

        if (
            typeof value === "object" &&
            value !== null &&
            ("gte" in value || "lte" in value || "eq" in value)
        ) {
            const range = value as RangeFilter
            if (range.eq !== undefined && range.eq !== null) {
                qb.andWhere(`report.${key} = :${key}_eq`, { [`${key}_eq`]: range.eq })
            } else {
                if (range.gte !== undefined && range.gte !== null) {
                    qb.andWhere(`report.${key} >= :${key}_gte`, { [`${key}_gte`]: range.gte })
                }
                if (range.lte !== undefined && range.lte !== null) {
                    qb.andWhere(`report.${key} <= :${key}_lte`, { [`${key}_lte`]: range.lte })
                }
            }
        } else if (key === "longitude" || key === "latitude") {
            const numValue = value as number
            qb.andWhere(`ABS(report.${key} - :${key}) <= 0.01`, { [`${key}`]: numValue })
        } else if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            value instanceof Date
        ) {
            qb.andWhere(`report.${key} = :${key}`, { [key]: value })
        }
    }

    // Ordering
    if ("orderBy" in query && query.orderBy) {
        const orderBy = query.orderBy
        for (const orderKey in orderBy) {
            if (Object.prototype.hasOwnProperty.call(orderBy, orderKey)) {
                const orderValue = orderBy[orderKey] as OrderByValue | undefined
                if (orderValue) {
                    qb.addOrderBy(`report.${orderKey}`, orderValue === OrderByValue.ASC ? "ASC" : "DESC")
                }
            }
        }
    }

    // Pagination
    if ("offset" in query && typeof query.offset === "number") {
        qb.skip(query.offset)
    }
    if ("limit" in query && typeof query.limit === "number") {
        qb.take(query.limit)
    }

    return qb
}
