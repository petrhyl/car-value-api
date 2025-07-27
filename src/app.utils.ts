export class AppUtils {
    static parseNumberOrNull(value: unknown): number | null {
        if (!value) {
            return null
        }

        if (typeof value === "number") {
            return value
        }

        if (typeof value !== "string") {
            return null
        }

        const parsedValue = parseFloat(value)

        if (isNaN(parsedValue) || parsedValue.toString() !== value) {
            return null
        }

        return parsedValue
    }
}
