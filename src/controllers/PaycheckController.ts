import { Request, Response } from "express";
import { PaycheckRepository } from "../repositories/PaycheckRepository.js";
import { PaycheckConfigRepository } from "../repositories/PaycheckConfigRepository.js";
import { HolidayRepository } from "../repositories/HolidayRepository.js";
import { SalesLogRepository } from "../repositories/SalesLogRepository.js";
import { EmployeeRepository } from "../repositories/EmployeeRepository.js";
import { AttendanceLogRepository } from "../repositories/AttendanceLogRepository.js";
import { AttendanceService } from "../services/attendance/AttendanceService.js";
import { PaycheckService } from "../services/payroll/PaycheckService.js";
import { AppDataSource } from "../config/database.js";

export class PaycheckController {
    
    private static getService(context: any) {
        const paycheckRepo = new PaycheckRepository(context);
        const configRepo = new PaycheckConfigRepository(context);
        const holidayRepo = new HolidayRepository(context);
        const salesRepo = new SalesLogRepository(context);
        const employeeRepo = new EmployeeRepository(context);
        const attendanceRepo = new AttendanceLogRepository(context);
        const attendanceService = new AttendanceService(attendanceRepo);
        
        return new PaycheckService(
            paycheckRepo,
            configRepo,
            holidayRepo,
            salesRepo,
            employeeRepo,
            attendanceService
        );
    }

    static async generate(req: Request, res: Response) {
        if (!req.context) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { employeeId, periodStart, periodEnd, salesAmount } = req.body;

        if (!employeeId || !periodStart || !periodEnd) {
            return res.status(400).json({ message: "Missing required fields: employeeId, periodStart, periodEnd" });
        }

        try {
            const service = PaycheckController.getService(req.context);
            const paycheck = await service.generatePaycheck(
                employeeId,
                new Date(periodStart),
                new Date(periodEnd),
                salesAmount ? Number(salesAmount) : undefined
            );
            return res.status(201).json(paycheck);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    static async downloadPdf(req: Request, res: Response) {
        if (!req.context) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID parameter is required" });
        }

        try {
            const service = PaycheckController.getService(req.context);
            const pdfBuffer = await service.getPaycheckPdf(id);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=paycheck-${id}.pdf`);
            res.send(pdfBuffer);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
    
    static async list(req: Request, res: Response) {
         if (!req.context) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const repo = new PaycheckRepository(req.context);
        const paychecks = await repo.find();
        return res.json(paychecks);
    }
}
