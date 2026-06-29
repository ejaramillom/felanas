import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, Relation } from "typeorm";
import { Company } from "../contexts/identity/domain/Company.js";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "first_name" })
    firstName!: string;

    @Column({ name: "last_name" })
    lastName!: string;

    @Column()
    email!: string;

    @Column({ name: "company_id" })
    companyId!: string;

    @Column({ type: "decimal", precision: 10, scale: 2, name: "base_salary", default: 0 })
    baseSalary!: number;

    @Column("simple-array", { default: "" })
    skills!: string[];

    @ManyToOne(() => Company, { onDelete: "CASCADE" })
    @JoinColumn({ name: "company_id" })
    company!: Relation<Company>;
}
