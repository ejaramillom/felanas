# Implementation Plan: Company Entity & Data Isolation

**Feature Branch**: `005-company-entity-isolation`
**Spec**: `specs/005-company-entity-isolation/spec.md`

## Technical Context
**Language/Version**: TypeScript / Node.js
**Primary Dependencies**: Express, JWT, TypeORM (or similar SQL abstraction)
**Storage**: Relational Database (PostgreSQL/MySQL)
**Project Type**: Web API

## 1. High-Level Architecture Overview

The system architecture will adopt a **Multi-Tenant (Shared Schema, Discriminator)** pattern. The `Company` entity acts as the tenant root. All data access is strictly mediated by a "Context-Aware" layer that automatically injects the active tenant ID into persistence operations.

### Logical Layers

1.  **Transport Layer (API/CLI)**:
    - Responsible for extracting the "Tenant Context" from the request (e.g., JWT Claim `company_id` or SuperAdmin override).
    - Blocks requests that lack valid context (except public/login endpoints).

2.  **Application Layer (Service)**:
    - Orchestrates business logic.
    - **Crucial**: It does *not* accept `company_id` as a method argument from the client. It retrieves it from the `CurrentContext`.
    - This prevents parameter tampering attacks.

3.  **Persistence Layer (Repositories)**:
    - Responsible for enforcing isolation.
    - **Global Filter**: Every query (Find, List) implicitly appends `WHERE company_id = ?`.
    - **Write Protection**: Every insert/update implicitly sets `company_id` from the `CurrentContext`.

### Isolation Enforcement

-   **Read Isolation**: Enforced by Repository Base Classes or ORM Middleware / Global Scopes.
-   **Write Isolation**: Enforced by Entity Constructors or Builder methods requiring Context.
-   **Data Integrity**: Enforced by Database Foreign Keys (`ON DELETE CASCADE`).

## 2. Entity & Data Modeling Strategy

-   **Company (Root)**:
    -   The anchor for all other tables.
    -   Created only via SuperAdmin workflows.
-   **Singleton Enforcement**:
    -   `PaycheckConfig` table will have a `UNIQUE` constraint on the `company_id` column.
    -   Application logic will treat "Create Config" as "Upsert" (Update if exists, Insert if not) to maintain the singleton illusion.
-   **Cross-Company Prevention**:
    -   Database Foreign Keys prevent linking an `Employee` of Company A to a `Schedule` of Company B (assuming `Schedule` links to `Employee`).
    -   *Double-Check Strategy*: Even if `Schedule` links to `Employee`, `Schedule` should ALSO have `company_id` to allow efficient block-level filtering without large joins.

## 3. Tool Categories Selection

To implement this plan effectively, the following tool categories are required:

| Category | Requirement | Justification |
| :--- | :--- | :--- |
| **Relational Persistence** | Strong Consistency, FK Constraints | Requires `ON DELETE CASCADE` to safely handle Company deletion. Requires ACID transactions for creating Company + Admin User atomically. |
| **Migration Tooling** | Schema Versioning | To introduce the `Company` table and backfill/migrate existing tables (if any) or create new ones with strict constraints. |
| **Authentication Service** | Token Issuance (JWT) | Must support embedding custom claims (`company_id`) into tokens to avoid database lookups on every request. |
| **Context Middleware** | Request Scoping | A mechanism to hold `company_id` for the duration of a request (e.g., ThreadLocal, AsyncLocalStorage, Context Context). |
| **Admin CLI / Scripting** | SuperAdmin Ops | A way to bypass standard tenant checks to provision the initial companies. |

## 4. Implementation Phases

### Phase 1: Foundation & Persistence
1.  **Schema Definition**: Create migration scripts for `Company` and `User` tables.
2.  **Entity Implementation**: Define the `Company` and `User` models with ORM/Data mapping.
3.  **SuperAdmin CLI**: Implement a script to create a Company and an Admin User.

### Phase 2: Core Domain Isolation
1.  **PaycheckConfig Migration**: Create table with `company_id` and unique constraint.
2.  **Employee Migration**: Create table with `company_id` FK.
3.  **Repository Layer**: Implement the "Base Repository" pattern that accepts a Context and filters by `company_id`.

### Phase 3: Auth & Context Integration
1.  **Auth Service**: Implement Login (User + Password) -> Returns JWT with `company_id`.
2.  **Middleware**: Implement the barrier that reads JWT, validates it, and sets the `CurrentContext`.
3.  **Wiring**: Connect the Middleware to the Repository layer.

### Phase 4: Verification
1.  **Integration Tests**: Write tests that attempt to access Company B data using Company A credentials (must fail).
2.  **Cascade Test**: Create Company -> Add Data -> Delete Company -> Verify Data Gone.

## 5. Verification & Testing Strategy

### Automated Testing
-   **Unit Tests**: Verify that Repositories construct the correct SQL/Query when given a Context.
-   **Security Tests**: "Negative Testing" suite. Explicitly try to forge requests with IDs from other companies.
-   **Concurrency Tests**: Attempt to create two `PaycheckConfig` entries for the same company in parallel (Database constraint must catch one).

### Manual Verification
-   **CLI Walkthrough**:
    1.  Provision "Acme Corp".
    2.  Login as "Acme Admin".
    3.  Create Employee "John".
    4.  Logout.
    5.  Provision "Beta Inc".
    6.  Login as "Beta Admin".
    7.  List Employees (Expect Empty).
    8.  Delete "Acme Corp" via CLI.
    9.  Verify "John" is deleted from DB.

## 6. Success Definition

The implementation is considered successful when:
1.  **Zero Leakage**: No API response ever contains data from a `company_id` different from the requester's.
2.  **Clean Destruction**: Deleting a Company removes 100% of its footprint.
3.  **Orphan Prevention**: It is impossible (DB Error) to insert an Employee without a Company ID.
