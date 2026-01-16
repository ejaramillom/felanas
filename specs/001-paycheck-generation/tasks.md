# Tasks: Automated Paycheck Generation & Scheduling

**Input**: Design documents from `/specs/001-paycheck-generation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: TDD is explicitly requested in the plan for the calculation logic. Integration tests are required for API endpoints.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Install dependencies (pdfkit, @types/pdfkit, decimal.js, node-cron, @types/node-cron)
- [x] T002 Create Paycheck entity in src/entities/Paycheck.ts
- [x] T003 Create PaycheckLineItem entity in src/entities/PaycheckLineItem.ts
- [x] T004 Create Schedule entity in src/entities/Schedule.ts
- [ ] T005 [P] Update Employee entity (base_salary, skills) in src/entities/Employee.ts
- [ ] T006 [P] Update PaycheckConfig entity (sunday_bonus_amount, sales_commission_pct) in src/entities/PaycheckConfig.ts
- [ ] T007 Create PaycheckRepository in src/repositories/PaycheckRepository.ts
- [ ] T008 [P] Create ScheduleRepository in src/repositories/ScheduleRepository.ts
- [ ] T009 Create PaycheckLineItemRepository in src/repositories/PaycheckLineItemRepository.ts
- [ ] T010 Create migration for new entities and updates in src/migrations/002_paycheck_schema.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [ ] T011 Implement PdfGenerator service wrapper (PDFKit) in src/services/payroll/PdfGenerator.ts
- [ ] T012 Create MathUtils helper using decimal.js in src/utils/MathUtils.ts

**Checkpoint**: Entities exist, database is migrated, and helper services are ready.

---

## Phase 3: User Story 1 - Paycheck Configuration & Generation (Priority: P1)

**Goal**: Store Manager views/manages paychecks and generates PDFs.

**Independent Test**: Configure rules, create dummy employee, generate PDF, verify calculations.

### Implementation for User Story 1

- [ ] T013 [US1] Create PaycheckCalculator Service (Empty Shell) in src/services/payroll/PaycheckCalculator.ts
- [ ] T014 [US1] Write Unit Tests for PaycheckCalculator (TDD) in tests/unit/services/payroll/PaycheckCalculator.test.ts
- [ ] T015 [US1] Implement PaycheckCalculator logic (Gross, Deductions, Net) in src/services/payroll/PaycheckCalculator.ts
- [ ] T016 [US1] Implement PaycheckService (Orchestrator: Get Data -> Calculate -> Save) in src/services/payroll/PaycheckService.ts
- [ ] T017 [US1] Integrate PdfGenerator into PaycheckService in src/services/payroll/PaycheckService.ts
- [ ] T018 [US1] Create PaycheckController (Generate, List, Download) in src/controllers/PaycheckController.ts
- [ ] T019 [US1] Define routes for Paycheck management in src/routes/paycheckRoutes.ts
- [ ] T020 [US1] Integration Test: Generate Paycheck API flow in tests/integration/paycheck_generation.test.ts

**Checkpoint**: API can generate and return valid Paychecks and PDFs.

---

## Phase 4: User Story 2 - Automated Scheduling & Conflict Resolution (Priority: P2)

**Goal**: System automatically schedules employees based on skills.

**Independent Test**: Define two employees with same skill, run scheduler, verify no conflict.

### Implementation for User Story 2

- [ ] T021 [US2] Create SchedulerService (Empty Shell) in src/services/scheduling/SchedulerService.ts
- [ ] T022 [US2] Write Unit Tests for SchedulerService (TDD - Conflict Logic) in tests/unit/services/scheduling/SchedulerService.test.ts
- [ ] T023 [US2] Implement SchedulerService logic (Greedy Algorithm) in src/services/scheduling/SchedulerService.ts
- [ ] T024 [US2] Create ScheduleController (Generate, List) in src/controllers/ScheduleController.ts
- [ ] T025 [US2] Define routes for Schedule management in src/routes/scheduleRoutes.ts
- [ ] T026 [US2] Integration Test: Schedule Generation API flow in tests/integration/schedule_generation.test.ts

**Checkpoint**: Schedules are generated without conflicts.

---

## Phase 5: User Story 3 - Attendance Tracking (Priority: P3)

**Goal**: Ingest attendance data to refine paycheck calculations.

**Independent Test**: Simulate fingerprint scan, verify full working day registration.

### Implementation for User Story 3

- [ ] T027 [US3] Update PaycheckCalculator to use AttendanceLog data in src/services/payroll/PaycheckCalculator.ts
- [ ] T028 [US3] Create AttendanceService (Ingest, Validate Day) in src/services/attendance/AttendanceService.ts
- [ ] T029 [US3] Setup node-cron job for periodic aggregation/checks in src/jobs/AttendanceAggregator.ts
- [ ] T030 [US3] Integration Test: Attendance impact on Paycheck in tests/integration/attendance_paycheck.test.ts

**Checkpoint**: Attendance logs correctly affect paycheck calculations (deductions).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T031 [P] Add concurrency locking for Schedule generation in src/services/scheduling/SchedulerService.ts
- [ ] T032 [P] Optimize PDF generation performance (Stream vs Buffer) in src/services/payroll/PdfGenerator.ts
- [ ] T033 Verify Security: Ensure company_id isolation in all new Repositories
- [ ] T034 Update API documentation (OpenAPI) in specs/001-paycheck-generation/contracts/api.yaml

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup. Blocks everything.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on Foundational. Can run parallel to US1 (mostly).
- **User Story 3 (Phase 5)**: Depends on US1 (Calculation logic updates).

### Parallel Opportunities

- **Phase 1**: T002-T004 (Entities) can be created in parallel. T007-T009 (Repos) can be created in parallel.
- **Phase 3 (US1)**: Controller/Routes (T018, T019) can be scaffolded while Service (T015) is implemented.
- **Cross-Phase**: US1 and US2 are largely independent domains (Payroll vs Scheduling) sharing only Employee/Company entities.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1.  Complete Setup & Foundational.
2.  Implement US1 (Paycheck Generation) to deliver the core "Invoice" value.
3.  Manual data entry for attendance/schedules initially.

### Full Feature

1.  Complete MVP.
2.  Implement US2 (Scheduling) to automate rostering.
3.  Implement US3 (Attendance) to automate the input for US1.
