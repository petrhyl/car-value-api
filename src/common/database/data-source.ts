import { config as dotenvConfig } from "dotenv"
import { DataSource, DataSourceOptions } from "typeorm"

const isProd = process.env.NODE_ENV === "production"

if (!isProd) {
    dotenvConfig({ path: `.env.${process.env.NODE_ENV || "development"}` })
}

const dbType = process.env.DB_TYPE as "postgres" | "mysql"

let options: DataSourceOptions

const migrationsPath = "**/migrations/*.js"
const entitiesPath = "**/*.entity.js"

if (isProd) {
    options = {
        type: dbType,
        url: process.env.DB_URL,
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
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5533", 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        synchronize: process.env.DB_SCHEMA_SYNC === "true" || process.env.DB_SCHEMA_SYNC === "1",
        migrations: [migrationsPath],
        entities: [entitiesPath]
    }
}

export default new DataSource(options)
