import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Employee } from "./Employee.js";
import { Company } from "../contexts/identity/domain/Company.js";

export enum ShiftType {
    MORNING = "MORNING",
    AFTERNOON = "AFTERNOON"
}

@Entity()
@Unique(["employeeId", "date", "shift"]) // Prevent double booking
export class Schedule {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "date" })
    date!: string;

    @Column({
        type: "enum",
        enum: ShiftType
    })
    shift!: ShiftType;

    @Column({ name: "employee_id" })
    employeeId!: string;

    @ManyToOne(() => Employee, { onDelete: "CASCADE" })
    @JoinColumn({ name: "employee_id" })
    employee!: Employee;

    @Column({ name: "company_id" })
    companyId!: string;

    @ManyToOne(() => Company, { onDelete: "CASCADE" })
    @JoinColumn({ name: "company_id" })
    company!: Company;
}
