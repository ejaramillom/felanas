import { PaycheckCalculator } from "@src/services/payroll/PaycheckCalculator";
import { Employee } from "@src/entities/Employee";
import { PaycheckConfig } from "@src/entities/PaycheckConfig";
import { MathUtils } from "@src/utils/MathUtils";

describe("PaycheckCalculator", () => {
    let calculator: PaycheckCalculator;
    let employee: Employee;
    let config: PaycheckConfig;
    let periodStart: Date;
    let periodEnd: Date;

    beforeEach(() => {
        calculator = new PaycheckCalculator();

        employee = new Employee();
        employee.id = "emp-1";
        employee.firstName = "John";
        employee.lastName = "Doe";
        employee.baseSalary = 3000; // Monthly
        employee.skills = ["CASHIER"];

        config = new PaycheckConfig();
        config.id = "conf-1";
        config.healthDeductionPct = 4; // 4%
        config.retirementDeductionPct = 3; // 3%
        config.lunchBenefitAmount = 10; // $10 per day
        config.sundayBonusAmount = 50; // $50 per Sunday
        config.salesCommissionPct = 5; // 5%
    });

    test("should calculate full 15-day paycheck with no absences", async () => {
        periodStart = new Date("2026-01-01"); // Thu
        periodEnd = new Date("2026-01-15"); // Thu
        
        // Simulate full attendance (excluding Sundays)
        // Working days: Jan 1,2,3, 5,6,7,8,9,10, 12,13,14,15 = 13 days
        const workedDates = [
            new Date("2026-01-01"), new Date("2026-01-02"), new Date("2026-01-03"),
            new Date("2026-01-05"), new Date("2026-01-06"), new Date("2026-01-07"), new Date("2026-01-08"), new Date("2026-01-09"), new Date("2026-01-10"),
            new Date("2026-01-12"), new Date("2026-01-13"), new Date("2026-01-14"), new Date("2026-01-15")
        ];

        const result = await calculator.calculate(employee, config, periodStart, periodEnd, workedDates, 0);

        // Expected Calculations:
        // Base: 3000 / 2 = 1500
        // Lunch: 13 * 10 = 130
        // Sunday Bonus: 2 Sundays in period (Jan 4, Jan 11).
        // - Week 1 (Dec 29 - Jan 3): Worked Thu-Sat (Partial week? Spec says "absent for the entire preceding week (Mon-Sat)". If week is partial in period, do we look back?
        // Let's assume we look at the period context. If employee worked all scheduled days in that week, they get Sunday.
        // For simplicity in MVP/Test:
        // - Jan 4 Sunday: Preceding Mon-Sat is Dec 29-Jan 3. Our data starts Jan 1. 
        // If we strictly follow "Mon-Sat", we might need data outside period.
        // Let's assume for this test that the employee worked the full week.
        // But `workedDates` only has Jan 1-3.
        // Clarification in Spec: "System MUST automatically remove "Sunday Payment" if the employee was absent for the entire preceding week (Mon-Sat)."
        // "Entire" is the keyword. If they worked AT LEAST ONE DAY, they get Sunday payment?
        // "Sunday payment is automatically removed if the employee missed a full week".
        // So if they worked Jan 1, they get Jan 4 Sunday payment.
        // - Jan 11 Sunday: Preceding Mon-Sat is Jan 5-10. Worked all days. Gets Bonus.
        // Total Sundays: 2.
        
        // Sunday Bonus: 2 * 50 = 100.
        
        // Gross: 1500 + 130 + 100 = 1730.
        // Health: 1500 * 0.04 = 60.
        // Retirement: 1500 * 0.03 = 45.
        // Total Deductions: 105.
        // Net: 1730 - 105 = 1625.

        expect(result.grossSalary).toBeCloseTo(1730, 2);
        expect(result.netSalary).toBeCloseTo(1625, 2);
        
        // Check Line Items
        const baseItem = result.lineItems.find(i => i.code === "BASE_SALARY");
        expect(baseItem?.amount).toBeCloseTo(1500);

        const lunchItem = result.lineItems.find(i => i.code === "LUNCH");
        expect(lunchItem?.amount).toBeCloseTo(130);

        const sundayItem = result.lineItems.find(i => i.code === "SUNDAY_BONUS");
        expect(sundayItem?.amount).toBeCloseTo(100);
    });

    test("should remove lunch benefit for missed day", async () => {
        periodStart = new Date("2026-01-01");
        periodEnd = new Date("2026-01-15");
        
        // Missed Jan 5 (Mon). Worked 12 days.
        const workedDates = [
            new Date("2026-01-01"), new Date("2026-01-02"), new Date("2026-01-03"),
            // Jan 5 missed
            new Date("2026-01-06"), new Date("2026-01-07"), new Date("2026-01-08"), new Date("2026-01-09"), new Date("2026-01-10"),
            new Date("2026-01-12"), new Date("2026-01-13"), new Date("2026-01-14"), new Date("2026-01-15")
        ];

        const result = await calculator.calculate(employee, config, periodStart, periodEnd, workedDates, 0);

        // Base: 1500 (Assuming fixed semi-monthly even if absent? Spec "Manager removes the lunch benefit... because the employee missed". It doesn't explicitly say Base is reduced. But normally it is.
        // However, standard salary usually pays 30 days regardless, unless "Hourly".
        // "Manager removes lunch... and sunday".
        // If Base was deducted, it would be "Deduct day".
        // Let's assume Base IS NOT deducted for this specific "Salary" model unless specified?
        // Input User description: "The main motivation... is... manager has to recalculate... removes lunch and sunday".
        // It heavily implies the *Automatic Deductions* are the pain point.
        // But usually, if you miss work, you don't get paid for that day.
        // Let's assume we calculate Base as: (Monthly / 30) * DaysInPeriod? Or (Monthly / 2) - (DailyRate * Absences)?
        // Let's stick to "Quincena = Monthly / 2" for simplicity unless User Spec says "Hourly".
        // "Registers a full working day...".
        // I will assume for MVP: Base is fixed (1500). Only benefits change.
        // If this is wrong, we can adjust later.
        
        // Lunch: 12 * 10 = 120.
        // Sunday: Did they miss *entire* week Jan 5-10? No, worked Jan 6-10. So gets Sunday Jan 11.
        // Jan 4 Sunday: Worked Jan 1-3. Gets Sunday Jan 4.
        // Sundays: 2.
        
        // Gross: 1500 + 120 + 100 = 1720.
        // Net: 1720 - 105 = 1615.

        expect(result.lineItems.find(i => i.code === "LUNCH")?.amount).toBeCloseTo(120);
        expect(result.grossSalary).toBeCloseTo(1720, 2);
    });

    test("should remove sunday bonus if entire week missed", async () => {
        periodStart = new Date("2026-01-01");
        periodEnd = new Date("2026-01-15");
        
        // Missed entire week Jan 5-10.
        const workedDates = [
            new Date("2026-01-01"), new Date("2026-01-02"), new Date("2026-01-03"),
            // Week 2 empty
            new Date("2026-01-12"), new Date("2026-01-13"), new Date("2026-01-14"), new Date("2026-01-15")
        ];
        // Worked days: 3 (W1) + 4 (W3) = 7.

        const result = await calculator.calculate(employee, config, periodStart, periodEnd, workedDates, 0);

        // Lunch: 7 * 10 = 70.
        // Sunday Jan 4: Worked Jan 1-3. Eligible.
        // Sunday Jan 11: Missed Jan 5-10. NOT Eligible.
        // Sunday Bonus: 1 * 50 = 50.

        // Gross: 1500 + 70 + 50 = 1620.

        expect(result.lineItems.find(i => i.code === "SUNDAY_BONUS")?.amount).toBeCloseTo(50);
        expect(result.grossSalary).toBeCloseTo(1620, 2);
    });

    test("should add sales commission", async () => {
         periodStart = new Date("2026-01-01");
         periodEnd = new Date("2026-01-15");
         const workedDates: Date[] = []; // Irrelevant for commission test, but let's give 0 days.
         
         // Commission: Sales 1000 * 5% = 50.
         // Base: 1500.
         // Lunch: 0.
         // Sunday: 0 (Missed everything).
         
         const result = await calculator.calculate(employee, config, periodStart, periodEnd, workedDates, 1000);
         
         expect(result.lineItems.find(i => i.code === "COMMISSION")?.amount).toBeCloseTo(50);
         expect(result.grossSalary).toBeCloseTo(1500 + 50);
    });
});