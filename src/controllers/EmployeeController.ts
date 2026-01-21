import { Request, Response } from "express";
import { EmployeeRepository } from "../repositories/EmployeeRepository.js";

export class EmployeeController {
    static async list(req: Request, res: Response) {
        if (!req.context) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const repo = new EmployeeRepository(req.context);
        const employees = await repo.find();
        return res.json(employees);
    }

    static async create(req: Request, res: Response) {
        if (!req.context) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const repo = new EmployeeRepository(req.context);
        const employee = await repo.save(req.body);
        return res.status(201).json(employee);
    }

    static async get(req: Request, res: Response) {
        if (!req.context) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID parameter is required" });
        }

        const repo = new EmployeeRepository(req.context);
        const employee = await repo.findOne({ where: { id } });
        
        if (!employee) {
            return res.status(404).json({ message: "Not found" });
        }
        return res.json(employee);
    }
}
