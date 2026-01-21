import { BaseRepository } from "./BaseRepository.js";
import { Paycheck } from "../entities/Paycheck.js";

export class PaycheckRepository extends BaseRepository<Paycheck> {
    constructor(context: any) {
        super(Paycheck, context);
    }
}
