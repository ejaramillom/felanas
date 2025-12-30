import { AppDataSource } from "../../src/config/database";
import { ProvisioningService } from "../../src/services/ProvisioningService";
import { Company } from "../../src/entities/Company";
import { User } from "../../src/entities/User";
import { Employee } from "../../src/entities/Employee";

describe("Cascade Delete Isolation", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    it("should delete all related data when Company is deleted", async () => {
        // 1. Provision Company
        const { company } = await ProvisioningService.createCompanyWithAdmin("Delete Corp", "USD", "deladmin", "pass");

        // 2. Add Employee to Company
        const empRepo = AppDataSource.getRepository(Employee);
        await empRepo.save({
            fullName: "To Be Deleted",
            status: "ACTIVE",
            company: company
        });

        // 3. Delete Company
        const companyRepo = AppDataSource.getRepository(Company);
        await companyRepo.delete(company.id);

        // 4. Verify Company is gone
        const companyCheck = await companyRepo.findOne({ where: { id: company.id } });
        expect(companyCheck).toBeNull();

        // 5. Verify User is gone (Cascade)
        const userRepo = AppDataSource.getRepository(User);
        const userCheck = await userRepo.findOne({ where: { companyId: company.id } });
        expect(userCheck).toBeNull();

        // 6. Verify Employee is gone (Cascade)
        const empCheck = await empRepo.findOne({ where: { companyId: company.id } });
        expect(empCheck).toBeNull();
    });
});
