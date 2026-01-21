import { BaseRepository } from "./BaseRepository.js";
import { Schedule } from "../entities/Schedule.js";

export class ScheduleRepository extends BaseRepository<Schedule> {
    constructor(context: any) {
        super(Schedule, context);
    }
}
