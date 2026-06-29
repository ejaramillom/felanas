import { BaseRepository } from "./BaseRepository.js";
import { Employee } from "../entities/Employee.js";
import { CurrentContext } from "../shared/types/Context.js";

export class EmployeeRepository extends BaseRepository<Employee> {
    constructor(context: any) {
        super(Employee, context);
    }
}
