import { registerAs } from "@nestjs/config"

export const authRedisConf = registerAs("authRedis", () => ({
    host: process.env.AUTH_REDIS_HOST,
    port: parseInt(process.env.AUTH_REDIS_PORT, 10),
    password: process.env.AUTH_REDIS_PASSWORD
}))

export type AuthRedisConfig = ReturnType<typeof authRedisConf>
