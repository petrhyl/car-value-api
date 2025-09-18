import { Injectable, Inject, Logger, OnApplicationShutdown } from "@nestjs/common"
import { createClient, RedisClientType } from "redis"
import { AuthRedisConfig, authRedisConf } from "./auth.redis.config"

export const AUTH_REDIS = "AUTH_REDIS"

@Injectable()
export default class AuthRedisProvider implements OnApplicationShutdown {
    private readonly logger = new Logger("AuthRedisService")
    public readonly client: RedisClientType

    constructor(@Inject(authRedisConf.KEY) config: AuthRedisConfig) {
        const url = `redis://:${config.password}@${config.host}:${config.port}`
        this.client = createClient({ url })
        this.client.on("error", e => this.logger.error("[redis] ", e))
    }

    async onModuleInit() {
        await this.client.connect()
        await this.client.ping()
    }

    async onApplicationShutdown(signal?: string) {
        this.logger.log(`Shutting down Redis client${signal ? ` (signal: ${signal})` : ""}`)
        if (this.client.isOpen) {
            await this.client.quit()
        }
    }
}
