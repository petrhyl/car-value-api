export class AppUtils {
    static parseNumberOrNull(value: unknown): number | null {
        if (
            value === null ||
            value === undefined ||
            typeof value === "object" ||
            typeof value === "function" ||
            typeof value === "symbol"
        ) {
            return null
        }

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const stringValue = String(value)
        const parsedValue = parseFloat(stringValue)

        if (isNaN(parsedValue) || parsedValue.toString() !== stringValue) {
            return null
        }

        return parsedValue
    }
}
