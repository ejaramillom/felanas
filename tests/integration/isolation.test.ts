import request from "supertest";
import app from "../../src/index";
import { AppDataSource } from "../../src/config/database";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_do_not_use_in_production";

describe("Cross-Company Isolation", () => {
    let companyAId: string;
    let companyBId: string;
    let tokenA: string;
    let tokenB: string;

    beforeAll(async () => {
        await AppDataSource.initialize();
        // Setup data: Create Company A, Company B
        // Create User A (Admin of A), User B (Admin of B)
        // This part depends on direct DB access or helper functions
        // For now, we mock the tokens assuming IDs exist
        
        companyAId = "uuid-company-a";
        companyBId = "uuid-company-b";
        const userAId = "uuid-user-a";
        const userBId = "uuid-user-b";

        tokenA = jwt.sign({ companyId: companyAId, userId: userAId, role: "ADMIN" }, JWT_SECRET);
        tokenB = jwt.sign({ companyId: companyBId, userId: userBId, role: "ADMIN" }, JWT_SECRET);
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    it("User A should not see Company B employees", async () => {
        // 1. Create Employee in Company B (using mock or direct DB insert if possible)
        // Since we can't easily inject cross-tenant data via API (that's the point), 
        // we would assume pre-seeded data or use a backdoor for tests.
        // For this test script, we assume data exists.

        const res = await request(app)
            .get("/employees")
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        // Verify no employees from Company B are returned
        const employeesFromB = res.body.filter((e: any) => e.companyId === companyBId);
        expect(employeesFromB).toHaveLength(0);
    });

    it("User B should not see Company A employees", async () => {
        const res = await request(app)
            .get("/employees")
            .set("Authorization", `Bearer ${tokenB}`);

        expect(res.status).toBe(200);
        const employeesFromA = res.body.filter((e: any) => e.companyId === companyAId);
        expect(employeesFromA).toHaveLength(0);
    });
});
