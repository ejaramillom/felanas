import { Request, Response } from "express";
import { SalesLogRepository } from "../repositories/SalesLogRepository.js";
import { SalesLog } from "../entities/SalesLog.js";

export class SalesLogController {
    static async create(req: Request, res: Response) {
        if (!req.context) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { employeeId, periodStart, periodEnd, amount } = req.body;
        
        if (!employeeId || !periodStart || !periodEnd || amount === undefined) {
             return res.status(400).json({ message: "Missing required fields" });
        }

        const repo = new SalesLogRepository(req.context);
        const salesLog = new SalesLog();
        salesLog.employeeId = employeeId;
        salesLog.periodStart = new Date(periodStart);
        salesLog.periodEnd = new Date(periodEnd);
        salesLog.amount = Number(amount);
        salesLog.companyId = req.context.companyId;

        const saved = await repo.save(salesLog);
        return res.status(201).json(saved);
    }

    static async list(req: Request, res: Response) {
        if (!req.context) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const repo = new SalesLogRepository(req.context);
        const logs = await repo.find();
        return res.json(logs);
    }
}
