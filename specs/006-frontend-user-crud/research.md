# Research & Decisions: Frontend User Management & Containerization

**Feature**: `006-frontend-user-crud`
**Status**: Resolved

## 1. Frontend Architecture
**Decision**: React + Vite + Material UI (MUI)
**Rationale**:
- **Vite**: Modern build tool, native ESM support (aligns with project goals), significantly faster than CRA.
- **MUI**: Requested by spec clarification.
- **React**: Requested by spec.

## 2. Backend ESM Migration
**Decision**: Native Node.js ESM (`"type": "module"`)
**Rationale**:
- Required by spec ("rebuild... to make use of ecmascript standards").
- **Implementation Details**:
    - Update `package.json`: `"type": "module"`.
    - Update `tsconfig.json`: `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`.
    - Refactor imports: Add `.js` extensions to relative imports (TypeScript requirement for ESM).
    - Replace CommonJS globals (`__dirname`, `require`) with `import.meta.url` equivalents.
    - Use `ts-node --esm` or `tsx` for development execution.

## 3. Containerization Strategy
**Decision**: Docker Compose with Multi-stage Builds
**Rationale**:
- **Security**: Spec requires non-root users.
- **Backend**: Multi-stage build (Builder -> Runner). Create specific user/group (e.g., `node`).
- **Frontend**: Multi-stage build (Node Builder -> Nginx Runner). Run Nginx as non-root (custom config required to listen on >1024 ports).
- **Secrets**: Environment variables injected via `docker-compose.yml` (reading from `.env` on host).

## 4. Testing Strategy
**Decision**:
- **Unit/Integration**: Jest (with `ts-jest` configured for ESM).
- **E2E**: Playwright (running against the containerized stack or local dev stack).
