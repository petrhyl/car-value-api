import { registerAs } from "@nestjs/config"

export const databaseConf = registerAs("database", () => ({
    environment: process.env.NODE_ENV,
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.DB_SCHEMA_SYNC === "true" || process.env.DB_SCHEMA_SYNC === "1",
    url: process.env.DB_URL
}))

export type DatabaseConfig = ReturnType<typeof databaseConf>
