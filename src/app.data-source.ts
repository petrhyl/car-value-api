import { config as dotenvConfig } from "dotenv"
import { DataSource, DataSourceOptions } from "typeorm"

if (process.env.NODE_ENV !== "production") {
    dotenvConfig({ path: `.env.${process.env.NODE_ENV || "development"}` })
}

const dbType = (process.env.DB_TYPE as "postgres" | "mysql" | "sqlite") || "sqlite"

let options: DataSourceOptions

const migrationsPath = "dist/migrations/*.js"
const entitiesPath = "dist/**/*.entity.js"

if (dbType === "sqlite") {
    options = {
        type: "sqlite",
        database: process.env.DB_NAME || "fallback.db",
        synchronize: process.env.DB_SCHEMA_SYNC === "true",
        migrations: [migrationsPath],
        entities: [entitiesPath]
    }
} else {
    options = {
        type: dbType,
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        username: process.env.DB_USER || "user",
        password: process.env.DB_PASSWORD || "password",
        database: process.env.DB_NAME || "database",
        synchronize: process.env.DB_SCHEMA_SYNC === "true",
        migrations: [migrationsPath],
        entities: [entitiesPath]
    }
}

export const AppDataSourceOptions = options

export default new DataSource(options)
