import { Company } from "@src/contexts/identity/domain/Company.js";
import { User, UserRole } from "@src/contexts/identity/domain/User.js";
import { ActivationKey } from "@src/contexts/identity/domain/ActivationKey.js";

export function createMockCompany(overrides: Partial<Company> = {}): Company {
    const c = new Company();
    c.id = overrides.id ?? "test-company-id";
    c.name = overrides.name ?? "Test Company";
    c.currencyCode = overrides.currencyCode ?? "USD";
    c.trialEndsAt = overrides.trialEndsAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return c;
}

export function createMockUser(overrides: Partial<User> = {}): User {
    const u = new User();
    u.id = overrides.id ?? "test-user-id";
    u.username = overrides.username ?? "admin@test.com";
    u.passwordHash = overrides.passwordHash ?? "$2b$10$placeholder";
    u.role = overrides.role ?? UserRole.ADMIN;
    u.companyId = overrides.companyId ?? "test-company-id";
    return u;
}

export function createMockActivationKey(overrides: Partial<ActivationKey> = {}): ActivationKey {
    const k = new ActivationKey();
    k.id = overrides.id ?? "test-key-id";
    k.companyName = overrides.companyName ?? "Test Company";
    k.encryptedKey = overrides.encryptedKey ?? "mock-encrypted-key";
    k.isUsed = overrides.isUsed ?? false;
    return k;
}