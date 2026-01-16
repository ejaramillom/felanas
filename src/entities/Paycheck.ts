import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Employee } from "./Employee";
import { Company } from "./Company";
import { PaycheckLineItem } from "./PaycheckLineItem";

export enum PaycheckStatus {
    DRAFT = "DRAFT",
    FINALIZED = "FINALIZED",
    PAID = "PAID"
}

@Entity()
export class Paycheck {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    period_start!: Date;

    @Column()
    period_end!: Date;

    @Column("decimal", { precision: 10, scale: 2 })
    gross_salary!: number;

    @Column("decimal", { precision: 10, scale: 2 })
    net_salary!: number;

    @Column({
        type: "enum",
        enum: PaycheckStatus,
        default: PaycheckStatus.DRAFT
    })
    status!: PaycheckStatus;

    @Column({ name: "generated_at", default: () => "CURRENT_TIMESTAMP" })
    generatedAt!: Date;

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

    @OneToMany(() => PaycheckLineItem, (lineItem) => lineItem.paycheck, { cascade: true })
    lineItems!: PaycheckLineItem[];
}
