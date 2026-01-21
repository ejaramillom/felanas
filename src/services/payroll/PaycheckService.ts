import { Employee } from "../../entities/Employee.js";
import { PaycheckConfig } from "../../entities/PaycheckConfig.js";
import { Paycheck, PaycheckStatus } from "../../entities/Paycheck.js";
import { PaycheckLineItem, LineItemType } from "../../entities/PaycheckLineItem.js";
import { PaycheckRepository } from "../../repositories/PaycheckRepository.js";
import { PaycheckConfigRepository } from "../../repositories/PaycheckConfigRepository.js";
import { HolidayRepository } from "../../repositories/HolidayRepository.js";
import { SalesLogRepository } from "../../repositories/SalesLogRepository.js";
import { EmployeeRepository } from "../../repositories/EmployeeRepository.js";
import { PaycheckCalculator } from "./PaycheckCalculator.js";
import { PdfGenerator } from "./PdfGenerator.js";
import { AttendanceService } from "../attendance/AttendanceService.js";
import { Between } from "typeorm";

export class PaycheckService {
    private calculator: PaycheckCalculator;

    constructor(
        private paycheckRepo: PaycheckRepository,
        private configRepo: PaycheckConfigRepository,
        private holidayRepo: HolidayRepository,
        private salesRepo: SalesLogRepository,
        private employeeRepo: EmployeeRepository,
        private attendanceService: AttendanceService
    ) {
        this.calculator = new PaycheckCalculator();
    }

    async generatePaycheck(
        employeeId: string,
        periodStart: Date,
        periodEnd: Date,
        manualSalesAmount?: number
    ): Promise<Paycheck> {
        // 1. Fetch Config
        const config = await this.configRepo.findOne({});
        if (!config) {
            throw new Error("Paycheck Configuration not found for this company.");
        }

        // 2. Fetch Employee
        const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
        if (!employee) {
            throw new Error("Employee not found.");
        }

        // 3. Get Worked Dates
        const workedDates = await this.attendanceService.getWorkedDates(employeeId, periodStart, periodEnd);

        // 4. Get Holidays
        const holidays = await this.holidayRepo.find({
            where: {
                date: Between(periodStart, periodEnd)
            }
        });
        
        // Add Holidays to workedDates (Logic: Holidays count as worked)
        // Avoid duplicates
        holidays.forEach(h => {
            const hDate = new Date(h.date);
            const exists = workedDates.some(d => d.getTime() === hDate.getTime());
            if (!exists) {
                workedDates.push(hDate);
            }
        });
        // Sort dates
        workedDates.sort((a, b) => a.getTime() - b.getTime());

        // 5. Get Sales (if not manual)
        let salesTotal = manualSalesAmount || 0;
        if (manualSalesAmount === undefined) {
             const salesLogs = await this.salesRepo.find({
                 where: {
                     employeeId: employeeId,
                     periodStart: Between(periodStart, periodEnd) // Simplified logic: logs strictly in period?
                     // Ideally we sum up all logs overlapping. For MVP, assume logs match period or fall within.
                 }
             });
             salesTotal = salesLogs.reduce((sum, log) => sum + Number(log.amount), 0);
        }

        // 6. Calculate
        const result = await this.calculator.calculate(employee, config, periodStart, periodEnd, workedDates, salesTotal);

        // 7. Save Paycheck
        const paycheck = new Paycheck();
        paycheck.employeeId = employeeId;
        paycheck.companyId = employee.companyId; // Should be same as context
        paycheck.period_start = periodStart;
        paycheck.period_end = periodEnd;
        paycheck.gross_salary = result.grossSalary;
        paycheck.net_salary = result.netSalary;
        paycheck.status = PaycheckStatus.DRAFT;
        paycheck.generatedAt = new Date();
        
        // Save parent first
        const savedPaycheck = await this.paycheckRepo.save(paycheck);

        // 8. Save Line Items
        const lineEntities = result.lineItems.map(item => {
            const li = new PaycheckLineItem();
            li.paycheckId = savedPaycheck.id;
            li.code = item.code;
            li.description = item.description;
            li.amount = item.amount;
            // Map string type to Enum
            li.type = item.type as LineItemType; 
            return li;
        });

        // We need PaycheckLineItemRepository injected? Or use cascade?
        // Paycheck entity has: @OneToMany(() => PaycheckLineItem, ... { cascade: true })
        // So we can assign lineItems to paycheck and save paycheck again?
        // Or save lineItems directly.
        // Let's use cascade if configured.
        savedPaycheck.lineItems = lineEntities;
        return this.paycheckRepo.save(savedPaycheck);
    }

    async getPaycheckPdf(paycheckId: string): Promise<Buffer> {
        const paycheck = await this.paycheckRepo.findOne({
            where: { id: paycheckId },
            relations: ["employee", "lineItems", "company"]
        });

        if (!paycheck) {
            throw new Error("Paycheck not found.");
        }

        return PdfGenerator.generatePaycheckPdf(paycheck);
    }
}
