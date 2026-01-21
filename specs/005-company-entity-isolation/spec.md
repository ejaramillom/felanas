# Feature Specification: Company Entity & Data Isolation

**Feature Branch**: `005-company-entity-isolation`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "In spec.md it was defined that the key entities are: employee, paycheckconfig, attendancelog, workday, schedule. it is necessary that a company entity is added as a singleton, and limit the visibility of things, pages, databases, data and all other related items to each of the mentioned entities. refine the specification and fix this."

## Clarifications

### Session 2025-12-30
- Q: How should system users be modeled relative to Employees? → A: Separated (User + Employee) - Distinct User entity handles auth and links to Company. `Employee` is purely for HR/Payroll data.
- Q: How are new Companies and their initial Admin Users created? → A: SuperAdmin Provisioning - Internal Admin creates Company & Admin User manually (CLI/API/Admin UI).
- Q: What happens when a Company is deleted? → A: Strict Hard Delete (Cascade) - Deleting a Company permanently deletes ALL linked data (Users, Employees, Logs).
- Q: How is the active Company context resolved for API/System requests? → A: JWT/Header Claims - CompanyID is embedded in the User's authentication token (JWT) or a custom Header.
- Q: How are currencies handled across different companies? → A: Single Currency per Company - Each `Company` defines its primary currency (e.g., Company A uses USD, Company B uses EUR).

## User Scenarios & Testing

### User Story 1 - Data Isolation by Company (Priority: P1)

As a Store Manager, I want to view and manage only the employees, schedules, and paychecks that belong to my company, so that I do not accidentally access or modify data from other organizations.

**Why this priority**: This is the fundamental security and architectural requirement requested to ensure data privacy and structural integrity.

**Independent Test**: Create two companies (Company A and Company B). Create an employee in Company A. Log in/Act as Company B Manager. Verify that the employee from Company A is NOT visible.

**Acceptance Scenarios**:

1. **Given** Company A and Company B exist, **When** I list employees while authenticated as Company A, **Then** only Company A's employees are shown.
2. **Given** a Paycheck Configuration created for Company A, **When** Company B tries to access it, **Then** the system denies access or returns "Not Found".
3. **Given** an Attendance Log for an employee in Company A, **When** generating paychecks for Company B, **Then** that log is ignored.

---

### User Story 2 - Company Entity Definition (Priority: P2)

As a System Administrator, I want the system to recognize a "Company" as the root entity, so that all subsequent data creation (Employees, Schedules, etc.) is mandatorily linked to a specific company context.

**Why this priority**: Establishes the structural dependency required for User Story 1.

**Independent Test**: Attempt to create an Employee without a linked Company. Verify the creation fails or is rejected.

**Acceptance Scenarios**:

1. **Given** a new system installation, **When** I inspect the data model, **Then** a `Company` entity exists as a parent/singleton concept.
2. **Given** I am creating a new Employee, **When** I submit the data, **Then** it must be associated with a valid Company ID (explicitly or implicitly via context).

### Edge Cases

- **No Company Context**: If a user tries to access the system without being assigned to a company, access should be denied or redirected to an onboarding flow.
- **Cross-Company IDs**: If an ID collision happens (e.g., Employee #1 in Company A and Employee #1 in Company B), the system handles them as distinct records (e.g., using composite keys or UUIDs).

## Requirements

### Functional Requirements

- **FR-001**: System MUST support a `Company` entity containing at minimum a unique identifier and a name.
- **FR-002**: System MUST enforce that all instances of `Employee`, `PaycheckConfig`, `AttendanceLog`, `WorkDay`, and `Schedule` are associated with exactly one `Company`.
- **FR-003**: System MUST filter all data retrieval operations (Lists, Reads) by the currently active `Company` context.
- **FR-004**: System MUST ensure that `PaycheckConfig` is a singleton *per Company* (each company has one configuration).
- **FR-005**: System MUST prevent creation of orphaned data (e.g., an Attendance Log not linked to a valid Company/Employee of that Company).
- **FR-006**: System MUST treat the `Company` as a singleton context for the current user session (effectively "Current Company").
- **FR-007**: System MUST support a `User` entity distinct from `Employee`, responsible for authentication and linked to a specific `Company`.
- **FR-008**: System MUST allow a "SuperAdmin" (internal role) to provision new `Company` and initial Admin `User` entities (via API/CLI/Admin UI).
- **FR-009**: System MUST permanently delete all associated data (Users, Employees, Logs, etc.) if a `Company` is deleted (Cascade Delete).

### Key Entities

- **Company**: ID, Name, CreatedAt. (Parent Entity)
- **User**: ID, Username, PasswordHash, Role, Linked to Company. (Auth Entity)
- **Employee**: Linked to Company. (HR Entity)
- **PaycheckConfig**: Linked to Company.
- **AttendanceLog**: Linked to Company (transitive via Employee or direct).
- **WorkDay**: Linked to Company (transitive via Employee or direct).
- **Schedule**: Linked to Company (transitive via Employee or direct).

## Assumptions

- Users are assigned to a single company at a time (no multi-company users in this iteration, or if they exist, they select a context upon login).
- The system architecture permits adding a root-level entity without a complete rewrite of the existing business logic modules, provided queries are updated.
- "Singleton" in the context of `PaycheckConfig` refers to one active configuration per Company.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of database queries for core entities include a filter for `CompanyID` (or equivalent isolation mechanism).
- **SC-002**: A manager from Company A sees exactly 0 records belonging to Company B during any standard operation (List, Search, Report).
- **SC-003**: Creation of any core entity without a Company context fails 100% of the time.