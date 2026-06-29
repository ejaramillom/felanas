import { DataSource } from "typeorm";
import { ActivationKey } from "@src/contexts/identity/domain/ActivationKey.js";
import { Company } from "@src/contexts/identity/domain/Company.js";
import { User, UserRole } from "@src/contexts/identity/domain/User.js";
import { EncryptionUtils } from "@src/shared/utils/EncryptionUtils.js";
import bcrypt from "bcryptjs";

export async function seedActivationKey(
    companyName: string,
    rawKey: string,
    ds: DataSource
): Promise<ActivationKey> {
    const repo = ds.getRepository(ActivationKey);
    const existing = await repo.findOne({ where: { companyName } });
    if (existing) return existing;
    return repo.save(repo.create({ companyName, encryptedKey: EncryptionUtils.encrypt(rawKey) }));
}

export async function seedCompanyWithAdmin(
    companyName: string,
    email: string,
    password: string,
    ds: DataSource
): Promise<{ company: Company; user: User }> {
    const companyRepo = ds.getRepository(Company);
    let company = await companyRepo.findOne({ where: { name: companyName } });
    if (!company) {
        company = await companyRepo.save(
            companyRepo.create({
                name: companyName,
                currencyCode: "USD",
                trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })
        );
    }

    const userRepo = ds.getRepository(User);
    let user = await userRepo.findOne({ where: { username: email, companyId: company.id } });
    if (!user) {
        const hash = await bcrypt.hash(password, 10);
        user = await userRepo.save(
            userRepo.create({ username: email, passwordHash: hash, role: UserRole.ADMIN, companyId: company.id })
        );
    }

    return { company, user };
}

export async function truncateAll(ds: DataSource): Promise<void> {
    await ds.query('TRUNCATE "user", "company", "activation_key", "paycheck_config" CASCADE');
}