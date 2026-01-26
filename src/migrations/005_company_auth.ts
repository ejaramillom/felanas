import { MigrationInterface, QueryRunner } from "typeorm";

export class CompanyAuth1737900000000 implements MigrationInterface {
    name = 'CompanyAuth1737900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add trial_ends_at to company
        await queryRunner.query(`
            ALTER TABLE "company" 
            ADD COLUMN "trial_ends_at" TIMESTAMP
        `);

        // Create activation_key table
        await queryRunner.query(`
            CREATE TABLE "activation_key" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "company_name" character varying NOT NULL,
                "encrypted_key" text NOT NULL,
                "is_used" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_activation_key_company_name" UNIQUE ("company_name"),
                CONSTRAINT "PK_activation_key_id" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "activation_key"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "trial_ends_at"`);
    }
}
