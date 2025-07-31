import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator"

@ValidatorConstraint({ name: "atLeastOneField", async: false })
export class AtLeastOneField implements ValidatorConstraintInterface {
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
