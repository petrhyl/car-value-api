import { parseKeyValuePairs } from "@/common/validators/is-list-of-key-value-pairs.validator"
import { registerAs } from "@nestjs/config"

export const refreshTokenServiceConf = registerAs("refreshToken", () => ({
    expiresInSeconds: parseInt(process.env.RT_TTL_SECONDS, 10),
    bytes: parseInt(process.env.RT_BYTES, 10),
    hashingAlgorithm: process.env.RT_HASH_ALG,
    currentKeyId: process.env.RT_KID,
    keysDictionary: parseKeyValuePairs(process.env.RT_SECRET_KEYS)
}))

export type RefreshTokenServiceConfig = ReturnType<typeof refreshTokenServiceConf>
