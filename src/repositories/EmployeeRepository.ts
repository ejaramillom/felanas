import { BaseRepository } from "./BaseRepository.js";
import { Employee } from "../entities/Employee.js";
import { CurrentContext } from "../types/Context.js";

export class EmployeeRepository extends BaseRepository<Employee> {
    constructor(context: any) {
        super(Employee, context);
    }
}
