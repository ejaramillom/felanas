import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CurrentContext } from "../../shared/types/Context.js";
import { AppDataSource } from "../../config/database.js";
import { Company } from "../../contexts/identity/domain/Company.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_do_not_use_in_production";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No authorization header provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        if (!decoded.companyId || !decoded.userId) {
            return res.status(403).json({ message: "Invalid token claims" });
        }

        // Trial Expiration Check
        const companyRepo = AppDataSource.getRepository(Company);
        const company = await companyRepo.findOne({ where: { id: decoded.companyId } });

        if (company?.trialEndsAt && new Date() > company.trialEndsAt) {
            return res.status(403).json({ 
                message: "Company trial has expired",
                code: "TRIAL_EXPIRED"
            });
        }

        const context: CurrentContext = {
            companyId: decoded.companyId,
            userId: decoded.userId,
            userRole: decoded.role
        };

        req.context = context;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};