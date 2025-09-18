import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator"
import { parseKeyValuePairs } from "./is-list-of-key-value-pairs.validator"

@ValidatorConstraint({ name: "IsKeyIncludedInPropertyValue", async: false })
class IsKeyIncludedInPropertyValueConstraint implements ValidatorConstraintInterface {
    validate(kid: any, args: ValidationArguments): boolean {
        const obj = args.object
        const keyValuesRaw = obj[args.constraints[0] as keyof typeof obj]

        if (typeof kid !== "string" || typeof keyValuesRaw !== "string") return false

        try {
            const map = parseKeyValuePairs(keyValuesRaw) // throws on bad format
            return Object.prototype.hasOwnProperty.call(map, kid) && map[kid].length > 0
        } catch {
            return false
        }
    }

    defaultMessage(args: ValidationArguments): string {
        const keyValuesProp = args.constraints[0] as string
        return ` ${args.property} must be a key present in ${keyValuesProp}`
    }
}

export function IsKeyIncludedInPropertyValue<T extends object>(
    keyValuesProp: keyof T,
    options?: ValidationOptions
): PropertyDecorator {
    return (target: object, propertyKey: string) => {
        registerDecorator({
            name: "IsKeyIncludedInPropertyValue",
            target: target.constructor,
            propertyName: propertyKey,
            options,
            constraints: [keyValuesProp],
            validator: IsKeyIncludedInPropertyValueConstraint
        })
    }
}
