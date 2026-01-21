import { AppDataSource } from "../config/database.js";
import { Company } from "../entities/Company.js";
import { User, UserRole } from "../entities/User.js";
import crypto from "crypto";
// import bcrypt from "bcrypt"; // Assuming bcrypt would be used for hashing

export class ProvisioningService {
    static async createCompanyWithAdmin(name: string, currencyCode: string, adminUsername: string, adminPassword: string) {
        return await AppDataSource.transaction(async (manager) => {
            // 1. Create Company
            const company = new Company();
            company.name = name;
            company.currencyCode = currencyCode;
            const savedCompany = await manager.save(company);

            // 2. Create Admin User
            const admin = new User();
            admin.username = adminUsername;
            // In real app: bcrypt.hashSync(adminPassword, 10)
            admin.passwordHash = adminPassword; 
            admin.role = UserRole.ADMIN;
            admin.company = savedCompany;
            
            await manager.save(admin);

            return { company: savedCompany, admin };
        });
    }
}
