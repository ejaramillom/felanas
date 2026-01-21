import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeDeleteSchema1705342000000 implements MigrationInterface {
    name = 'CascadeDeleteSchema1705342000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing FK
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_employee_company_id"`);
        
        // Add FK with CASCADE
        await queryRunner.query(`
            ALTER TABLE "employee" 
            ADD CONSTRAINT "FK_employee_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_employee_company_id"`);
        await queryRunner.query(`
            ALTER TABLE "employee" 
            ADD CONSTRAINT "FK_employee_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
