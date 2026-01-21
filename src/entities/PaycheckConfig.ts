import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Relation } from "typeorm";
import { Employee } from "./Employee.js";

@Entity()
export class PaycheckConfig {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "employee_id" })
    employeeId!: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    baseSalary!: number;

    @Column({ name: "pay_frequency" })
    payFrequency!: string;

    @OneToOne(() => Employee, (employee) => employee.paycheckConfig)
    @JoinColumn({ name: "employee_id" })
    employee!: Relation<Employee>;
}
