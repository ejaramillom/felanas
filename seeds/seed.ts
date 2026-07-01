import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "@src/config/database.js";
import { ActivationKey } from "@src/contexts/identity/domain/ActivationKey.js";
import { EncryptionUtils } from "@src/shared/utils/EncryptionUtils.js";

dotenv.config();

const COMPANY_NAME = process.env.SEED_COMPANY_NAME ?? "Felanas Demo";
const RAW_KEY = process.env.SEED_ACTIVATION_KEY ?? "FELANAS-DEMO-KEY-2024";

async function seed() {
    await AppDataSource.initialize();

    const repo = AppDataSource.getRepository(ActivationKey);
    const existing = await repo.findOne({ where: { companyName: COMPANY_NAME } });

    if (existing) {
        console.log(`[seed] ActivationKey for "${COMPANY_NAME}" already exists — skipping.`);
    } else {
        await repo.save(repo.create({
            companyName: COMPANY_NAME,
            encryptedKey: EncryptionUtils.encrypt(RAW_KEY),
        }));
        console.log(`[seed] Created activation key for "${COMPANY_NAME}"`);
    }

    console.log(`[seed] Use these on /register:`);
    console.log(`  Company:        ${COMPANY_NAME}`);
    console.log(`  Activation Key: ${RAW_KEY}`);

    await AppDataSource.destroy();
}

(async () => {
    try {
        await seed();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
