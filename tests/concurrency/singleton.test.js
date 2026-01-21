import { AppDataSource } from "../../src/config/database";
import { PaycheckConfigRepository } from "../../src/repositories/PaycheckConfigRepository";
import { ProvisioningService } from "../../src/services/ProvisioningService";
describe("Singleton Concurrency", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
    });
    afterAll(async () => {
        await AppDataSource.destroy();
    });
    it("should prevent duplicate configs even with concurrent requests", async () => {
        const { company } = await ProvisioningService.createCompanyWithAdmin("Race Condition Corp", "USD", "raceadmin", "pass");
        // Simulate two concurrent requests trying to create a config
        const repo = new PaycheckConfigRepository({ companyId: company.id });
        const configData = {
            healthInsurancePercent: 5,
            retirementPercent: 5,
            lunchBenefitAmount: 10,
            companyId: company.id // ScopedRepository will override this anyway
        };
        // Try to save twice simultaneously
        const p1 = repo.saveConfig(configData);
        const p2 = repo.saveConfig(configData);
        await Promise.all([p1, p2]);
        // Verify only one exists (either via Upsert logic or DB constraint)
        const allConfigs = await repo.find();
        expect(allConfigs).toHaveLength(1);
    });
});
//# sourceMappingURL=singleton.test.js.map