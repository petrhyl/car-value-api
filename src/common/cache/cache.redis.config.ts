import { registerAs } from "@nestjs/config"

export const cacheRedisConf = registerAs("cacheRedis", () => ({
    host: process.env.CACHE_REDIS_HOST,
    port: parseInt(process.env.CACHE_REDIS_PORT, 10),
    password: process.env.CACHE_REDIS_PASSWORD,
    ttl: parseInt(process.env.CACHE_REDIS_TTL_SECONDS, 10)
}))

export type CacheRedisConfig = ReturnType<typeof cacheRedisConf>
