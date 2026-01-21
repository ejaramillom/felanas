import { AttendanceLog } from "../../entities/AttendanceLog.js";
import { AttendanceLogRepository } from "../../repositories/AttendanceLogRepository.js";
import { Between } from "typeorm";

export class AttendanceService {
    constructor(private attendanceRepo: AttendanceLogRepository) {}

    /**
     * returns unique dates where the employee has recorded attendance (Full Days)
     */
    async getWorkedDates(employeeId: string, start: Date, end: Date): Promise<Date[]> {
        // Query logs for the period
        const logs = await this.attendanceRepo.find({
            where: {
                employeeId: employeeId,
                checkIn: Between(start, end) // Simple range check
            }
        });

        // Group by Date (YYYY-MM-DD)
        const daysMap = new Map<string, number>();
        
        logs.forEach(log => {
            const dateStr = new Date(log.checkIn).toISOString().split('T')[0] as string;
            const count = daysMap.get(dateStr) || 0;
            daysMap.set(dateStr, count + 1);
        });

        const workedDates: Date[] = [];
        
        // Rule: Need 2 check-ins (Morning + Afternoon) to count as Worked
        // This is a simplification of "Morning AND Afternoon".
        // Ideally we check times (e.g. one before 12PM, one after).
        // For MVP, assuming 2 sessions is enough.
        daysMap.forEach((count, dateStr) => {
            if (count >= 2) {
                workedDates.push(new Date(dateStr));
            }
        });

        return workedDates;
    }
}
