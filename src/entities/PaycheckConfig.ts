import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Unique } from "typeorm";
import { Company } from "./Company";

@Entity()
@Unique(["companyId"]) // Enforce singleton per company at DB level
export class PaycheckConfig {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("decimal", { name: "health_insurance_percent", precision: 5, scale: 2 })
    healthInsurancePercent!: number;

    @Column("decimal", { name: "retirement_percent", precision: 5, scale: 2 })
    retirementPercent!: number;

    @Column("decimal", { name: "lunch_benefit_amount", precision: 10, scale: 2 })
    lunchBenefitAmount!: number;

    @Column({ name: "company_id" })
    companyId!: string;

    @OneToOne(() => Company, { onDelete: "CASCADE" })
    @JoinColumn({ name: "company_id" })
    company!: Company;
}
