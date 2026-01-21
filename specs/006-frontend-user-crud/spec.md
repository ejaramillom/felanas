# Feature Specification: Frontend User Management & Containerization

**Feature Branch**: `006-frontend-user-crud`  
**Created**: 2026-01-19  
**Status**: Draft  
**Input**: User description: "rebuild the entire codebase to make use of ecmascript standards. after that, start creating the frontend to be connected to the current API that was developed. we need user management, paycheck configuration, employee management. on this iteration lets create the frontend and the CRUD operations for users. move everything to containers, in such a way that we can initialize the database, the frontend and the backend servers in containers, eliminate root permissions in docker files and docker compose, and remove all secrets to connect to databases and security systems like authentication from codebase, and manage the secrets from environment variables. generate the corresponding tests, unit and integration tests. name the spec starting with 006."

## Clarifications

### Session 2026-01-19
- Q: Which frontend framework should be used for the implementation? → A: React
- Q: Who is authorized to perform user management operations? → A: Admin only
- Q: Which UI component library should be used for the frontend? → A: Material UI (MUI)
- Q: Which testing frameworks should be used? → A: Jest + RTL + Supertest (Unit/Integration) AND Playwright (E2E)
- Q: How should environment variables be initialized/managed for developers? → A: Hybrid approach (gitignored `.env` files + initialization shell scripts in `scripts/` directory)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Containerized Infrastructure (Priority: P1)

As a DevOps Engineer, I want to deploy the application stack (Backend, Frontend, Database) using Docker containers that run as non-root users and accept sensitive configuration via environment variables, so that the system is secure and portable.

**Why this priority**: Foundation for running the application securely and consistently across environments.

**Independent Test**:
1. Run `docker-compose up` and verify all services start.
2. Inspect running containers to verify the user is not root (UID != 0).
3. Verify that removing environment variables causes services to fail (proving secrets aren't hardcoded).

**Acceptance Scenarios**:

1. **Given** the docker-compose configuration, **When** I start the services, **Then** Backend, Frontend, and Database containers start successfully.
2. **Given** running containers, **When** I inspect the process owner, **Then** it shows a non-root user.
3. **Given** the codebase, **When** I search for database passwords or API keys, **Then** I find no hardcoded values.
4. **Given** the system is running, **When** I check the logs, **Then** no secrets are printed to stdout/stderr.

---

### User Story 2 - User Management Interface (Priority: P1)

As an Admin, I want to view, create, update, and delete system users via a web frontend, so that I can manage access without direct database interaction.

**Why this priority**: Core functionality for this iteration ("CRUD operations for users").

**Independent Test**:
1. Launch the frontend connected to the backend.
2. Log in as an Admin user.
3. Navigate to the User Management section.
4. Perform Create, Read (List), Update, and Delete actions on a test user.
5. Verify that non-Admin users cannot access these features.

**Acceptance Scenarios**:

1. **Given** I am logged in as an Admin on the User List page, **When** the page loads, **Then** I see a list of users retrieved from the API.
2. **Given** I am logged in as an Admin, **When** I submit valid details for a new user, **Then** the user is created and appears in the list.
3. **Given** I am logged in as an Admin, **When** I edit a user's role or details and save, **Then** the updates are reflected in the system.
4. **Given** I am logged in as an Admin, **When** I click delete and confirm, **Then** the user is removed.
5. **Given** I am logged in as a Manager or Viewer, **When** I attempt to access the User Management page, **Then** I am denied access.

---

### User Story 3 - ECMAScript Standardization (Priority: P2)

As a Developer, I want the codebase to use standard ECMAScript Modules (ESM), so that the project follows modern JavaScript/TypeScript standards and is future-proof.

**Why this priority**: Technical debt reduction requested as a prerequisite ("rebuild... to make use of ecmascript standards").

**Independent Test**:
1. Run the build/compile process.
2. Check `package.json` type configuration.
3. Verify imports/exports in source files.

**Acceptance Scenarios**:

1. **Given** the source code, **When** I check the module system, **Then** it uses `import`/`export` syntax exclusively (no `require`).
2. **Given** the project configuration, **When** I build the project, **Then** it compiles successfully without ESM-related errors.
3. **Given** the test suite, **When** I run tests, **Then** they execute correctly in the ESM environment.

### Edge Cases

- **Missing Environment Variables**: If required secrets (e.g., `DB_PASSWORD`) are missing, the affected container MUST exit immediately with a clear error message, rather than starting in an undefined state.
- **Database Connection Failure**: If the Backend cannot connect to the Database container, it should retry for a configurable period/count before failing, and log appropriate errors.
- **Duplicate Username**: If an admin attempts to create a user with a username that already exists (for the same company), the system MUST reject the request and the Frontend MUST display a clear "User already exists" error.
- **Unauthorized Access**: If a user without appropriate privileges attempts to access the User Management API/Page, the system MUST deny access (403 Forbidden).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST be containerized using Docker and Docker Compose, including Backend, Frontend, and Database services.
- **FR-002**: All Docker containers MUST run processes as a non-root user.
- **FR-003**: All sensitive configuration (DB credentials, API secrets) MUST be injected via environment variables; no secrets in code.
- **FR-004**: The Backend codebase MUST be refactored/rebuilt to use ECMAScript Modules (ESM).
- **FR-005**: The system MUST provide a React-based Frontend application that connects to the Backend API.
- **FR-006**: The Frontend MUST allow creating a new user with fields: Username, Password, Role.
- **FR-007**: The Frontend MUST allow viewing a list of existing users.
- **FR-008**: The Frontend MUST allow updating user details.
- **FR-009**: The Frontend MUST allow deleting a user.
- **FR-010**: The system MUST include Unit and Integration tests using Jest, React Testing Library, and Supertest.
- **FR-011**: The system MUST include End-to-End (E2E) tests using Playwright.
- **FR-012**: The project MUST provide shell scripts in a `scripts/` directory to help developers initialize local `.env` files from examples.
- **FR-013**: The application MUST support reading configuration from `.env` files during local development, while ensuring `.env` files are excluded from version control.

### Key Entities *(include if feature involves data)*

- **User**: The system user.
    - `id`: UUID
    - `username`: String (Unique per company)
    - `password`: String (Hashed)
    - `role`: Enum (ADMIN, MANAGER, VIEWER)
    - `company_id`: UUID (Foreign Key)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of container processes run with a UID > 0 (non-root).
- **SC-002**: Zero hardcoded secrets found in the codebase (verified by search/scan).
- **SC-003**: Administrators can complete a full CRUD cycle (Create, Read, Update, Delete) for a user in under 2 minutes via the Frontend.
- **SC-004**: Test suite (Unit + Integration) achieves 100% pass rate.
- **SC-005**: Docker Compose startup time for the full stack is under 3 minutes on a standard development machine.