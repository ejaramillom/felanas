import { BaseRepository } from "./BaseRepository.js";
import { PaycheckConfig } from "../entities/PaycheckConfig.js";
import { CurrentContext } from "../shared/types/Context.js";
import { DeepPartial } from "typeorm";

export class PaycheckConfigRepository extends BaseRepository<PaycheckConfig> {
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
