import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Relation } from "typeorm";
import { Company } from "../contexts/identity/domain/Company.js";

@Entity()
export class PaycheckConfig {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "company_id" })
    companyId!: string;

    @Column({ type: "decimal", precision: 10, scale: 2, name: "sunday_bonus_amount", default: 0 })
    sundayBonusAmount!: number;

    @Column({ type: "decimal", precision: 5, scale: 2, name: "sales_commission_pct", default: 0 })
    salesCommissionPct!: number;

    // Standard Deductions/Benefits Config (as per spec description)
    @Column({ type: "decimal", precision: 5, scale: 2, name: "health_deduction_pct", default: 0 })
    healthDeductionPct!: number;

    @Column({ type: "decimal", precision: 5, scale: 2, name: "retirement_deduction_pct", default: 0 })
    retirementDeductionPct!: number;

    @Column({ type: "decimal", precision: 10, scale: 2, name: "lunch_benefit_amount", default: 0 })
    lunchBenefitAmount!: number;

    @ManyToOne(() => Company)
    @JoinColumn({ name: "company_id" })
    company!: Relation<Company>;
}
