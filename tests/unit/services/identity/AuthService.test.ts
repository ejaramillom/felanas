import { AuthService } from "@src/contexts/identity/application/AuthService.js";
import { createMockUser } from "@seeds/domain.seed.js";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test_secret";

describe("AuthService.generateToken", () => {
    const user = createMockUser({ id: "uid-1", companyId: "cid-1", role: "ADMIN" as any });

    it("embeds userId, companyId, role in payload", () => {
        const token = AuthService.generateToken(user);
        const payload = jwt.decode(token) as any;
        expect(payload.userId).toBe("uid-1");
        expect(payload.companyId).toBe("cid-1");
        expect(payload.role).toBe("ADMIN");
    });

    it("sets ~24h expiry", () => {
        const token = AuthService.generateToken(user);
        const payload = jwt.decode(token) as any;
        const diffHours = (payload.exp - payload.iat) / 3600;
        expect(diffHours).toBeCloseTo(24, 0);
    });
});

describe("AuthService.verifyToken", () => {
    it("returns payload on valid token", () => {
        const user = createMockUser();
        const token = AuthService.generateToken(user);
        const payload = AuthService.verifyToken(token);
        expect(payload.userId).toBe(user.id);
    });

    it("throws on tampered token", () => {
        const user = createMockUser();
        const token = AuthService.generateToken(user) + "tampered";
        expect(() => AuthService.verifyToken(token)).toThrow();
    });
});
