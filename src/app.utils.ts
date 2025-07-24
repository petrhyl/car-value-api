export class AppUtils {
    static parseNumberOrNull(value: string | unknown): number | null {
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
