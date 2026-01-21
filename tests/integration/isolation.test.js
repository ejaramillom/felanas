import request from "supertest";
import app from "../../src/index";
import { AppDataSource } from "../../src/config/database";
import jwt from "jsonwebtoken";
import { ProvisioningService } from "../../src/services/ProvisioningService";
import { EmployeeRepository } from "../../src/repositories/EmployeeRepository";
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_do_not_use_in_production";
describe("Cross-Company Isolation", () => {
    let companyAId;
    let companyBId;
    let tokenA;
    let tokenB;
    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        // Clean up before tests
        await AppDataSource.query("TRUNCATE TABLE \"company\" CASCADE");
        // Setup data using ProvisioningService
        const { company: companyA, admin: adminA } = await ProvisioningService.createCompanyWithAdmin("Company A", "USD", "admin_a", "password_a");
        const { company: companyB, admin: adminB } = await ProvisioningService.createCompanyWithAdmin("Company B", "EUR", "admin_b", "password_b");
        companyAId = companyA.id;
        companyBId = companyB.id;
        tokenA = jwt.sign({ companyId: companyA.id, userId: adminA.id, role: adminA.role }, JWT_SECRET);
        tokenB = jwt.sign({ companyId: companyB.id, userId: adminB.id, role: adminB.role }, JWT_SECRET);
        // Seed an employee for Company B to ensure it's not visible to A
        const repoB = new EmployeeRepository({ companyId: companyBId, userId: adminB.id, userRole: adminB.role });
        await repoB.save({ fullName: "Employee B", status: "ACTIVE" });
        // Seed an employee for Company A to ensure it's not visible to B
        const repoA = new EmployeeRepository({ companyId: companyAId, userId: adminA.id, userRole: adminA.role });
        await repoA.save({ fullName: "Employee A", status: "ACTIVE" });
    });
    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });
    it("User A should not see Company B employees", async () => {
        const res = await request(app)
            .get("/employees")
            .set("Authorization", `Bearer ${tokenA}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        // Should only see Company A's employee
        expect(res.body).toHaveLength(1);
        expect(res.body[0].fullName).toBe("Employee A");
        // Explicitly verify no employees from Company B are returned
        const employeesFromB = res.body.filter((e) => e.companyId === companyBId);
        expect(employeesFromB).toHaveLength(0);
    });
    it("User B should not see Company A employees", async () => {
        const res = await request(app)
            .get("/employees")
            .set("Authorization", `Bearer ${tokenB}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        // Should only see Company B's employee
        expect(res.body).toHaveLength(1);
        expect(res.body[0].fullName).toBe("Employee B");
        // Explicitly verify no employees from Company A are returned
        const employeesFromA = res.body.filter((e) => e.companyId === companyAId);
        expect(employeesFromA).toHaveLength(0);
    });
});
//# sourceMappingURL=isolation.test.js.map