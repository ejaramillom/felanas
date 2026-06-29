# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (root)
```bash
./scripts/init-env.sh   # create .env from defaults (run once)
npm run dev             # start backend with ts-node/nodemon on port 3000
npm test                # run unit + integration tests (Jest)
npx jest tests/unit/auth.test.ts          # single unit test
npx jest tests/integration/user_api.test.ts  # single integration test
npm run build           # compile TypeScript to dist/
npm run migration:run   # run pending TypeORM migrations
npm run schema:sync     # sync schema without migrations (dev only)
```

### Frontend (`cd frontend`)
```bash
npm run dev    # Vite dev server on port 8080
npm run build  # tsc + vite build
npm run lint   # ESLint
```

### E2E (Playwright — reads `./e2e/` directory)
```bash
npx playwright test            # all e2e tests
npx playwright test e2e/auth.spec.ts   # single spec
```

### Full stack
```bash
docker-compose up --build  # postgres + backend + frontend
```

## Architecture

**Backend** — Node.js 22+, Express 5, TypeScript, TypeORM, PostgreSQL.  
**Frontend** — React 19, Vite, Material UI v7, React Router v7.

### Entry points
- `src/index.ts` — server entry: initializes DB (`AppDataSource`) and binds to port. Skips DB init when `NODE_ENV=test`.
- `src/app.ts` — Express app export (no listener). Imported by integration tests via supertest.
- `frontend/src/main.tsx` — React root.

> **Note**: `src/index.ts` and `src/app.ts` currently have divergent route sets; `app.ts` is the canonical app module being migrated toward.

### Multi-tenancy
Every entity carries a `company_id` column. All queries **must** scope to `companyId` — the middleware populates `req.context.companyId` from the JWT claim. TypeORM queries without this scope are a data-isolation bug.

### Service / Factory pattern
Business logic lives in `src/services/` as factory classes with a `call()` method returning a `Result<T>` (success/failure wrapper). Controllers are thin — they call the factory and map the result to an HTTP response.

### Directory layout (non-obvious parts)
```
src/
  app.ts              # Express app (tests import this)
  index.ts            # Server entry (binds port, inits DB)
  config/database.ts  # AppDataSource (TypeORM DataSource)
  entities/           # TypeORM entities — Company, User, Employee, Paycheck, Schedule, …
  services/
    payroll/          # Paycheck generation logic
    attendance/       # Attendance tracking
    scheduling/       # Schedule management
    interfaces/       # Shared service interfaces
  repositories/       # TypeORM repository wrappers
  middleware/         # authMiddleware (JWT → req.context)
  migrations/         # TypeORM migration files
  jobs/               # Cron/background jobs

frontend/src/
  context/            # React Context (AuthContext)
  pages/              # Route-level components
  components/         # Shared UI components (Layout, ProtectedRoute)
  services/           # Axios API clients

tests/
  unit/               # Jest unit tests (services, utilities)
  integration/        # Jest + supertest API tests (needs running DB)
  concurrency/        # Jest concurrency tests
  e2e/                # Playwright specs (additional; playwright.config.ts points to ./e2e/)

e2e/                  # Primary Playwright test directory (playwright.config.ts testDir)
```

### Test setup
- Jest ignores `*.spec.ts` files and anything under `/e2e/` — those are Playwright tests.
- Integration tests connect to a real PostgreSQL instance; set env vars in `.env` before running.
- `AppDataSource` must be initialized before integration tests run; see existing test files for the `beforeAll` pattern.

### Database
- `synchronize: false` in production — always use migrations.
- `logging: true` in development mode.
- Config reads from env vars; falls back to `postgres/postgres/felanas` defaults (matches `init-env.sh`).
