# Implementation Plan - Frontend User Management & Containerization

**Feature**: `006-frontend-user-crud`
**Status**: Approved

## Technical Context

| Component | Technology | Status | Notes |
|-----------|------------|--------|-------|
| **Frontend** | React + Vite + MUI | **New** | To be initialized. |
| **Backend** | Node.js (ESM) | **Refactor** | Convert from CommonJS to Native ESM. |
| **Database** | PostgreSQL | **Existing** | Uses TypeORM. |
| **Container** | Docker Compose | **New** | Non-root, multi-stage builds. |
| **Auth** | JWT | **Existing** | `authMiddleware` exists. |
| **Testing** | Jest + Playwright | **Hybrid** | Jest (Unit/Int), Playwright (E2E). |

## Constitution Check

| Principle | Compliance Check |
|-----------|------------------|
| **I. Architectural Integrity** | **PASS**: Adhering to DDD (Controller/Entity separation). |
| **IV. Security & Compliance** | **PASS**: Non-root containers specified. Secrets via Env Vars. |
| **III. Testing Standards** | **PASS**: Unit, Integration, and E2E tests included in scope. |
| **V. Performance** | **PASS**: React (Client-side rendering) + Vite (Optimized build). |

## Gates

- [x] **Spec Validation**: All "NEEDS CLARIFICATION" resolved.
- [x] **Research**: Architecture decisions (ESM, Vite) documented in `research.md`.
- [x] **Design**: API Contracts & Data Model defined.

## Phases

### Phase 1: Environment & Standards Migration
**Goal**: Modernize the codebase to ESM and establish container infrastructure.

1.  **ESM Migration**:
    -   Update `package.json` (`"type": "module"`).
    -   Update `tsconfig.json` (`NodeNext`).
    -   Refactor all imports/exports in `src/`.
    -   Verify server starts with `ts-node --esm` or `tsx`.
2.  **Scripts**:
    -   Create `scripts/init-env.sh` (FR-012).
3.  **Docker Setup**:
    -   Create `Dockerfile.backend` (Multi-stage, non-root `node` user).
    -   Create `docker-compose.yml` (DB + Backend).

### Phase 2: Backend Implementation
**Goal**: Enable User Management API.

1.  **User Controller**:
    -   Implement `UserController.list` (GET /users).
    -   Implement `UserController.create` (POST /users).
    -   Implement `UserController.update` (PUT /users/:id).
    -   Implement `UserController.delete` (DELETE /users/:id).
2.  **Routes**:
    -   Register `userRoutes` in `index.ts`.
    -   Apply `authMiddleware` (Admin only check).
3.  **Tests**:
    -   Unit tests for `UserController`.
    -   Integration tests for `/users` endpoints (Supertest).

### Phase 3: Frontend Foundation
**Goal**: Initialize React Application.

1.  **Scaffold**:
    -   Initialize Vite project (`frontend/`).
    -   Install dependencies (`@mui/material`, `react-router-dom`, `axios`).
2.  **Configuration**:
    -   Setup `axios` instance with Interceptors (Inject JWT).
    -   Setup React Router.
    -   Create `Dockerfile.frontend` (Build -> Nginx non-root).
    -   Add frontend to `docker-compose.yml`.

### Phase 4: Frontend Features
**Goal**: User CRUD Interface.

1.  **Components**:
    -   Layout (Sidebar/Header).
    -   UserList (DataGrid).
    -   UserForm (Create/Edit Dialog).
2.  **Integration**:
    -   Connect Components to Backend API.
    -   Handle Error States (Duplicate User, Auth Errors).

### Phase 5: Quality Assurance
**Goal**: Verify full stack correctness.

1.  **E2E Testing**:
    -   Setup Playwright.
    -   Script: Admin Login -> Create User -> Verify List -> Delete User.
2.  **Final Polish**:
    -   Linting check.
    -   Security scan (secrets check).