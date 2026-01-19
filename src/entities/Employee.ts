import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, Relation } from "typeorm";
import { Company } from "./Company.js";
import { PaycheckConfig } from "./PaycheckConfig.js";

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

    @ManyToOne(() => Company)
    @JoinColumn({ name: "company_id" })
    company!: Relation<Company>;

    @OneToOne(() => PaycheckConfig, (config) => config.employee)
    paycheckConfig!: Relation<PaycheckConfig>;
}
