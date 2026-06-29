# FLN-009 — Task Checklist

## Implementation Steps
- [x] Step 0: Fix index.ts → delegates to app.ts (`b4c0de0`)
- [x] Step 1: Seed layer — seed.ts, domain.seed.ts, integration.seed.ts (`db76947`)
- [x] Step 2: Test DB isolation — .env.test, database.ts branching, jest setupFiles (`8602746`)
- [x] Step 3: Backend DDD — identity bounded context extracted (`cb182b9`)
- [x] Step 4: Unit tests — AuthService (4) + RegistrationService (4) = 8 passing (`1362255`)
- [x] Step 5+6+7: Tailwind + shadcn/ui + FSD dirs + design tokens (`0b46b90`, `2006f8f`)
- [x] Step 8: Auth pages — LoginForm, RegisterForm, useLogin, useRegister, LogoutButton (`397a9ec`)
- [x] Step 9: Dashboard skeleton — Sidebar, DashboardPage (`397a9ec`)
- [x] Step 10: Vercel config (`397a9ec`)
- [x] Step 11: Playwright config + E2E assertion fix (`a3d2440`)

## Pipeline Reviews
- [x] Ponytail simplification review — net: -850 lines possible
- [x] Aether adversarial review — VERDICT: FAIL (7 HIGH issues)
- [ ] Code reviewer quality pass
- [ ] Persona reviewer
- [ ] Tester — npm test + playwright E2E

## Must-Fix Items (Aether FAIL)
- [x] 1. CORS middleware — `npm install cors` + add to src/app.ts (`9e073fa`)
- [x] 2. Remove /users/login bypass — deleted POST /login from src/routes/userRoutes.ts (`9e073fa`)
- [x] 3. Null company → 401 in src/shared/middleware/auth.ts (`9e073fa`)
- [x] 4. index.css body bg overrides design tokens — removed bg/color from :root (`5796324`)
- [x] 5. Missing .js extensions in src/routes/userRoutes.ts (`9e073fa`)
- [x] 6. Delete old duplicate files (10 backend + 4 frontend) + repoint routes to shared middleware (`8444e86`)
- [x] 7. Startup secrets guard — fail fast in production on default secrets (`9e073fa`)

## Post-Fix
- [ ] Run tester agent — gather evidence (test output) ← IN PROGRESS
- [ ] Update evaluation.md with test results + evidence
- [ ] Final commit + PR

## Deferred (Phase 2)
- [ ] Create ~/.claude/agents/aether/AGENT.md (replace general-purpose in harness)
- [ ] Update task-harness SKILL.md steps 5/6/10
- [ ] httpOnly cookie for JWT (device auth will replace in Phase 2)
- [ ] Trial check DB caching
- [ ] DDD: AuthController should not import AppDataSource directly
- [ ] MUI removal from UserList, NotFoundPage
- [ ] Device auth — Ed25519 signed device tokens + DeviceKey entity