import { SchedulerService } from "../../../../src/services/scheduling/SchedulerService";
import { ScheduleRepository } from "../../../../src/repositories/ScheduleRepository";
import { EmployeeRepository } from "../../../../src/repositories/EmployeeRepository";
import { Employee } from "../../../../src/entities/Employee";
import { Schedule, ShiftType } from "../../../../src/entities/Schedule";

// Mock Repositories
const mockScheduleRepo = {
    save: jest.fn().mockImplementation((s) => Promise.resolve(s))
} as unknown as ScheduleRepository;

const mockEmployeeRepo = {
    find: jest.fn()
} as unknown as EmployeeRepository;

describe("SchedulerService", () => {
    let service: SchedulerService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new SchedulerService(mockScheduleRepo, mockEmployeeRepo);
    });

    test("should split shifts between two employees with same skill", async () => {
        // Setup
        const empA = new Employee(); empA.id = "A"; empA.skills = ["STORAGE"]; empA.companyId = "C1";
        const empB = new Employee(); empB.id = "B"; empB.skills = ["STORAGE"]; empB.companyId = "C1";
        
        (mockEmployeeRepo.find as jest.Mock).mockResolvedValue([empA, empB]);

        const start = new Date("2026-01-01");
        const end = new Date("2026-01-01"); // 1 day

        // Execute
        const result = await service.generateSchedule("C1", start, end);

        // Verify
        expect(result).toHaveLength(2); // Morning and Afternoon
        
        const morning = result.find(s => s.shift === ShiftType.MORNING);
        const afternoon = result.find(s => s.shift === ShiftType.AFTERNOON);

        expect(morning).toBeDefined();
        expect(afternoon).toBeDefined();
        
        // Ensure different employees
        expect(morning?.employeeId).not.toBe(afternoon?.employeeId);
        // One should be A, one B
        const ids = [morning?.employeeId, afternoon?.employeeId].sort();
        expect(ids).toEqual(["A", "B"]);
    });

    test("should schedule single employee for double shift if alone in skill", async () => {
        const empA = new Employee(); empA.id = "A"; empA.skills = ["CASHIER"]; empA.companyId = "C1";
        (mockEmployeeRepo.find as jest.Mock).mockResolvedValue([empA]);

        const result = await service.generateSchedule("C1", new Date("2026-01-01"), new Date("2026-01-01"));

        expect(result).toHaveLength(2);
        expect(result[0].employeeId).toBe("A");
        expect(result[1].employeeId).toBe("A");
        expect(result.some(s => s.shift === ShiftType.MORNING)).toBe(true);
        expect(result.some(s => s.shift === ShiftType.AFTERNOON)).toBe(true);
    });
});
