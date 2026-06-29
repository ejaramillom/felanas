import { Request, Response } from "express";
import { RegistrationService } from "../application/RegistrationService.js";
import { AuthService } from "../application/AuthService.js";
import { AppDataSource } from "../../../config/database.js";
import { User } from "../domain/User.js";
import { Company } from "../domain/Company.js";
import { ActivationKey } from "../domain/ActivationKey.js";

export class AuthController {
    static async register(req: Request, res: Response) {
        const { companyName, email, password, activationKey } = req.body;
        if (!companyName || !email || !password || !activationKey) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        try {
            const result = await AppDataSource.transaction(async (mgr) => {
                const service = new RegistrationService(
                    mgr.getRepository(ActivationKey),
                    mgr.getRepository(Company),
                    mgr.getRepository(User)
                );
                return service.register({ companyName, email, password, activationKey });
            });

            const token = AuthService.generateToken(result.user);
            return res.status(201).json({
                token,
                user: { id: result.user.id, username: result.user.username, role: result.user.role, companyId: result.user.companyId },
                company: { id: result.company.id, name: result.company.name, trialEndsAt: result.company.trialEndsAt }
            });
        } catch (error: any) {
            if (error.message?.includes("activation key")) {
                return res.status(400).json({ message: error.message });
            }
            console.error("Registration error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOne({ where: { username: email }, relations: ["company"] });

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = AuthService.generateToken(user);

            return res.json({
                token,
                user: { id: user.id, username: user.username, role: user.role, companyId: user.companyId },
                company: { id: user.company.id, name: user.company.name, trialEndsAt: user.company.trialEndsAt }
            });
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    static async me(req: Request, res: Response) {
        if (!req.context) return res.status(401).json({ message: "Unauthorized" });

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ 
            where: { id: req.context.userId }, 
            relations: ["company"] 
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({
            user: { id: user.id, username: user.username, role: user.role, companyId: user.companyId },
            company: { id: user.company.id, name: user.company.name, trialEndsAt: user.company.trialEndsAt }
        });
    }
}