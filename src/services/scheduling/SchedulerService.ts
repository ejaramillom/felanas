import { Employee } from "../../entities/Employee";
import { Schedule, ShiftType } from "../../entities/Schedule";
import { ScheduleRepository } from "../../repositories/ScheduleRepository";
import { EmployeeRepository } from "../../repositories/EmployeeRepository";

export class SchedulerService {
    constructor(
        private scheduleRepo: ScheduleRepository,
        private employeeRepo: EmployeeRepository
    ) {}

    /**
     * Generates a schedule for a given period.
     * Logic:
     * - Iterate through each day in the period.
     * - For each shift (Morning, Afternoon), assign available employees.
     * - Constraint: Employees with same skill should not overlap if possible (Soft Constraint for MVP?).
     *   Actually Spec FR-007 says: "ensure employees with the same exclusive skillset (e.g., Storage) are not scheduled in the same time block".
     *   "If skill requirement cannot be met... flag conflict".
     * 
     * Simplified Algorithm for MVP:
     * 1. Get all employees.
     * 2. Group by Skill.
     * 3. For each day:
     *    - For Morning: Pick one from each skill group.
     *    - For Afternoon: Pick one from each skill group (different from Morning if possible).
     *    - Constraint: Employee can work max 1 shift per day? Or 2? 
     *      Spec doesn't explicitly limit shifts per day, but "Morning AND Afternoon... registers full working day".
     *      So they CAN work both.
     *      But "Conflict Resolution" implies we want to spread them out?
     *      "Two storage employees should not be at the same time schedule... one needed in morning, one in afternoon".
     *      So if I have 2 Storage employees (A, B):
     *      - Morning: A
     *      - Afternoon: B
     *      (Avoid A & B both in Morning).
     * 
     * 4. Save Schedule.
     */
    async generateSchedule(companyId: string, startDate: Date, endDate: Date): Promise<Schedule[]> {
        // Clear existing schedule for period? Or fail?
        // Let's assume we overwrite or just append for now.
        
        const employees = await this.employeeRepo.find({ where: { companyId } });
        const schedules: Schedule[] = [];

        // Helper to get formatted date string
        const getDates = (start: Date, end: Date) => {
            const dates: Date[] = [];
            let current = new Date(start);
            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }
            return dates;
        };

        const dates = getDates(startDate, endDate);

        // Group employees by primary skill (assuming 1st skill is primary for MVP)
        const employeesBySkill: Record<string, Employee[]> = {};
        employees.forEach(emp => {
            const skill = emp.skills[0] || "GENERAL"; // Default if no skill
            if (!employeesBySkill[skill]) employeesBySkill[skill] = [];
            employeesBySkill[skill]?.push(emp); // Optional chaining to satisfy TS safely
        });

        for (const date of dates) {
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD (assuming simplified date handling)

            // For each skill group, try to cover shifts
            for (const skill in employeesBySkill) {
                const group = employeesBySkill[skill];
                if (!group || group.length === 0) continue;

                // Sort/Rotate group to distribute shifts?
                // Simple Round Robin based on date?
                // Or just:
                // If group size >= 2:
                //   Morning: Emp[0]
                //   Afternoon: Emp[1]
                // If group size == 1:
                //   Morning: Emp[0]
                //   Afternoon: Emp[0] (Double shift? Or just one? Spec says "flag conflict" if coverage missing)
                //   Let's assign Morning default.
                
                // Strategy:
                // Shift 1 (Morning): Take first available.
                // Shift 2 (Afternoon): Take next available (if any), else same (or leave empty if we want to force split? Spec implies split is desired).
                // "Generate best possible schedule... ensure same skillset not scheduled in same time block".
                // This implies "Don't put A and B in Morning". Put A in Morning, B in Afternoon.
                
                // Assign Morning
                const morningEmp = group[0];
                if (morningEmp) {
                    schedules.push(this.createScheduleEntity(morningEmp, dateStr as string, ShiftType.MORNING, companyId));
                }

                // Assign Afternoon
                // If we have more employees, pick the next one.
                if (group.length > 1) {
                    const afternoonEmp = group[1];
                    if (afternoonEmp) {
                        schedules.push(this.createScheduleEntity(afternoonEmp, dateStr as string, ShiftType.AFTERNOON, companyId));
                    }
                } else {
                    // Only 1 employee. Should they work afternoon too?
                    // "Skill Scarcity... flag conflict".
                    // Let's schedule them for Afternoon too for coverage, but this violates "Availability"? 
                    // Spec doesn't define max hours.
                    // Let's assuming 1 employee works BOTH if only 1 exists (Full Day).
                    if (morningEmp) {
                        schedules.push(this.createScheduleEntity(morningEmp, dateStr as string, ShiftType.AFTERNOON, companyId));
                    }
                }
            }
        }

        // Save all
        return this.scheduleRepo.saveMany(schedules);
    }

    private createScheduleEntity(employee: Employee, date: string, shift: ShiftType, companyId: string): Schedule {
        const schedule = new Schedule();
        schedule.employeeId = employee.id;
        schedule.date = date;
        schedule.shift = shift;
        schedule.companyId = companyId;
        return schedule;
    }
}
