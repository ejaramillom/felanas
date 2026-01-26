import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Relation } from "typeorm";
import { User } from "./User.js";

@Entity()
export class Company {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ name: "currency_code", length: 3 })
    currencyCode!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @Column({ name: "trial_ends_at", type: "timestamp", nullable: true })
    trialEndsAt?: Date;

    @OneToMany(() => User, (user) => user.company)
    users!: Relation<User[]>;
}
