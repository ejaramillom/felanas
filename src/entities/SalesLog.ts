import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from "typeorm";
import { Company } from "../contexts/identity/domain/Company.js";
import { Employee } from "./Employee.js";

@Entity()
export class SalesLog {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "company_id" })
    companyId!: string;

    @Column({ name: "employee_id" })
    employeeId!: string;

    @Column({ type: "date", name: "period_start" })
    periodStart!: Date;

    @Column({ type: "date", name: "period_end" })
    periodEnd!: Date;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    amount!: number;

    @ManyToOne(() => Company)
    @JoinColumn({ name: "company_id" })
    company!: Relation<Company>;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: "employee_id" })
    employee!: Relation<Employee>;
}
