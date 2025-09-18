import { plainToInstance } from "class-transformer"
import { ValidationError, validateSync } from "class-validator"
import { EnvVars } from "./env-vars"

function formatErrors(errors: ValidationError[]): string {
    return errors
        .map(e => {
            const constraints = e.constraints ? Object.values(e.constraints).join(", ") : ""
            return `${e.property}: ${constraints}`
        })
        .join("; ")
}

export function validateEnv(config: Record<string, unknown>): EnvVars {
    const instance = plainToInstance(EnvVars, config, {
        enableImplicitConversion: true,
        exposeDefaultValues: true
    })

    const errors = validateSync(instance, {
        skipMissingProperties: false,
        whitelist: true
    })

    if (errors.length) {
        throw new Error(`Invalid environment: ${formatErrors(errors)}`)
    }

    return instance
}
