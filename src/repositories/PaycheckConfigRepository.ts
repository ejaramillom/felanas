import { ScopedRepository } from "./BaseRepository";
import { PaycheckConfig } from "../entities/PaycheckConfig";
import { DeepPartial } from "typeorm";

export class PaycheckConfigRepository extends ScopedRepository<PaycheckConfig> {
    constructor(context: any) {
        super(PaycheckConfig, context);
    }

    // Upsert logic for singleton
    async saveConfig(config: DeepPartial<PaycheckConfig>): Promise<PaycheckConfig> {
        // Since we scoped queries, findOne will look for config for THIS company
        const existing = await this.findOne({});
        
        if (existing) {
            return this.save({ ...existing, ...config });
        }
        return this.save(config);
    }
}
