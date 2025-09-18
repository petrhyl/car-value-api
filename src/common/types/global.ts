/* eslint-disable @typescript-eslint/no-namespace */

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test"

            RT_BYTES: string
            RT_TTL_SECONDS: string
            RT_HASH_ALG: "sha256" | "sha512"
            RT_KID: string
            RT_SECRET_KEYS: string

            JWT_ISSUER: string
            JWT_AUD_API: string
            JWT_SECRET: string
            JWT_TTL_SECONDS: string

            DB_TYPE: "postgres" | "mysql" | "mariadb" | "mssql" | "oracle"
            DB_NAME: string
            DB_HOST: string
            DB_PORT: string
            DB_USER: string
            DB_PASSWORD: string
            DB_URL: string
            DB_SCHEMA_SYNC: string

            AUTH_REDIS_HOST: string
            AUTH_REDIS_PORT: string
            AUTH_REDIS_PASSWORD: string

            APP_PORT: string
        }
    }
}

export {}
