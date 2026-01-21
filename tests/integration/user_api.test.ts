import request from 'supertest';
import app from '../../src/app.js'; // Ensure .js extension for ESM imports
import { AppDataSource } from '../../src/config/database.js';
import { User, UserRole } from '../../src/entities/User.js';
import { Company } from '../../src/entities/Company.js';
import jwt from 'jsonwebtoken';

describe('User API Integration Tests', () => {
    let companyId: string;
    let adminToken: string;
    let viewerToken: string;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        
        // Setup test data
        const companyRepo = AppDataSource.getRepository(Company);
        const company = companyRepo.create({
            name: 'Test Company',
            currencyCode: 'USD'
        });
        await companyRepo.save(company);
        companyId = company.id;

        const userRepo = AppDataSource.getRepository(User);
        const admin = userRepo.create({
            username: 'admin_test',
            passwordHash: 'hashed_password',
            role: UserRole.ADMIN,
            companyId: companyId
        });
        await userRepo.save(admin);

        const viewer = userRepo.create({
            username: 'viewer_test',
            passwordHash: 'hashed_password',
            role: UserRole.VIEWER,
            companyId: companyId
        });
        await userRepo.save(viewer);

        const secret = process.env.JWT_SECRET || "default_secret_do_not_use_in_production";
        adminToken = jwt.sign({ userId: admin.id, companyId: companyId, role: UserRole.ADMIN }, secret);
        viewerToken = jwt.sign({ userId: viewer.id, companyId: companyId, role: UserRole.VIEWER }, secret);
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('GET /users', () => {
        it('should return list of users for admin', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it('should deny access for non-admin', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${viewerToken}`);
            
            expect(res.status).toBe(403);
        });
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            const newUser = {
                username: 'new_user',
                password: 'password123',
                role: 'MANAGER'
            };

            const res = await request(app)
                .post('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.username).toBe(newUser.username);
        });
    });
});
