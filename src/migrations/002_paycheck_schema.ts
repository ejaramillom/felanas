import { MigrationInterface, QueryRunner } from "typeorm";

export class PaycheckSchema1705340000000 implements MigrationInterface {
    name = 'PaycheckSchema1705340000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create Employee Table
        await queryRunner.query(`
            CREATE TABLE "employee" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "company_id" uuid NOT NULL,
                "base_salary" numeric(10,2) NOT NULL DEFAULT '0',
                "skills" text NOT NULL DEFAULT '',
                CONSTRAINT "PK_employee_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "employee" 
            ADD CONSTRAINT "FK_employee_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // 2. Create PaycheckConfig Table
        await queryRunner.query(`
            CREATE TABLE "paycheck_config" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "company_id" uuid NOT NULL,
                "sunday_bonus_amount" numeric(10,2) NOT NULL DEFAULT '0',
                "sales_commission_pct" numeric(5,2) NOT NULL DEFAULT '0',
                "health_deduction_pct" numeric(5,2) NOT NULL DEFAULT '0',
                "retirement_deduction_pct" numeric(5,2) NOT NULL DEFAULT '0',
                "lunch_benefit_amount" numeric(10,2) NOT NULL DEFAULT '0',
                CONSTRAINT "PK_paycheck_config_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "paycheck_config" 
            ADD CONSTRAINT "FK_paycheck_config_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // 3. Create Paycheck Table
        await queryRunner.query(`
            CREATE TYPE "paycheck_status_enum" AS ENUM('DRAFT', 'FINALIZED', 'PAID')
        `);
        await queryRunner.query(`
            CREATE TABLE "paycheck" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "period_start" TIMESTAMP NOT NULL,
                "period_end" TIMESTAMP NOT NULL,
                "gross_salary" numeric(10,2) NOT NULL,
                "net_salary" numeric(10,2) NOT NULL,
                "status" "paycheck_status_enum" NOT NULL DEFAULT 'DRAFT',
                "generated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "employee_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                CONSTRAINT "PK_paycheck_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "paycheck" 
            ADD CONSTRAINT "FK_paycheck_employee_id" 
            FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "paycheck" 
            ADD CONSTRAINT "FK_paycheck_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // 4. Create PaycheckLineItem Table
        await queryRunner.query(`
            CREATE TYPE "paycheck_line_item_type_enum" AS ENUM('INCOME', 'DEDUCTION', 'BENEFIT')
        `);
        await queryRunner.query(`
            CREATE TABLE "paycheck_line_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "paycheck_line_item_type_enum" NOT NULL,
                "code" character varying NOT NULL,
                "description" character varying NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                "paycheck_id" uuid NOT NULL,
                CONSTRAINT "PK_paycheck_line_item_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "paycheck_line_item" 
            ADD CONSTRAINT "FK_paycheck_line_item_paycheck_id" 
            FOREIGN KEY ("paycheck_id") REFERENCES "paycheck"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // 5. Create Schedule Table
        await queryRunner.query(`
            CREATE TYPE "schedule_shift_enum" AS ENUM('MORNING', 'AFTERNOON')
        `);
        await queryRunner.query(`
            CREATE TABLE "schedule" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "date" date NOT NULL,
                "shift" "schedule_shift_enum" NOT NULL,
                "employee_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                CONSTRAINT "UQ_schedule_employee_date_shift" UNIQUE ("employee_id", "date", "shift"),
                CONSTRAINT "PK_schedule_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "schedule" 
            ADD CONSTRAINT "FK_schedule_employee_id" 
            FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "schedule" 
            ADD CONSTRAINT "FK_schedule_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // 6. Create Holiday Table
        await queryRunner.query(`
            CREATE TABLE "holiday" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "company_id" uuid NOT NULL,
                "date" date NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "PK_holiday_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "holiday" 
            ADD CONSTRAINT "FK_holiday_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        // 7. Create SalesLog Table
        await queryRunner.query(`
            CREATE TABLE "sales_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "company_id" uuid NOT NULL,
                "employee_id" uuid NOT NULL,
                "period_start" date NOT NULL,
                "period_end" date NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                CONSTRAINT "PK_sales_log_id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "sales_log" 
            ADD CONSTRAINT "FK_sales_log_company_id" 
            FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "sales_log" 
            ADD CONSTRAINT "FK_sales_log_employee_id" 
            FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop SalesLog
        await queryRunner.query(`ALTER TABLE "sales_log" DROP CONSTRAINT "FK_sales_log_employee_id"`);
        await queryRunner.query(`ALTER TABLE "sales_log" DROP CONSTRAINT "FK_sales_log_company_id"`);
        await queryRunner.query(`DROP TABLE "sales_log"`);

        // Drop Holiday
        await queryRunner.query(`ALTER TABLE "holiday" DROP CONSTRAINT "FK_holiday_company_id"`);
        await queryRunner.query(`DROP TABLE "holiday"`);

        // Drop Schedule
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_schedule_company_id"`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_schedule_employee_id"`);
        await queryRunner.query(`DROP TABLE "schedule"`);
        await queryRunner.query(`DROP TYPE "schedule_shift_enum"`);

        // Drop PaycheckLineItem
        await queryRunner.query(`ALTER TABLE "paycheck_line_item" DROP CONSTRAINT "FK_paycheck_line_item_paycheck_id"`);
        await queryRunner.query(`DROP TABLE "paycheck_line_item"`);
        await queryRunner.query(`DROP TYPE "paycheck_line_item_type_enum"`);

        // Drop Paycheck
        await queryRunner.query(`ALTER TABLE "paycheck" DROP CONSTRAINT "FK_paycheck_company_id"`);
        await queryRunner.query(`ALTER TABLE "paycheck" DROP CONSTRAINT "FK_paycheck_employee_id"`);
        await queryRunner.query(`DROP TABLE "paycheck"`);
        await queryRunner.query(`DROP TYPE "paycheck_status_enum"`);

        // Drop PaycheckConfig
        await queryRunner.query(`ALTER TABLE "paycheck_config" DROP CONSTRAINT "FK_paycheck_config_company_id"`);
        await queryRunner.query(`DROP TABLE "paycheck_config"`);

        // Drop Employee
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_employee_company_id"`);
        await queryRunner.query(`DROP TABLE "employee"`);
    }
}
