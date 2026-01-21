import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Relation } from "typeorm";
import { Employee } from "./Employee.js";
import { Company } from "./Company.js";

@Entity()
export class AttendanceLog {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "employee_id" })
    employeeId!: string;

    @Column({ name: "company_id" })
    companyId!: string;

    @Column({ type: "timestamp" })
    checkIn!: Date;

    @Column({ type: "timestamp", nullable: true })
    checkOut?: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: "employee_id" })
    employee!: Relation<Employee>;

    @ManyToOne(() => Company)
    @JoinColumn({ name: "company_id" })
    company!: Relation<Company>;
}
