import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("activation_key")
export class ActivationKey {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "company_name", unique: true })
    companyName!: string;

    @Column({ name: "encrypted_key" })
    encryptedKey!: string;

    @Column({ name: "is_used", default: false })
    isUsed!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}