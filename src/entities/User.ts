import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Company } from "./Company";

export enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    VIEWER = "VIEWER"
}

@Entity()
@Unique(["company", "username"])
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    username!: string;

    @Column({ name: "password_hash" })
    passwordHash!: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.VIEWER
    })
    role!: UserRole;

    @Column({ name: "company_id" })
    companyId!: string;

    @ManyToOne(() => Company, (company) => company.users, { onDelete: "CASCADE" })
    @JoinColumn({ name: "company_id" })
    company!: Company;
}
