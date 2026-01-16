# Implementation Plan: Automated Paycheck Generation & Scheduling

**Branch**: `001-paycheck-generation` | **Date**: 2026-01-15 | **Spec**: `specs/001-paycheck-generation/spec.md`
**Input**: Feature specification from `/specs/001-paycheck-generation/spec.md`

## Summary

This feature implements the core payroll engine for Felanas. It allows Store Managers to automatically generate PDF paychecks based on configured rules (health, retirement) and attendance data. It also includes an automated scheduler to assign shifts to employees based on skills, avoiding conflicts.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+
**Primary Dependencies**:
-   `pdfkit`: For server-side invoice/paycheck PDF generation.
-   `decimal.js`: For precise financial calculations.
-   `node-cron`: For scheduling the recurring generation tasks.
**Storage**: PostgreSQL (extending existing schema).
**Testing**: Jest (Unit + Integration).
**Project Type**: Backend API (Express).
**Performance Goals**: Generate 50 PDFs in < 5 seconds.
**Constraints**: Must strictly respect `company_id` isolation.

## Constitution Check

-   **Architectural Integrity**: Domain logic (`PaycheckCalculator`, `SchedulerService`) is separated from Controllers. Isolation is enforced via `ScopedRepository`.
-   **Code Quality**: Will use Service Objects for complex logic.
-   **Testing Standards**: TDD for the calculation logic (critical financial path).
-   **Security**: Authentication required for all endpoints.
-   **Observability**: Logging of generation jobs.

## Project Structure

### Documentation (this feature)

```text
specs/001-paycheck-generation/
├── plan.md              # This file
├── research.md          # Technology choices
├── data-model.md        # Entity definitions
├── quickstart.md        # Usage guide
├── contracts/           # API OpenApi spec
└── tasks.md             # Execution steps
```

### Source Code (repository root)

```text
src/
├── controllers/
│   ├── PaycheckController.ts
│   └── ScheduleController.ts
├── services/
│   ├── payroll/
│   │   ├── PaycheckCalculator.ts
│   │   └── PdfGenerator.ts
│   └── scheduling/
│       └── SchedulerService.ts
├── entities/
│   ├── Paycheck.ts
│   ├── PaycheckLineItem.ts
│   └── Schedule.ts
└── routes/
    ├── paycheckRoutes.ts
    └── scheduleRoutes.ts
```

## Implementation Phases

### Phase 1: Domain Modeling & Persistence
-   Create migrations for `Paycheck`, `LineItems`, `Schedule`.
-   Update `Employee` with `base_salary` and `skills`.
-   Create Repositories.

### Phase 2: Core Business Logic (TDD)
-   Implement `PaycheckCalculator`: Input (Employee, Config, Attendance) -> Output (Net Pay, Line Items).
-   Implement `SchedulerService`: Input (Employees, Constraints) -> Output (Schedule).
-   **Critical**: Write unit tests for math accuracy before implementation.

### Phase 3: Infrastructure
-   Implement `PdfGenerator` service using `pdfkit`.
-   Setup `node-cron` job (skeleton).

### Phase 4: API & Integration
-   Create Controllers/Routes.
-   Connect Services to API.
-   Integration tests.