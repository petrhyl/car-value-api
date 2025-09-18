import { registerAs } from "@nestjs/config"

export const jwtConf = registerAs("jwt", () => ({
    secret: process.env.JWT_SECRET,
    expiresIn: parseInt(process.env.JWT_TTL_SECONDS, 10),
    issuer: process.env.JWT_ISSUER,
    audApi: process.env.JWT_AUD_API
}))

export type JwtConfig = ReturnType<typeof jwtConf>
