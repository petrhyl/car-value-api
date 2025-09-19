import { createHash } from "node:crypto"

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

    static getObjectHash(object: unknown): string {
        function normalizeObject(obj: unknown): unknown {
            if (obj && typeof obj === "object" && !Array.isArray(obj)) {
                const sortedKeys = Object.keys(obj).sort()
                const normalizedObj = {}
                for (const key of sortedKeys) {
                    normalizedObj[key] = normalizeObject(obj[key])
                }
                return normalizedObj
            } else if (Array.isArray(obj)) {
                return obj.map(item => normalizeObject(item))
            } else if (obj instanceof Date) {
                return obj.toISOString()
            } else if (typeof obj === "string") {
                return obj.trim().toLowerCase()
            }

            return obj
        }

        const jsonString = JSON.stringify(normalizeObject(object))

        return createHash("sha256").update(jsonString).digest("base64url")
    }
}
