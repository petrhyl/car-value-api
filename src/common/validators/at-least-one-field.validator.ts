import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    registerDecorator
} from "class-validator"

@ValidatorConstraint({ name: "atLeastOneField", async: false })
class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
    validate(_value: any, args: ValidationArguments) {
        const obj = args.object as Record<string, unknown>

        return Object.values(obj).some(value => value !== undefined && value !== null)
    }

    defaultMessage(args: ValidationArguments) {
        const obj = args.object as Record<string, unknown>

        const fields = Object.keys(obj).filter(
            key => (obj[key] !== undefined || obj[key] !== null) && key !== args.property
        )

        return " - at least one property must be provided - " + fields.join(", ")
    }
}

export function AtLeastOneField() {
    return function (object: object, propertyName: string) {
        const validator = new AtLeastOneFieldConstraint()
        validator.validate({}, { object } as ValidationArguments)

        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: { message: validator.defaultMessage({ object } as ValidationArguments) },
            constraints: [],
            validator: AtLeastOneFieldConstraint
        })
    }
}
