import { AppDataSource } from "../config/database.js";
import { ActivationKey } from "../entities/ActivationKey.js";
import { EncryptionUtils } from "../utils/EncryptionUtils.js";
import dotenv from "dotenv";

dotenv.config();

const createKey = async () => {
    const args = process.argv.slice(2);
    const companyNameIndex = args.indexOf('--company');
    const keyIndex = args.indexOf('--key');

    if (companyNameIndex === -1 || keyIndex === -1) {
        console.error("Usage: npx ts-node src/scripts/create-activation-key.ts --company \"Name\" --key \"SECRET-KEY\"");
        process.exit(1);
    }

    const companyName = args[companyNameIndex + 1];
    const rawKey = args[keyIndex + 1];

    if (!companyName || !rawKey) {
        console.error("Missing company name or key value");
        process.exit(1);
    }

    try {
        await AppDataSource.initialize();
        
        const encryptedKey = EncryptionUtils.encrypt(rawKey);
        const keyRepo = AppDataSource.getRepository(ActivationKey);
        
        const newKey = keyRepo.create({
            companyName,
            encryptedKey
        });

        await keyRepo.save(newKey);
        
        console.log(`Successfully created activation key for "${companyName}"`);
        console.log(`Encrypted Storage: ${encryptedKey}`);
    } catch (error) {
        console.error("Error creating key:", error);
    } finally {
        await AppDataSource.destroy();
    }
};

createKey();
