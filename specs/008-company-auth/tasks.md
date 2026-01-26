# Tasks: Company Authentication & Activation

**Input**: Design documents from `/specs/008-company-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan (AuthController, RegistrationService, etc.)
- [x] T002 [P] Configure environment variables in `.env` (ACTIVATION_KEY_SECRET, JWT_SECRET)
- [x] T003 Create database migration for `ActivationKey` table and `Company.trial_ends_at` column in `src/migrations/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Implement AES-256-GCM encryption utility in `src/utils/EncryptionUtils.ts`
- [x] T005 [P] Update `UserController` and `User` entity to use `bcryptjs` for password hashing in `src/controllers/UserController.ts` and `src/entities/User.ts`
- [x] T006 [P] Initialize `ActivationKey` entity in `src/entities/ActivationKey.ts`
- [x] T007 Update `Company` entity to include `trial_ends_at` in `src/entities/Company.ts`
- [x] T008 Implement `AuthService` for JWT generation and validation in `src/services/AuthService.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Company Registration & Activation (Priority: P1) 🎯 MVP

**Goal**: Enable new company registration using a pre-provisioned activation key.

**Independent Test**: Register with valid key/name -> verify Company created with `trial_ends_at` (30 days) and User created as `ADMIN`.

### Tests for User Story 1 (Requested in Plan) ⚠️

- [x] T009 [P] [US1] Unit test for registration logic in `tests/unit/services/RegistrationService.test.ts`
- [x] T010 [P] [US1] Contract test for `/auth/register` in `tests/integration/auth_api.test.ts` (Implemented in tests/integration/auth.test.ts)

### Implementation for User Story 1

- [x] T011 [US1] Implement `RegistrationService` for atomic Company and User creation in `src/services/RegistrationService.ts`
- [x] T012 [US1] Create `AuthController` with `register` endpoint in `src/controllers/AuthController.ts`
- [x] T013 [US1] Define authentication routes in `src/routes/authRoutes.ts` and mount in `src/app.ts`
- [x] T014 [P] [US1] Create `auth.ts` service for backend communication in `frontend/src/services/auth.ts`
- [x] T015 [US1] Create `RegisterForm` component in `frontend/src/components/auth/RegisterForm.tsx`
- [x] T016 [US1] Create `RegisterPage` in `frontend/src/pages/RegisterPage.tsx`
- [x] T017 [US1] Add registration route to `frontend/src/App.tsx`

**Checkpoint**: At this point, Company Registration should be fully functional and testable independently

---

## Phase 4: User Story 2 - User Login (Priority: P1)

**Goal**: Enable registered users to log into the platform.

**Independent Test**: Login with valid credentials -> verify JWT is stored and user redirected to dashboard.

### Tests for User Story 2 (Requested in Plan) ⚠️

- [x] T018 [P] [US2] Integration test for `/auth/login` endpoint in `tests/integration/auth_api.test.ts` (Implemented in tests/integration/auth.test.ts)

### Implementation for User Story 2

- [x] T019 [US2] Update `AuthController` with `login` endpoint in `src/controllers/AuthController.ts`
- [x] T020 [US2] Create `AuthContext` for global authentication state and persistence in `frontend/src/context/AuthContext.tsx`
- [x] T021 [US2] Create `LoginForm` component in `frontend/src/components/auth/LoginForm.tsx`
- [x] T022 [US2] Create `LoginPage` in `frontend/src/pages/LoginPage.tsx`
- [x] T023 [US2] Add login route to `frontend/src/App.tsx`

**Checkpoint**: At this point, both Registration and Login should be functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T024 [P] Implement `authMiddleware` improvements (e.g., trial expiration check) in `src/middleware/auth.ts`
- [x] T025 [P] Create script for generating activation keys in `src/scripts/create-activation-key.ts`
- [x] T026 Add E2E tests for the full auth journey in `tests/e2e/auth.spec.ts`
- [x] T027 Run `quickstart.md` validation and cleanup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS User Stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Final Phase)**: Depends on all stories.

### Parallel Opportunities

- T002 and T003 can run in parallel.
- T004, T005, T006 can run in parallel within Phase 2.
- US1 (Phase 3) and US2 (Phase 4) can proceed in parallel once Phase 2 is complete, although US2 logically follows registration.
- All tasks marked [P] within a phase can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch backend implementation
Task: "Implement RegistrationService for atomic Company and User creation in src/services/RegistrationService.ts"

# Launch frontend service (parallel to backend implementation)
Task: "Create auth.ts service for backend communication in frontend/src/services/auth.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational.
2. Complete User Story 1.
3. Validate: Manually create a key, register a company, verify DB state.

### Incremental Delivery

1. Foundation (Auth + Encryption + Migration)
2. Registration (US1) -> Value: Can onboard users manually.
3. Login (US2) -> Value: Users can return.
4. Security/Polish (Middleware + E2E)
