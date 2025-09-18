import { registerDecorator, ValidationOptions, ValidationArguments } from "class-validator"

export function IsListOfKeyValuePairs(options?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "IsListOfKeyValuePairs",
            target: object.constructor,
            propertyName,
            options,
            validator: {
                validate(value: any) {
                    try {
                        if (typeof value !== "string" || value.trim() === "") return false
                        parseKeyValuePairs(value)
                        return true
                    } catch {
                        return false
                    }
                },
                defaultMessage(args?: ValidationArguments) {
                    return ` ${args?.property} must be in "key1=value;key2=value2" format`
                }
            }
        })
    }
}

export function parseKeyValuePairs(raw: string): Record<string, string> {
    return raw.split(";").reduce<Record<string, string>>((acc, pair) => {
        pair = pair?.trim()
        if (!pair) {
            return acc
        }

        const [kid, ...rest] = pair.split("=")
        const secret = rest.join("=")
        if (!kid || !secret) throw new Error(`Invalid secret pair: "${pair}"`)
        acc[kid] = secret
        return acc
    }, {})
}
