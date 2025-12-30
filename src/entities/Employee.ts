import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Company } from "./Company";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "full_name" })
    fullName!: string;

    @Column()
    status!: string;

    @Column({ name: "company_id" })
    companyId!: string;

    @ManyToOne(() => Company, { onDelete: "CASCADE" })
    @JoinColumn({ name: "company_id" })
    company!: Company;
}
