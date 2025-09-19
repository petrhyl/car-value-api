import { Transform } from "class-transformer"
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsString, Min, ValidateIf } from "class-validator"
import { IsKeyIncludedInPropertyValue } from "@/common/validators/is-key-included-in-property-value.validator"
import { IsListOfKeyValuePairs } from "@/common/validators/is-list-of-key-value-pairs.validator"

export class EnvVars {
    @IsIn(["development", "production", "test"])
    NODE_ENV: "development" | "production" | "test"

    // Refresh tokens
    @Transform(({ value }) => parseInt(value as string, 10))
    @IsInt()
    @Min(32)
    RT_BYTES: number

    @Transform(({ value }) => parseInt(value as string, 10))
    @IsInt()
    @Min(3600)
    RT_TTL_SECONDS: number

    @IsIn(["sha256", "sha512"])
    RT_HASH_ALG: "sha256" | "sha512"

    @IsString()
    @IsNotEmpty()
    @IsKeyIncludedInPropertyValue<EnvVars>("RT_SECRET_KEYS", {
        message: "RT_KID must be a key present in RT_SECRET_KEYS"
    })
    RT_KID: string

    @IsListOfKeyValuePairs()
    RT_SECRET_KEYS: string

    // JWT / issuer
    @IsString()
    @IsNotEmpty()
    JWT_ISSUER: string // e.g., https://auth.example.com

    @IsString()
    @IsNotEmpty()
    JWT_AUD_API: string

    @IsString()
    @IsNotEmpty()
    JWT_SECRET: string

    @Transform(({ value }) => parseInt(value as string, 10))
    @IsInt()
    @Min(300)
    JWT_TTL_SECONDS: number

    // Database
    @IsIn(["postgres", "mysql", "mariadb", "sqlite", "mssql", "oracle"])
    DB_TYPE: "postgres" | "mysql" | "mariadb" | "sqlite" | "mssql" | "oracle"

    @ValidateIf((o: EnvVars) => o.NODE_ENV !== "production")
    @IsString()
    @IsNotEmpty()
    DB_NAME: string

    @ValidateIf((o: EnvVars) => o.NODE_ENV !== "production")
    @IsString()
    @IsNotEmpty()
    DB_HOST: string

    @ValidateIf((o: EnvVars) => o.NODE_ENV !== "production")
    @Transform(({ value }) => parseInt(value as string, 10))
    @IsInt()
    @Min(1)
    DB_PORT: number

    @ValidateIf((o: EnvVars) => o.NODE_ENV !== "production")
    @IsString()
    @IsNotEmpty()
    DB_USER: string

    @ValidateIf((o: EnvVars) => o.NODE_ENV !== "production")
    @IsString()
    @IsNotEmpty()
    DB_PASSWORD: string

    @Transform(({ value }) => value === "true" || value === "1")
    @IsNotEmpty()
    @IsBoolean()
    DB_SCHEMA_SYNC: boolean

    @ValidateIf((o: EnvVars) => o.NODE_ENV === "production")
    @IsString()
    @IsNotEmpty()
    DB_URL: string

    @IsString()
    @IsNotEmpty()
    AUTH_REDIS_HOST: string

    @Transform(({ value }) => parseInt(value as string, 10))
    @IsInt()
    @Min(1)
    AUTH_REDIS_PORT: string

    @IsString()
    @IsNotEmpty()
    AUTH_REDIS_PASSWORD: string

    @IsString()
    @IsNotEmpty()
    CACHE_REDIS_HOST: string

    @Transform(({ value }) => parseInt(value as string, 10))
    @IsInt()
    @Min(1)
    CACHE_REDIS_PORT: string

    @IsString()
    @IsNotEmpty()
    CACHE_REDIS_PASSWORD: string

    @Transform(({ value }) => parseInt(value as string, 10))
    @IsInt()
    @Min(1)
    CACHE_REDIS_TTL_SECONDS: string

    // App
    @Transform(({ value }) => parseInt(value as string, 10))
    @IsInt()
    @Min(1)
    APP_PORT: number
}
