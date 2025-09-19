import { registerAs } from "@nestjs/config"

export const authRedisConf = registerAs("authRedis", () => ({
    host: process.env.AUTH_REDIS_HOST,
    port: parseInt(process.env.AUTH_REDIS_PORT, 10),
    password: process.env.AUTH_REDIS_PASSWORD,
    ttl: parseInt(process.env.CACHE_REDIS_TTL_SECONDS, 10)
}))

export type AuthRedisConfig = ReturnType<typeof authRedisConf>
