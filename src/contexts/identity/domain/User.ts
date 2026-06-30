import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Relation } from "typeorm";
import bcrypt from "bcryptjs";
import { Company } from "./Company.js";

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
    company!: Relation<Company>;

    async comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.passwordHash);
    }
}