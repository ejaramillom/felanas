import { AppDataSource } from "@src/config/database.js";
import { RegistrationService } from "@src/contexts/identity/application/RegistrationService.js";
import { ActivationKey } from "@src/contexts/identity/domain/ActivationKey.js";
import { EncryptionUtils } from "@src/shared/utils/EncryptionUtils.js";
import { Company } from "@src/contexts/identity/domain/Company.js";
import { User } from "@src/entities/User.js";
import request from 'supertest';
import app from '@src/app.js';

describe('Authentication Integration Tests', () => {
    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    beforeEach(async () => {
        // Clear tables in correct order using QueryBuilder for clean delete
        await AppDataSource.query('TRUNCATE "user", "company", "activation_key", "paycheck_config" CASCADE');
    });

    it('should successfully register a company and admin user with a valid key', async () => {
        const companyName = 'Felanas Corp';
        const rawKey = 'SECRET-KEY-123';
        const encryptedKey = EncryptionUtils.encrypt(rawKey);

        const keyRepo = AppDataSource.getRepository(ActivationKey);
        await keyRepo.save(keyRepo.create({
            companyName,
            encryptedKey
        }));

        const registrationData = {
            companyName,
            email: 'admin@felanas.com',
            password: 'SecurePassword123!',
            activationKey: rawKey
        };

        const companyRepo = AppDataSource.getRepository(Company);
        const userRepo = AppDataSource.getRepository(User);
        const svc = new RegistrationService(keyRepo, companyRepo, userRepo);
        const result = await svc.register(registrationData);

        expect(result.company.name).toBe(companyName);
        expect(result.user.username).toBe(registrationData.email);
        expect(result.company.trialEndsAt).toBeDefined();

        const updatedKey = await keyRepo.findOne({ where: { companyName } });
        expect(updatedKey?.isUsed).toBe(true);
    });

    describe('API Endpoints', () => {
        it('POST /auth/register - should register and return token', async () => {
            const companyName = 'API Test Corp';
            const rawKey = 'API-KEY-123';
            const encryptedKey = EncryptionUtils.encrypt(rawKey);

            const keyRepo = AppDataSource.getRepository(ActivationKey);
            await keyRepo.save(keyRepo.create({ companyName, encryptedKey }));

            const res = await request(app)
                .post('/auth/register')
                .send({
                    companyName,
                    email: 'api@test.com',
                    password: 'password123',
                    activationKey: rawKey
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.username).toBe('api@test.com');
        });

        it('POST /auth/login - should login and return token', async () => {
            const companyRepo = AppDataSource.getRepository(Company);
            const company = await companyRepo.save(companyRepo.create({ name: 'Login Test', currencyCode: 'USD' }));

            const userRepo = AppDataSource.getRepository(User);
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.default.hash('secret123', 10);
            await userRepo.save(userRepo.create({
                username: 'login@test.com',
                passwordHash: hashedPassword,
                role: 'ADMIN' as any,
                companyId: company.id
            }));

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'secret123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.company.name).toBe('Login Test');
        });
    });
});