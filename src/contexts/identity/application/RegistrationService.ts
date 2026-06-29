import bcrypt from "bcryptjs";
import { Company } from "../domain/Company.js";
import { User, UserRole } from "../domain/User.js";
import { ActivationKey } from "../domain/ActivationKey.js";
import { EncryptionUtils } from "../../../shared/utils/EncryptionUtils.js";
import { InvalidActivationKeyError } from "../domain/errors.js";
import type { RegistrationData } from "./dto.js";

export class RegistrationService {
    constructor(
        private keyRepo: { findOne(opts: any): Promise<ActivationKey | null>; save(k: ActivationKey): Promise<ActivationKey> },
        private companyRepo: { create(data: any): Company; save(c: Company): Promise<Company> },
        private userRepo: { create(data: any): User; save(u: User): Promise<User> }
    ) {}

    async register(data: RegistrationData): Promise<{ user: User; company: Company }> {
        const { companyName, email, password, activationKey } = data;

        const keyRecord = await this.keyRepo.findOne({ where: { companyName, isUsed: false } });
        if (!keyRecord) throw new InvalidActivationKeyError("Invalid activation key for this company");

        const decryptedKey = EncryptionUtils.decrypt(keyRecord.encryptedKey);
        if (decryptedKey !== activationKey) throw new InvalidActivationKeyError("Invalid activation key");

        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 30);

        const company = await this.companyRepo.save(
            this.companyRepo.create({ name: companyName, currencyCode: "USD", trialEndsAt })
        );

        const hash = await bcrypt.hash(password, 10);
        const user = await this.userRepo.save(
            this.userRepo.create({ username: email, passwordHash: hash, role: UserRole.ADMIN, companyId: company.id })
        );

        keyRecord.isUsed = true;
        await this.keyRepo.save(keyRecord);

        return { user, company };
    }
}