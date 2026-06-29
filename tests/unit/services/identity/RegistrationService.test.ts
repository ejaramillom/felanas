import { RegistrationService } from "../../../../src/contexts/identity/application/RegistrationService.js";
import { EncryptionUtils } from "../../../../src/shared/utils/EncryptionUtils.js";
import { InvalidActivationKeyError } from "../../../../src/contexts/identity/domain/errors.js";
import { createMockCompany, createMockUser, createMockActivationKey } from "../../../../seeds/domain.seed.js";
import { UserRole } from "../../../../src/contexts/identity/domain/User.js";

process.env.ACTIVATION_KEY_SECRET = "f3a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0";

const RAW_KEY = "TEST-KEY-123";

function makeRepos(keyOverrides: Partial<ReturnType<typeof createMockActivationKey>> = {}) {
    const key = createMockActivationKey({
        companyName: "Acme Corp",
        encryptedKey: EncryptionUtils.encrypt(RAW_KEY),
        isUsed: false,
        ...keyOverrides,
    });

    const savedCompany = createMockCompany({ name: "Acme Corp" });
    const savedUser = createMockUser({ username: "admin@acme.com", role: UserRole.ADMIN });

    const keyRepo = {
        findOne: jest.fn().mockResolvedValue(key),
        save: jest.fn().mockResolvedValue(key),
    };
    const companyRepo = {
        create: jest.fn().mockReturnValue(savedCompany),
        save: jest.fn().mockResolvedValue(savedCompany),
    };
    const userRepo = {
        create: jest.fn().mockReturnValue(savedUser),
        save: jest.fn().mockResolvedValue(savedUser),
    };

    return { keyRepo, companyRepo, userRepo, key, savedCompany, savedUser };
}

const validData = { companyName: "Acme Corp", email: "admin@acme.com", password: "secret123", activationKey: RAW_KEY };

describe("RegistrationService.register", () => {
    it("creates company + admin user on valid key", async () => {
        const { keyRepo, companyRepo, userRepo, savedCompany, savedUser } = makeRepos();
        const svc = new RegistrationService(keyRepo, companyRepo, userRepo);

        const result = await svc.register(validData);

        expect(result.company).toBe(savedCompany);
        expect(result.user).toBe(savedUser);
        expect(userRepo.create).toHaveBeenCalledWith(expect.objectContaining({ role: UserRole.ADMIN }));
    });

    it("marks activation key as used", async () => {
        const { keyRepo, companyRepo, userRepo, key } = makeRepos();
        const svc = new RegistrationService(keyRepo, companyRepo, userRepo);

        await svc.register(validData);

        expect(keyRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isUsed: true }));
    });

    it("throws InvalidActivationKeyError when key not found", async () => {
        const { keyRepo, companyRepo, userRepo } = makeRepos();
        keyRepo.findOne.mockResolvedValue(null);
        const svc = new RegistrationService(keyRepo, companyRepo, userRepo);

        await expect(svc.register(validData)).rejects.toThrow(InvalidActivationKeyError);
    });

    it("throws InvalidActivationKeyError when key value is wrong", async () => {
        const { keyRepo, companyRepo, userRepo } = makeRepos();
        const svc = new RegistrationService(keyRepo, companyRepo, userRepo);

        await expect(svc.register({ ...validData, activationKey: "WRONG" })).rejects.toThrow(InvalidActivationKeyError);
    });
});
