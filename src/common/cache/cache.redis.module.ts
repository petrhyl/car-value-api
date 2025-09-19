import { Global, Module } from "@nestjs/common"
import CacheRedisService from "./cache.redis.service"

@Global()
@Module({
    providers: [CacheRedisService],
    exports: [CacheRedisService]
})
export default class CacheRedisModule {}
