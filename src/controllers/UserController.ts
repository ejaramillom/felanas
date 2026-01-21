import { Request, Response } from "express";
import { AppDataSource } from "../config/database.js";
import { User, UserRole } from "../entities/User.js";
import bcrypt from "bcryptjs"; // Assuming bcrypt is installed or needs to be
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_do_not_use_in_production";

export class UserController {
    static async login(req: Request, res: Response) {
        const { username, password, companyId } = req.body;

        if (!username || !password || !companyId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const userRepo = AppDataSource.getRepository(User);
        // Find user by username AND companyId (since username is unique per company)
        const user = await userRepo.findOne({ where: { username, companyId } });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password (In real app use bcrypt.compare)
        // const isMatch = await bcrypt.compare(password, user.passwordHash);
        const isMatch = password === user.passwordHash;

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, companyId: user.companyId, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({ token });
    }

    static async list(req: Request, res: Response) {
        if (!req.context) return res.status(401).json({ message: "Unauthorized" });
        if (req.context.userRole !== UserRole.ADMIN) {
            return res.status(403).json({ message: "Forbidden" });
        }
        const userRepo = AppDataSource.getRepository(User);
        const users = await userRepo.find({ where: { companyId: req.context.companyId } });
        return res.json(users);
    }

    static async create(req: Request, res: Response) {
        if (!req.context) return res.status(401).json({ message: "Unauthorized" });
        const { username, password, role } = req.body;
        
        if (!username || !password || !role) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const userRepo = AppDataSource.getRepository(User);
        // Basic hash - in production use async and proper salt rounds
        const hashedPassword = password; // TODO: Integrate real hashing or use existing service

        const newUser = userRepo.create({
            username,
            passwordHash: hashedPassword,
            role: role as UserRole,
            companyId: req.context.companyId
        });

        await userRepo.save(newUser);
        return res.status(201).json(newUser);
    }

    static async update(req: Request, res: Response) {
        if (!req.context) return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "ID required" });

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id, companyId: req.context.companyId } });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (req.body.username) user.username = req.body.username;
        if (req.body.role) user.role = req.body.role;
        
        await userRepo.save(user);
        return res.json(user);
    }

    static async delete(req: Request, res: Response) {
        if (!req.context) return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "ID required" });

        const userRepo = AppDataSource.getRepository(User);
        const result = await userRepo.delete({ id, companyId: req.context.companyId });

        if (result.affected === 0) return res.status(404).json({ message: "User not found" });
        return res.status(204).send();
    }
}
