import { config as dotenvConfig } from "dotenv"
import { DataSource, DataSourceOptions } from "typeorm"

const isProd = process.env.NODE_ENV === "production"

if (!isProd) {
    dotenvConfig({ path: `.env.${process.env.NODE_ENV || "development"}` })
}

const dbType = (process.env.DB_TYPE as "postgres" | "mysql") || "postgres"

let options: DataSourceOptions

const migrationsPath = "**/migrations/*.js"
const entitiesPath = "**/*.entity.js"

if (isProd) {
    options = {
        type: dbType,
        url: process.env.DATABASE_URL,
        migrationsRun: true,
        ssl: {
            rejectUnauthorized: false
        },
        migrations: [migrationsPath],
        entities: [entitiesPath]
    }
} else {
    options = {
        type: dbType,
        database: process.env.DB_NAME || "postgres",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432", 10),
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "mysecretpassword",
        synchronize: process.env.DB_SCHEMA_SYNC === "true",
        migrations: [migrationsPath],
        entities: [entitiesPath]
    }
}

export const AppDataSourceOptions = options

export default new DataSource(options)
