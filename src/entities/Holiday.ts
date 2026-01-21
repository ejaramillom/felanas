import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from "typeorm";
import { Company } from "./Company.js";

@Entity()
export class Holiday {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "company_id" })
    companyId!: string;

    @Column({ type: "date" })
    date!: Date;

    @Column()
    name!: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: "company_id" })
    company!: Relation<Company>;
}
