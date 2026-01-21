import { BaseRepository } from "./BaseRepository.js";
import { PaycheckLineItem } from "../entities/PaycheckLineItem.js";

export class PaycheckLineItemRepository extends BaseRepository<PaycheckLineItem> {
    constructor(context: any) {
        super(PaycheckLineItem, context);
    }
}
