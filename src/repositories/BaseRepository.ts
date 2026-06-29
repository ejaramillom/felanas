import { Repository, EntityTarget, ObjectLiteral, FindOneOptions, DeepPartial, FindOptionsWhere, FindManyOptions, SaveOptions } from "typeorm";
import { AppDataSource } from "../config/database.js";
import { CurrentContext } from "../shared/types/Context.js";

export class BaseRepository<T extends ObjectLiteral> {
    private repository: Repository<T>;
    private companyId: string;

    constructor(entity: Function | string, context: CurrentContext) {
        this.repository = AppDataSource.getRepository(entity);
        this.companyId = context.companyId;
    }

    private applyScope(where?: FindOptionsWhere<T> | FindOptionsWhere<T>[]): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
        const scope = { companyId: this.companyId } as unknown as FindOptionsWhere<T>;
        
        if (!where) {
            return scope;
        }

        if (Array.isArray(where)) {
            return where.map(w => ({ ...w, ...scope }));
        }

        return { ...where, ...scope };
    }

    async find(options?: FindManyOptions<T>): Promise<T[]> {
        const scopedOptions = { ...options, where: this.applyScope(options?.where) };
        return this.repository.find(scopedOptions);
    }

    async findOne(options: FindOneOptions<T>): Promise<T | null> {
        const scopedOptions = { ...options, where: this.applyScope(options.where) };
        return this.repository.findOne(scopedOptions);
    }

    async save(entity: DeepPartial<T>, options?: SaveOptions): Promise<T> {
        const scoped = { ...entity, companyId: this.companyId } as DeepPartial<T>;
        if ((scoped as any).id) {
            const existing = await this.findOne({ where: { id: (scoped as any).id } as any });
            if (!existing) {
                throw new Error("Record not found or access denied");
            }
        }
        return this.repository.save(scoped, options);
    }

    // Add other methods as needed (delete, update, etc.)
    async delete(criteria: string | number | Date | number[] | string[] | Date[] | FindOptionsWhere<T>): Promise<any> {
        // For simple ID deletion, we must verify ownership first or convert to criteria
        if (typeof criteria !== 'object') {
             return this.repository.delete({ id: criteria, companyId: this.companyId } as unknown as FindOptionsWhere<T>);
        }
        
        const scopedCriteria = this.applyScope(criteria as FindOptionsWhere<T>);
        return this.repository.delete(scopedCriteria);
    }

    async saveMany(entities: DeepPartial<T>[]): Promise<T[]> {
        const scoped = entities.map(e => ({ ...e, companyId: this.companyId })) as DeepPartial<T>[];
        return this.repository.save(scoped);
    }
}