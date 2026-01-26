# Implementation Plan: Company Authentication & Activation

**Branch**: `008-company-auth` | **Date**: 2026-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/008-company-auth/spec.md`

## Summary

The goal is to implement a secure authentication and registration system for the Felanas platform. Key requirements include a "Company Activation" flow where new companies register using a pre-provisioned, encrypted "Activation Key". Successful registration creates a Company (with a 30-day trial), an Admin User, and logs them in.

Technically, this involves:
1.  **Frontend (React/MUI)**: Registration form (Company Name, Email, Password, Activation Key) and Login form.
2.  **Backend (Node/Express)**:
    -   New `ActivationKey` entity with encrypted storage.
    -   Updates to `Company` entity for trial management (`trial_ends_at`).
    -   `RegistrationService` to handle the atomic creation of Company + User upon key validation.
    -   Secure password hashing (migrating from plain text placeholder to `bcryptjs`).
    -   Encryption of Activation Keys using Node's `crypto` (AES-256).

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20+), React 19
**Primary Dependencies**: 
- Backend: `express`, `typeorm`, `bcryptjs`, `jsonwebtoken`, `dotenv`
- Frontend: `react`, `axios`, `@mui/material`, `react-router-dom`
**Storage**: PostgreSQL (via TypeORM)
**Testing**: `jest` (Backend Unit/Integration), `playwright` (E2E)
**Target Platform**: Web
**Project Type**: Full-stack (Node API + React Frontend)
**Performance Goals**: Registration < 2s.
**Constraints**: Activation Keys must be encrypted at rest.
**Scale/Scope**: Low volume (registration), High security.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Architectural Integrity**: **PASS**. Will use `RegistrationService` (Domain Service) to encapsulate the registration logic (Key validation -> Company Create -> User Create), separate from Controller.
- **Code Quality**: **PASS**. Will follow existing patterns.
- **Testing Standards**: **PASS**. Will include Unit tests for `RegistrationService` and E2E tests for the registration flow.
- **Security & Compliance**: **PASS**. 
    -   **FIX**: Will replace current plain-text password comparison in `UserController` with `bcryptjs`.
    -   **NEW**: Activation keys encrypted at rest using AES-256-GCM.
    -   **NEW**: Environment variables used for encryption secrets (`ACTIVATION_KEY_SECRET`).
- **Performance & Scalability**: **PASS**.
- **Observability**: **PASS**.
- **User Experience Consistency**: **PASS**. Will use MUI components to match existing (implied) design.

## Project Structure

### Documentation (this feature)

```text
specs/008-company-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Web application
src/ (Backend)
├── controllers/
│   └── AuthController.ts       # NEW: Handle Register/Login
├── services/
│   ├── RegistrationService.ts  # NEW: Domain logic for registration
│   └── AuthService.ts          # NEW: Domain logic for login/token
├── entities/
│   └── ActivationKey.ts        # NEW: Key storage
├── middleware/
│   └── auth.ts                 # UPDATE: Improve token handling if needed
└── utils/
    └── EncryptionUtils.ts      # NEW: Helper for AES encryption

frontend/src/ (Frontend)
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx       # NEW
│   │   └── RegisterForm.tsx    # NEW
│   └── common/                 # Shared UI components
├── pages/
│   ├── LoginPage.tsx           # NEW
│   └── RegisterPage.tsx        # NEW
└── services/
    └── auth.ts                 # NEW: API client for auth
```

**Structure Decision**: Option 2: Web application (Separate Backend `src` and Frontend `frontend/src`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       |            |                                     |