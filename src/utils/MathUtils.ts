import Decimal from "decimal.js";

export class MathUtils {
    /**
     * Adds two numbers with high precision
     */
    static add(a: number | string | Decimal, b: number | string | Decimal): Decimal {
        return new Decimal(a).plus(b);
    }

    /**
     * Subtracts b from a with high precision
     */
    static sub(a: number | string | Decimal, b: number | string | Decimal): Decimal {
        return new Decimal(a).minus(b);
    }

    /**
     * Multiplies two numbers with high precision
     */
    static mul(a: number | string | Decimal, b: number | string | Decimal): Decimal {
        return new Decimal(a).times(b);
    }

    /**
     * Divides a by b with high precision
     */
    static div(a: number | string | Decimal, b: number | string | Decimal): Decimal {
        return new Decimal(a).dividedBy(b);
    }

    /**
     * Rounds a number to a specified number of decimal places
     */
    static round(value: number | string | Decimal, places: number = 2): Decimal {
        return new Decimal(value).toDecimalPlaces(places, Decimal.ROUND_HALF_UP);
    }

    /**
     * Calculates a percentage of a value
     * @param value The base value
     * @param percentage The percentage (e.g., 5 for 5%)
     */
    static percentage(value: number | string | Decimal, percentage: number | string | Decimal): Decimal {
        return new Decimal(value).times(percentage).dividedBy(100);
    }

    /**
     * Returns 0 if value is negative, else value
     */
    static maxZero(value: number | string | Decimal): Decimal {
        const val = new Decimal(value);
        return val.isNegative() ? new Decimal(0) : val;
    }
}
