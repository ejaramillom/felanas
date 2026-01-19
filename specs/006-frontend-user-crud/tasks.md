---
description: "Task list for Frontend User Management & Containerization"
---

# Tasks: Frontend User Management & Containerization

**Input**: Design documents from `/specs/006-frontend-user-crud/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.yaml

**Tests**: Tests are included as per spec (Unit, Integration, E2E).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, ESM migration, and basic container structure.

- [x] T001 Update package.json to set "type": "module" in project root
- [x] T002 Update tsconfig.json to set "module": "NodeNext" and "moduleResolution": "NodeNext" in project root
- [x] T003 [P] Refactor src/index.ts to use import/export and import.meta.url
- [ ] T004 [P] Refactor src/config/database.ts to use import/export
- [x] T005 [P] Refactor src/entities/User.ts and other entities to use import/export
- [x] T006 [P] Refactor src/middleware/auth.ts to use import/export
- [x] T007 [P] Create scripts/init-env.sh for environment variable initialization
- [x] T008 [P] Initialize Vite project in frontend/ directory with React and TypeScript template
- [x] T009 [P] Install frontend dependencies (@mui/material, @emotion/react, @emotion/styled, react-router-dom, axios) in frontend/package.json
- [x] T010 [P] Configure ts-jest for ESM support in jest.config.js
- [x] T011 [P] Install Playwright dependencies in project root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user stories can be fully implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T012 Create Dockerfile.backend in project root (Multi-stage, non-root user)
- [x] T013 Create Dockerfile.frontend in frontend/ directory (Multi-stage, Nginx, non-root)
- [x] T014 Create docker-compose.yml in project root (Services: db, backend, frontend)
- [x] T015 Verify local environment setup using scripts/init-env.sh and docker-compose up

**Checkpoint**: Foundation ready - containers start, ESM migration complete.

---

## Phase 3: User Story 1 - Secure Containerized Infrastructure (Priority: P1) 🎯 MVP

**Goal**: Deploy application stack using non-root containers and env vars.

**Independent Test**: `docker-compose up` starts all services; inspecting containers shows non-root UID; removing `.env` fails start.

### Tests for User Story 1

- [x] T016 [P] [US1] Create test to verify non-root user in running containers (manual or script-based check in tests/infra/container_security.test.ts if feasible, otherwise rely on manual verification per spec)

### Implementation for User Story 1

- [x] T017 [US1] Configure backend to read database credentials solely from process.env in src/config/database.ts
- [x] T018 [US1] Configure frontend Nginx to listen on non-privileged port (e.g., 8080) in frontend/nginx.conf
- [x] T019 [US1] Update docker-compose.yml to inject environment variables from .env file
- [x] T020 [US1] Verify no hardcoded secrets exist in codebase (manual review or script)

**Checkpoint**: Secure, containerized stack running.

---

## Phase 4: User Story 2 - User Management Interface (Priority: P1)

**Goal**: Admin users can manage system users via React Frontend.

**Independent Test**: Login as Admin -> Create User -> List Users -> Update User -> Delete User.

### Tests for User Story 2

- [x] T021 [P] [US2] Create integration tests for User API endpoints in tests/integration/user_api.test.ts
- [x] T022 [P] [US2] Create Playwright E2E test for User CRUD flow in tests/e2e/user_crud.spec.ts

### Implementation for User Story 2 - Backend

- [x] T023 [P] [US2] Implement UserController.list (GET /users) in src/controllers/UserController.ts
- [x] T024 [P] [US2] Implement UserController.create (POST /users) in src/controllers/UserController.ts
- [x] T025 [P] [US2] Implement UserController.update (PUT /users/:id) in src/controllers/UserController.ts
- [x] T026 [P] [US2] Implement UserController.delete (DELETE /users/:id) in src/controllers/UserController.ts
- [x] T027 [P] [US2] Define IAuthService interface for pluggable authentication in src/services/interfaces/IAuthService.ts
- [ ] T028 [P] [US2] Implement LocalAuthService (IAuthService) in src/services/LocalAuthService.ts
- [ ] T029 [P] [US2] Implement AuthController.login (POST /auth/login) in src/controllers/AuthController.ts
- [ ] T030 [US2] Register user and auth routes in src/routes/userRoutes.ts and src/routes/authRoutes.ts, add to src/index.ts
- [ ] T031 [US2] Apply authMiddleware to user routes in src/routes/userRoutes.ts (Admin check)

### Implementation for User Story 2 - Frontend

- [ ] T032 [P] [US2] Create API client service with Axios interceptors in frontend/src/services/api.ts
- [ ] T033 [P] [US2] Create AuthProvider context for managing JWT state in frontend/src/context/AuthContext.tsx
- [ ] T034 [P] [US2] Implement Login page component in frontend/src/pages/Login.tsx
- [ ] T035 [P] [US2] Implement Layout component (Sidebar/Header) in frontend/src/components/Layout.tsx
- [ ] T036 [P] [US2] Implement UserList component using MUI DataGrid in frontend/src/pages/UserList.tsx
- [ ] T037 [P] [US2] Implement UserForm dialog/page for Create/Edit in frontend/src/components/UserForm.tsx
- [ ] T038 [US2] Integrate components into App router in frontend/src/App.tsx

**Checkpoint**: Full CRUD functionality available in frontend.

---

## Phase 5: User Story 3 - ECMAScript Standardization (Priority: P2)

**Goal**: Codebase strictly follows ESM standards.

**Independent Test**: Build and run tests pass with `"type": "module"`.

### Tests for User Story 3

- [ ] T039 [P] [US3] Verify all unit tests run successfully with ts-jest ESM config

### Implementation for User Story 3

- [ ] T040 [US3] Scan codebase for any remaining CommonJS patterns (require, module.exports) and refactor
- [ ] T041 [US3] Verify build output (tsc) matches expected ESM structure in dist/

**Checkpoint**: Codebase is fully ESM compliant.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [ ] T042 [P] Update README.md with new setup instructions
- [ ] T043 Run full test suite (Unit + Integration + E2E)
- [ ] T044 Lint check entire project

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1.
- **User Story 1 & 3**: Can start after Phase 2 (US3 largely covered by Phase 1 setup but finalized here).
- **User Story 2**: Depends on Phase 2 (Infrastructure) and partly US1 (Database connection).

### Parallel Opportunities

- Frontend and Backend implementation in Phase 4 can run in parallel.
- Tests in Phase 4 can be written in parallel with implementation.
- Different components (List vs Form) in Frontend can be built in parallel.

## Implementation Strategy

1. **Infrastructure First**: Complete Phase 1 & 2 to get the environment stable.
2. **Backend Core**: Implement User API (Phase 4 Backend) to unblock Frontend.
3. **Frontend Integration**: Build UI against working API.
4. **E2E Verification**: Run Playwright tests to sign off.
