# Tasks: Company Entity & Data Isolation

**Input**: Design documents from `/specs/005-company-entity-isolation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Not explicitly requested in spec, but Plan Phase 4 mentions Integration/Cascade tests. I will include them as [P] tasks where appropriate for robustness.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize TypeScript project structure in src/
- [ ] T002 [P] Install dependencies (express, typeorm, pg, jsonwebtoken)
- [ ] T003 [P] Configure TypeORM in src/config/database.ts
- [ ] T004 [P] Setup Docker Compose for PostgreSQL in docker-compose.yml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. 
*Note: Includes Company/User entities as they are strict dependencies for all other models.*

- [ ] T005 Create Company entity definition in src/entities/Company.ts
- [ ] T006 Create User entity definition (with company_id) in src/entities/User.ts
- [ ] T007 Implement Context interface in src/types/Context.ts
- [ ] T008 Implement Auth Middleware (JWT extraction to Context) in src/middleware/auth.ts
- [ ] T009 [P] Create BaseRepository (or Scoped Repository helper) enforcing company_id filter in src/repositories/BaseRepository.ts
- [ ] T010 Setup initial migration for Company and User tables in src/migrations/001_initial_schema.ts

**Checkpoint**: Database has Company/User tables, and app has context awareness.

---

## Phase 3: User Story 1 - Data Isolation by Company (Priority: P1) 🎯 MVP

**Goal**: Store Manager views/manages only their company's data.

**Independent Test**: Create data for Company A and B manually (DB). Login as A. Verify API only returns A's data.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create Employee entity (with company_id) in src/entities/Employee.ts
- [ ] T012 [P] [US1] Create PaycheckConfig entity (singleton per company) in src/entities/PaycheckConfig.ts
- [ ] T013 [P] [US1] Create AttendanceLog entity in src/entities/AttendanceLog.ts
- [ ] T014 [US1] Implement EmployeeRepository (extending BaseRepository) in src/repositories/EmployeeRepository.ts
- [ ] T015 [US1] Implement PaycheckConfigRepository (enforcing singleton) in src/repositories/PaycheckConfigRepository.ts
- [ ] T016 [US1] Create EmployeeController (List/Get) in src/controllers/EmployeeController.ts
- [ ] T017 [US1] Define routes for Employee management in src/routes/employeeRoutes.ts
- [ ] T018 [US1] Integration Test: Verify cross-company read isolation in tests/integration/isolation.test.ts

**Checkpoint**: Data isolation is enforced for Employees and Configs.

---

## Phase 4: User Story 2 - Company Entity Definition & Provisioning (Priority: P2)

**Goal**: System Administrator creates Companies and initial Admins via CLI/API.

**Independent Test**: Run CLI command to create company. Verify DB record exists. Try creating Employee without company (should fail).

### Implementation for User Story 2

- [ ] T019 [P] [US2] Implement SuperAdmin Provisioning Service in src/services/ProvisioningService.ts
- [ ] T020 [US2] Create CLI script for provisioning Company+Admin in src/scripts/create-company.ts
- [ ] T021 [US2] Implement validation logic ensuring no orphaned data creation in src/services/ValidationService.ts
- [ ] T022 [US2] Test: Cascade Delete (Create Company -> Add Data -> Delete -> Verify Empty) in tests/integration/cascade.test.ts

**Checkpoint**: Companies can be strictly managed and provisioned.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T023 [P] Add concurrency tests for PaycheckConfig singleton in tests/concurrency/singleton.test.ts
- [ ] T024 [P] Update API documentation (OpenAPI/Swagger) in docs/api.yaml
- [ ] T025 Security Audit: Verify no IDOR vulnerabilities in Controller layer

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. Blocks everything.
- **User Story 1 (Phase 3)**: Depends on Foundational (needs BaseRepo and Context).
- **User Story 2 (Phase 4)**: Depends on Foundational (needs Company/User entities). Can run parallel to US1.

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can run in parallel.
- **Phase 3 (US1)**: Entities (T011, T012, T013) can be created in parallel. Repositories (T014, T015) can be created in parallel.
- **Cross-Phase**: US1 (Isolation logic) and US2 (Provisioning logic) are largely independent once Foundational (Phase 2) is done.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1.  Complete Setup & Foundational.
2.  Implement US1 (Isolation) to ensure the *security guarantee* is met first.
3.  Manually insert test data to verify US1.

### Full Feature

1.  Complete MVP.
2.  Implement US2 (Provisioning) to replace manual DB insertion with proper tooling.
3.  Run full suite of Integration/Cascade tests.
