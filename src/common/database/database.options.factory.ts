import { ConfigService } from "@nestjs/config"
import { TypeOrmModuleOptions } from "@nestjs/typeorm"
import { DataSourceOptions } from "typeorm"
import { DatabaseConfig } from "./database.conf"

export function databaseOptionsFactory(config: ConfigService): TypeOrmModuleOptions {
    const migrationsPath = "**/migrations/*.js"
    const entitiesPath = "**/*.entity.js"

    const dbConf = config.get<DatabaseConfig>("database")

    if (!dbConf) {
        throw new Error("Database configuration is not defined")
    }

    let options: DataSourceOptions

    if (dbConf.environment === "production") {
        options = {
            type: dbConf.type as "postgres",
            url: dbConf.url,
            migrationsRun: true,
            ssl: {
                rejectUnauthorized: false
            },
            synchronize: dbConf.synchronize,
            migrations: [migrationsPath],
            entities: [entitiesPath]
        }
    } else {
        options = {
            type: dbConf.type,
            database: dbConf.database,
            host: dbConf.host,
            port: dbConf.port,
            username: dbConf.user,
            password: dbConf.password,
            synchronize: dbConf.synchronize,
            migrations: [migrationsPath],
            entities: [entitiesPath]
        }
    }

    return {
        ...options,
        autoLoadEntities: true
    }
}
