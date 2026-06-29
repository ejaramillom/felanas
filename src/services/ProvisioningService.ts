import { AppDataSource } from "../config/database.js";
import { Company } from "../contexts/identity/domain/Company.js";
import { User, UserRole } from "../contexts/identity/domain/User.js";
import bcrypt from "bcryptjs";

export class ProvisioningService {
    static async createCompanyWithAdmin(name: string, currencyCode: string, adminUsername: string, adminPassword: string) {
        return await AppDataSource.transaction(async (manager) => {
            const company = await manager.save(
                manager.create(Company, { name, currencyCode })
            );

            const admin = await manager.save(
                manager.create(User, {
                    username: adminUsername,
                    passwordHash: await bcrypt.hash(adminPassword, 10),
                    role: UserRole.ADMIN,
                    company,
                })
            );

            return { company, admin };
        });
    }
}
