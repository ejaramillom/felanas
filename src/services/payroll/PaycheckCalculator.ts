import { PaycheckConfig } from "../../entities/PaycheckConfig.js";
import { Employee } from "../../entities/Employee.js";
import Decimal from "decimal.js";
import { MathUtils } from "../../utils/MathUtils.js";

export interface CalculationResult {
    grossSalary: number;
    netSalary: number;
    lineItems: {
        type: "INCOME" | "DEDUCTION" | "BENEFIT";
        code: string;
        description: string;
        amount: number;
    }[];
}

export class PaycheckCalculator {
    constructor() {}

    /**
     * Calculates the paycheck based on inputs.
     */
    async calculate(
        employee: Employee,
        config: PaycheckConfig,
        periodStart: Date,
        periodEnd: Date,
        workedDates: Date[],
        salesTotal: number = 0
    ): Promise<CalculationResult> {
        const lineItems: CalculationResult["lineItems"] = [];
        const baseSalary = MathUtils.div(employee.baseSalary, 2); // Semi-monthly

        // 1. Base Salary
        lineItems.push({
            type: "INCOME",
            code: "BASE_SALARY",
            description: "Base Salary (Semi-monthly)",
            amount: baseSalary.toNumber()
        });

        // 2. Lunch Benefit
        // Filter workedDates within period
        const workedInPeriod = workedDates.filter(d => {
            const time = d.getTime();
            return time >= periodStart.getTime() && time <= periodEnd.getTime();
        });
        
        // Ensure distinct days (just in case logs had duplicates)
        const uniqueWorkedDays = new Set(workedInPeriod.map(d => d.toISOString().split('T')[0])).size;

        const lunchAmount = MathUtils.mul(uniqueWorkedDays, config.lunchBenefitAmount);
        if (lunchAmount.greaterThan(0)) {
            lineItems.push({
                type: "BENEFIT",
                code: "LUNCH",
                description: `Lunch Benefit (${uniqueWorkedDays} days)`,
                amount: lunchAmount.toNumber()
            });
        }

        // 3. Sunday Bonus
        let sundayBonusTotal = new Decimal(0);
        let eligibleSundays = 0;
        
        // Iterate through period to find Sundays
        // Clone start date to avoid mutation
        let currentDate = new Date(periodStart);
        while (currentDate <= periodEnd) {
            if (currentDate.getDay() === 0) { // It's a Sunday
                // Check preceding Mon-Sat
                const sundayDate = new Date(currentDate);
                const prevSaturday = new Date(sundayDate);
                prevSaturday.setDate(sundayDate.getDate() - 1);
                
                const prevMonday = new Date(sundayDate);
                prevMonday.setDate(sundayDate.getDate() - 6);

                // Check if worked any day in [prevMonday, prevSaturday]
                const workedPrecedingWeek = workedDates.some(d => {
                    const t = d.getTime();
                    // Normalize to ignore time components if needed, but assuming input dates are reliable
                    // Let's compare timestamps safely
                    return t >= prevMonday.getTime() && t <= prevSaturday.getTime();
                });

                if (workedPrecedingWeek) {
                    sundayBonusTotal = sundayBonusTotal.plus(config.sundayBonusAmount);
                    eligibleSundays++;
                }
            }
            // Next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (sundayBonusTotal.greaterThan(0)) {
            lineItems.push({
                type: "BENEFIT",
                code: "SUNDAY_BONUS",
                description: `Sunday Bonus (${eligibleSundays} Sundays)`,
                amount: sundayBonusTotal.toNumber()
            });
        }

        // 4. Commission
        const commissionAmount = MathUtils.percentage(salesTotal, config.salesCommissionPct);
        if (commissionAmount.greaterThan(0)) {
            lineItems.push({
                type: "INCOME",
                code: "COMMISSION",
                description: `Sales Commission (${config.salesCommissionPct}%)`,
                amount: commissionAmount.toNumber()
            });
        }

        // Calculate Gross
        let grossSalary = new Decimal(0);
        lineItems.forEach(item => {
            if (item.type !== "DEDUCTION") {
                grossSalary = grossSalary.plus(item.amount);
            }
        });

        // 5. Deductions (on Base Salary usually, or Gross? Spec implies specific contributions)
        // Usually Health/Retirement are on the Base.
        const healthAmount = MathUtils.percentage(baseSalary, config.healthDeductionPct);
        lineItems.push({
            type: "DEDUCTION",
            code: "HEALTH",
            description: `Health Insurance (${config.healthDeductionPct}%)`,
            amount: healthAmount.toNumber()
        });

        const retirementAmount = MathUtils.percentage(baseSalary, config.retirementDeductionPct);
        lineItems.push({
            type: "DEDUCTION",
            code: "RETIREMENT",
            description: `Retirement (${config.retirementDeductionPct}%)`,
            amount: retirementAmount.toNumber()
        });

        // Calculate Net
        const totalDeductions = healthAmount.plus(retirementAmount);
        const netSalary = grossSalary.minus(totalDeductions);

        return {
            grossSalary: grossSalary.toNumber(),
            netSalary: netSalary.toNumber(),
            lineItems
        };
    }
}
