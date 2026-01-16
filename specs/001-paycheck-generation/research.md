# Research & Decision Record

**Feature**: Automated Paycheck Generation & Scheduling
**Status**: Completed

## 1. PDF Generation Library

**Context**: We need to generate paycheck PDFs server-side.
**Options**:
1.  **PDFKit**: Low-level, coordinate-based. Fast, no external dependencies. Hard to maintain layouts.
2.  **Puppeteer (HTML -> PDF)**: Easy layout (CSS), but heavy dependency (Chromium).
3.  **PDFMake**: Declarative JSON syntax. Middle ground.
**Decision**: **PDFKit** (wrapped in a service) or **PDFMake**.
**Selected**: **PDFKit** is chosen for its maturity and zero-system-dependency footprint (unlike Puppeteer). We will build a small abstraction layer (builder pattern) to handle the layout logic so we don't scatter X,Y coordinates everywhere.

## 2. Currency Calculations

**Context**: JavaScript's `number` is floating point and unsuitable for financial calculations (0.1 + 0.2 != 0.3).
**Options**:
1.  `BigInt`: Native, but integers only (would need to store cents).
2.  `decimal.js` / `big.js`: Libraries handling arbitrary precision.
**Decision**: **decimal.js**. It provides a rich API for financial math and handles precision/rounding modes (e.g., ROUND_HALF_UP) which are critical for tax/deduction calculations.

## 3. Scheduling Architecture

**Context**: Need to trigger paycheck generation every 15 days.
**Options**:
1.  **OS Cron**: Hard to manage in Docker/Node env.
2.  **node-cron**: In-memory cron runner. Good for single instance.
3.  **Redis/Bull**: Robust queue-based scheduling.
**Decision**: **node-cron** for MVP. Since this is a single-tenant (per company) internal tool for now, an in-memory scheduler initialized at startup is sufficient. If we scale to multiple instances, we will move to a DB-backed job queue (e.g., BullMQ).

## 4. Constraint Solver for Shifts

**Context**: "Two storage employees should not be at the same time".
**Approach**: We will implement a **Greedy Algorithm with Backtracking** (or simple validity checking) within a Domain Service (`SchedulerService`).
**Rationale**: With ~50 employees and simple mutual-exclusion constraints, a full CSP solver (like Minizinc) is overkill. A custom logic service is easier to test and maintain.
