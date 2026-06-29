# Aether Adversarial Review — FLN-009
VERDICT: FAIL

## HIGH — Must fix before ship

1. [HIGH] Active /users/login bypass — UserController still mounted, no trial check, 1h TTL vs 24h, companyId from body. Parallel auth surface.
2. [HIGH] Deleted-company passthrough — middleware null-coalesces to undefined when company row gone → valid stale token passes auth
3. [HIGH] No CORS — frontend on different origin blocked in real deployment
4. [HIGH] JWT_SECRET fallback hardcoded string in both AuthService + auth middleware
5. [HIGH] ACTIVATION_KEY_SECRET fallback differs between seed and prod → silent registration 500
6. [HIGH] ESM missing .js extensions in userRoutes.ts → ERR_MODULE_NOT_FOUND at runtime
7. [HIGH] index.css overrides globals.css body bg (#242424 wins over cream tokens — brand theme broken)

## HIGH — Test coverage gaps
8. [HIGH] No test for trial expiration enforcement
9. [HIGH] No test for deleted-company bypass
10. [HIGH] No test for /users/login bypass path

## MED
11. AuthContext getMe typed to return token but /auth/me never returns one
12. EncryptionUtils duplicated — diverging edit breaks registration silently
13. authMiddleware duplicated — one patch leaves the other vulnerable
14. AuthContext double localStorage read + stalled loading state
15. Trial-expired user silently logged out with no message → loop
16. N+1 DB hit on every request for trial check (no cache)
17. AuthController.me NPE if company deleted between middleware + handler
18. MUI + Tailwind button reset conflict on UserList page
19. ACTIVATION_KEY_SECRET mismatch between unit test inline value and integration seed

## DDD Violations
20. AuthController imports AppDataSource directly (interface layer owns infra)
21. seeds/integration.seed.ts imports from src/entities/ not context domain
22. shared/middleware imports Company from identity context domain directly

## LOW
23. localStorage JWT (XSS readable) — architectural decision, not critical now
24. error.message.includes() crash on non-Error throws in legacy AuthController
