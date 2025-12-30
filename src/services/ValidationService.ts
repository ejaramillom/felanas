import { AppDataSource } from "../config/database";
import { Company } from "../entities/Company";

export class ValidationService {
    /**
     * Verifies that an entity belongs to the expected company.
     * This is useful for double-checking before performing sensitive operations
     * if the scoped repository wasn't used.
     */
    static async verifyOwnership(entityName: string, entityId: string, companyId: string): Promise<boolean> {
        const repo = AppDataSource.getRepository(entityName);
        const count = await repo.count({
            where: {
                id: entityId,
                companyId: companyId
            }
        });
        return count > 0;
    }

    static async companyExists(companyId: string): Promise<boolean> {
        const repo = AppDataSource.getRepository(Company);
        const count = await repo.count({ where: { id: companyId } });
        return count > 0;
    }
}
