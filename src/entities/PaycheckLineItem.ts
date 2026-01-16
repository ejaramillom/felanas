import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Paycheck } from "./Paycheck";

export enum LineItemType {
    INCOME = "INCOME",
    DEDUCTION = "DEDUCTION",
    BENEFIT = "BENEFIT"
}

@Entity()
export class PaycheckLineItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        type: "enum",
        enum: LineItemType
    })
    type!: LineItemType;

    @Column()
    code!: string; // e.g., BASE_SALARY, HEALTH, LUNCH, SUNDAY_BONUS

    @Column()
    description!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;

    @Column({ name: "paycheck_id" })
    paycheckId!: string;

    @ManyToOne(() => Paycheck, (paycheck) => paycheck.lineItems, { onDelete: "CASCADE" })
    @JoinColumn({ name: "paycheck_id" })
    paycheck!: Paycheck;
}
