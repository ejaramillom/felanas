import { ScopedRepository } from "./BaseRepository";
import { Employee } from "../entities/Employee";

export class EmployeeRepository extends ScopedRepository<Employee> {
    constructor(context: any) {
        super(Employee, context);
    }

    // Add specific employee methods here if needed
}
