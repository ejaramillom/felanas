import { AppDataSource } from "../config/database";
import { ProvisioningService } from "../services/ProvisioningService";

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 4) {
        console.error("Usage: ts-node src/scripts/create-company.ts <name> <currency> <username> <password>");
        process.exit(1);
    }

    const [name, currency, username, password] = args;

    try {
        await AppDataSource.initialize();
        const result = await ProvisioningService.createCompanyWithAdmin(name, currency, username, password);
        console.log(`Successfully created company '${result.company.name}' with ID: ${result.company.id}`);
        console.log(`Admin user '${result.admin.username}' created.`);
    } catch (error) {
        console.error("Error creating company:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

main();
