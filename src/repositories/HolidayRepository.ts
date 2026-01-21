import { BaseRepository } from "./BaseRepository.js";
import { Holiday } from "../entities/Holiday.js";

export class HolidayRepository extends BaseRepository<Holiday> {
    constructor(context: any) {
        super(Holiday, context);
    }
}
