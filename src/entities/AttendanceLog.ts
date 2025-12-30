import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "./Employee";
import { Company } from "./Company";

@Entity()
export class AttendanceLog {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    timestamp!: Date;

    @Column({ type: "enum", enum: ["IN", "OUT"] })
    type!: "IN" | "OUT";

    @Column({ name: "employee_id" })
    employeeId!: string;

    @ManyToOne(() => Employee, { onDelete: "CASCADE" })
    @JoinColumn({ name: "employee_id" })
    employee!: Employee;

    // Denormalized company_id for efficient filtering/isolation check
    @Column({ name: "company_id" })
    companyId!: string;

    @ManyToOne(() => Company, { onDelete: "CASCADE" })
    @JoinColumn({ name: "company_id" })
    company!: Company;
}
