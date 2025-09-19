import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from "@nestjs/common"
import { cacheRedisConf, CacheRedisConfig } from "./cache.redis.config"
import { createClient, RedisClientType, SocketTimeoutError } from "redis"

@Injectable()
export default class CacheRedisService implements OnModuleInit, OnApplicationShutdown {
    private readonly logger = new Logger(CacheRedisService.name)
    private readonly client: RedisClientType

    constructor(@Inject(cacheRedisConf.KEY) public readonly config: CacheRedisConfig) {
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
                        this.logger.error("Redis cache reconnection failed, max retries reached")
                        return false
                    }

                    const jitter = Math.floor(Math.random() * 200)
                    const delay = Math.min(Math.pow(2, retries) * 50, 2000)

                    return delay + jitter
                }
            }
        })
        this.client.on("error", e => this.logger.error("[redis cache] ", e))
    }

    async set(key: string, value: string, tag: string) {
        await this.client.set(key, value, { EX: this.config.ttl })
        await this.client.sAdd(this.tagKey(tag), key)
    }

    async get(key: string) {
        return await this.client.get(key)
    }

    async del(key: string) {
        return await this.client.del(key)
    }

    async delByTag(tag: string) {
        const keys = await this.client.sMembers(this.tagKey(tag))
        if (keys.length > 0) {
            await this.client.del(keys)
            await this.client.del(this.tagKey(tag))
        }
    }

    private tagKey(tag: string) {
        return `tag:${tag}`
    }

    async onModuleInit() {
        await this.client.connect()
        await this.client.ping()
    }

    async onApplicationShutdown(signal?: string) {
        this.logger.log(`Shutting down Redis cache client${signal ? ` (signal: ${signal})` : ""}`)
        if (this.client.isOpen) {
            await this.client.quit()
        }
    }
}
