import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1703940000000 implements MigrationInterface {
    name = 'InitialSchema1703940000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "company" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "currency_code" character varying(3) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_company_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM('ADMIN', 'MANAGER', 'VIEWER')
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "username" character varying NOT NULL,
                "password_hash" character varying NOT NULL,
                "role" "user_role_enum" NOT NULL DEFAULT 'VIEWER',
                "company_id" uuid NOT NULL,
                CONSTRAINT "UQ_user_company_username" UNIQUE ("company_id", "username"),
                CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD CONSTRAINT "FK_user_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_company_id"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
        await queryRunner.query(`DROP TABLE "company"`);
    }
}
