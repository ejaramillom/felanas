import { BaseRepository } from "./BaseRepository.js";
import { AttendanceLog } from "../entities/AttendanceLog.js";

export class AttendanceLogRepository extends BaseRepository<AttendanceLog> {
    constructor(context: any) {
        super(AttendanceLog, context);
    }
}
