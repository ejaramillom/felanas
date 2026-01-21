import { MigrationInterface, QueryRunner } from "typeorm";

export class AttendanceSchema1705341000000 implements MigrationInterface {
    name = 'AttendanceSchema1705341000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "attendance_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "employee_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                "checkIn" TIMESTAMP NOT NULL,
                "checkOut" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_attendance_log_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "attendance_log" 
            ADD CONSTRAINT "FK_attendance_log_employee_id" 
            FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "attendance_log" 
            ADD CONSTRAINT "FK_attendance_log_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance_log" DROP CONSTRAINT "FK_attendance_log_company_id"`);
        await queryRunner.query(`ALTER TABLE "attendance_log" DROP CONSTRAINT "FK_attendance_log_employee_id"`);
        await queryRunner.query(`DROP TABLE "attendance_log"`);
    }
}
