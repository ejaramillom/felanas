# FLN-009 — Phase 1: Login + Dashboard Foundation

## Goal
Working signup/login flow → manager dashboard skeleton.
Signup uses mock data (seeded ActivationKey). Design matches mocks.

## Architecture Decisions

### Backend: DDD Bounded Contexts
- `src/contexts/identity/` — Company, User, ActivationKey
- `src/contexts/payroll/` — Phase 2
- `src/contexts/workforce/` — Phase 2
- `src/shared/` — middleware, utils, types

### Frontend: FSD + Atomic + shadcn/ui
- Layers: shared → entities → features → widgets → pages → app
- shadcn atoms in `shared/ui/atoms/`
- Tailwind CSS (alongside MUI during migration)

### Device Auth: Signed Device Tokens (Phase 2)
- Ed25519 key pair generated on device
- Public key stored in `DeviceKey` entity
- `X-Device-Signature` header on each request
- Auth middleware verifies JWT + device signature

## Design Tokens (from docs/mocs/)

| Token | Value | Use |
|-------|-------|-----|
| Brand amber | `#c48b31` | Primary, buttons, active states |
| Brand dark | `#976317` | Hover/pressed |
| Brand bright | `#eab34e` | Logo highlight, accents |
| Dark bg | `#0a0a0a` | App background (dark mode) |
| Dark surface | `#141414` | Cards, panels |
| Dark card | `#212328` | Inner cards |
| Dark nav | `#edf1fc` | Bottom nav (frosted blue-lavender) |
| Dark text | `#eee8d9` | Primary text on dark |
| Light bg | `#f7e2d1` | App background (light — warm cream) |
| Light surface | `#f2d9c5` | Cards on light |
| Light text | `#141215` | Primary text on light |

## Implementation Steps

| Step | What | Commit |
|------|------|--------|
| 0 | Fix app.ts missing routes | fix: add missing auth/users/sales routes |
| 1 | Seeds layer | feat: add seed layer for dev and test data |
| 2 | Test DB isolation | feat: add test database isolation |
| 3 | Backend DDD — identity context | refactor: extract identity bounded context |
| 4 | Backend unit tests | test: add AuthService and RegistrationService unit tests |
| 5 | shadcn + Tailwind setup | feat: install tailwind and shadcn/ui |
| 6 | FSD directory structure | refactor: create FSD directory structure |
| 7 | Design tokens | feat: add design token layer (globals.css) |
| 8 | Auth pages rewrite | feat: rewrite login and register pages with shadcn |
| 9 | Dashboard skeleton | feat: add manager dashboard skeleton |
| 10 | Vercel config | feat: add vercel deployment config |
| 11 | Fix E2E tests | fix: align playwright config and e2e test assertions |

## Known Bugs Fixed in This Plan
- `ProvisioningService` stores passwords in plaintext → fixed in Step 1
- `app.ts` missing routes → fixed in Step 0
- `playwright.config.ts` wrong testDir → fixed in Step 11
- E2E tests hardcode port 5173 but Vite runs on 8080 → fixed in Step 11

## Open Questions (Post Phase 1)
- MUI removal from UserList (Phase 2)
- Device auth implementation (Phase 2)
- Vercel backend hosting decision (Railway / Render)

TASK_TYPE: CODE
