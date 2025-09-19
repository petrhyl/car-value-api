import { Injectable, Inject, Logger, OnApplicationShutdown, OnModuleInit } from "@nestjs/common"
import { createClient, RedisClientType, SocketTimeoutError } from "redis"
import { AuthRedisConfig, authRedisConf } from "./auth.redis.config"

export const AUTH_REDIS = "AUTH_REDIS"

@Injectable()
export default class AuthRedisProvider implements OnModuleInit, OnApplicationShutdown {
    private readonly logger = new Logger("AuthRedisService")
    public readonly client: RedisClientType

    constructor(@Inject(authRedisConf.KEY) public readonly config: AuthRedisConfig) {
        const url = `redis://:${config.password}@${config.host}:${config.port}`
        this.client = createClient({
            url,
            socket: {
                reconnectStrategy: (retries, cause) => {
                    // By default, do not reconnect on socket timeout.
                    if (cause instanceof SocketTimeoutError) {
                        return false
                    }

                    if (retries > 5) {
                        this.logger.error("Redis auth reconnection failed, max retries reached")
                        return false
                    }

                    // Generate a random jitter between 0 – 200 ms:
                    const jitter = Math.floor(Math.random() * 200)
                    // Delay is an exponential back off, (times^2) * 50 ms, with a maximum value of 2000 ms:
                    const delay = Math.min(Math.pow(2, retries) * 50, 2000)

                    return delay + jitter
                }
            }
        })
        this.client.on("error", e => this.logger.error("[redis auth] ", e))
    }

    async onModuleInit() {
        await this.client.connect()
        await this.client.ping()
    }

    async onApplicationShutdown(signal?: string) {
        this.logger.log(`Shutting down Redis auth client${signal ? ` (signal: ${signal})` : ""}`)
        if (this.client.isOpen) {
            await this.client.quit()
        }
    }
}
