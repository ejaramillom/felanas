import { AppDataSource } from "../config/database.js";
import { Company } from "../entities/Company.js";
import { User, UserRole } from "../entities/User.js";
import { ActivationKey } from "../entities/ActivationKey.js";
import { EncryptionUtils } from "../utils/EncryptionUtils.js";
import bcrypt from "bcryptjs";

export interface RegistrationData {
    companyName: string;
    email: string;
    password: string;
    activationKey: string;
}

export class RegistrationService {
    static async register(data: RegistrationData): Promise<{ user: User, company: Company }> {
        const { companyName, email, password, activationKey } = data;

        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            // 1. Validate Activation Key
            const keyRepo = transactionalEntityManager.getRepository(ActivationKey);
            const keyRecord = await keyRepo.findOne({ where: { companyName, isUsed: false } });

            if (!keyRecord) {
                throw new Error("Invalid activation key for this company");
            }

            // Decrypt and compare
            const decryptedKey = EncryptionUtils.decrypt(keyRecord.encryptedKey);
            if (decryptedKey !== activationKey) {
                throw new Error("Invalid activation key");
            }

            // 2. Create Company
            const companyRepo = transactionalEntityManager.getRepository(Company);
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + 30);

            const company = companyRepo.create({
                name: companyName,
                currencyCode: "USD", // Default or from data
                trialEndsAt
            });
            await companyRepo.save(company);

            // 3. Create Admin User
            const userRepo = transactionalEntityManager.getRepository(User);
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = userRepo.create({
                username: email,
                passwordHash: hashedPassword,
                role: UserRole.ADMIN,
                companyId: company.id
            });
            await userRepo.save(user);

            // 4. Mark key as used
            keyRecord.isUsed = true;
            await keyRepo.save(keyRecord);

            return { user, company };
        });
    }
}
