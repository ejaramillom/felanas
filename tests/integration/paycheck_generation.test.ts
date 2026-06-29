import request from 'supertest';
import app from '@src/app.js';
import { AppDataSource } from '@src/config/database.js';
import { Company } from '@src/contexts/identity/domain/Company.js';
import { Employee } from '@src/entities/Employee.js';
import { PaycheckConfig } from '@src/entities/PaycheckConfig.js';
import { User, UserRole } from '@src/entities/User.js';
import jwt from 'jsonwebtoken';

describe('Paycheck Generation Integration', () => {
    let companyId: string;
    let adminToken: string;
    let employeeId: string;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Clean up previous runs? (Optional, use dedicated test DB usually)
        // await AppDataSource.synchronize(true); // Dangerous if not test DB

        // 1. Create Company
        const companyRepo = AppDataSource.getRepository(Company);
        const company = companyRepo.create({
            name: 'Paycheck Test Corp',
            currencyCode: 'USD'
        });
        await companyRepo.save(company);
        companyId = company.id;

        // 2. Create User (Admin)
        const userRepo = AppDataSource.getRepository(User);
        const admin = userRepo.create({
            username: 'paycheck_admin',
            passwordHash: 'hashed',
            role: UserRole.ADMIN,
            companyId: companyId
        });
        await userRepo.save(admin);
        
        const secret = process.env.JWT_SECRET || "default_secret_do_not_use_in_production";
        adminToken = jwt.sign({ userId: admin.id, companyId: companyId, role: UserRole.ADMIN }, secret);

        // 3. Create PaycheckConfig
        const configRepo = AppDataSource.getRepository(PaycheckConfig);
        const config = configRepo.create({
            companyId: companyId,
            sundayBonusAmount: 50,
            salesCommissionPct: 5,
            healthDeductionPct: 4,
            retirementDeductionPct: 3,
            lunchBenefitAmount: 10
        });
        await configRepo.save(config);

        // 4. Create Employee
        const empRepo = AppDataSource.getRepository(Employee);
        const emp = empRepo.create({
            firstName: "Integration",
            lastName: "Tester",
            email: "test@felanas.com",
            companyId: companyId,
            baseSalary: 3000,
            skills: ["TESTING"]
        });
        await empRepo.save(emp);
        employeeId = emp.id;
    });

    afterAll(async () => {
        // Cleanup?
        // await AppDataSource.destroy(); // Keep connection alive if other tests run?
        // Usually good practice to close if this is the only suite, but jest runs sequentially?
        // Let's leave it open or destroy if standalone.
        if (AppDataSource.isInitialized) await AppDataSource.destroy();
    });

    test('POST /paychecks/generate should create a paycheck', async () => {
        const payload = {
            employeeId: employeeId,
            periodStart: "2026-01-01",
            periodEnd: "2026-01-15",
            salesAmount: 1000 // Force commission
        };

        const res = await request(app)
            .post('/paychecks/generate')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.employeeId).toBe(employeeId);
        expect(Number(res.body.gross_salary)).toBeGreaterThan(0);
        
        // Save ID for next test
        const paycheckId = res.body.id;
        
        // PDF Test
        const pdfRes = await request(app)
             .get(`/paychecks/${paycheckId}/pdf`)
             .set('Authorization', `Bearer ${adminToken}`);
        
        expect(pdfRes.status).toBe(200);
        expect(pdfRes.header['content-type']).toBe('application/pdf');
    });
});
