import { BaseRepository } from "./BaseRepository.js";
import { SalesLog } from "../entities/SalesLog.js";

export class SalesLogRepository extends BaseRepository<SalesLog> {
    constructor(context: any) {
        super(SalesLog, context);
    }
}
