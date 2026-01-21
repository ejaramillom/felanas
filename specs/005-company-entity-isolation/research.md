# Research & Decision Record

**Feature**: Company Entity & Data Isolation
**Status**: Completed

## 1. Data Isolation Strategy

**Context**: The system requires strict data isolation where each "Company" is a tenant.
**Decision**: **Logical Isolation (Shared Database, Separate Schemas or Discriminator Column)**
**Rationale**:
- **Discriminator Column**: Easiest to implement for a single database. Every table gets a `company_id`. All queries MUST filter by this.
- **Separate Schemas**: Higher isolation but more complex migration management.
- **Decision**: For this design, we will mandate **Discriminator Columns** (`company_id`) on all entity tables. This allows for simple foreign key constraints and standard SQL queries, while being portable across most relational databases.

**Alternatives Considered**:
- *Physical Isolation (Separate DB per Company)*: Too costly for maintenance and infrastructure for this scale.
- *Schema Isolation*: Good middle ground, but adds complexity to connection pooling and migration tools.

## 2. Request Context Propagation

**Context**: We need to know which Company is acting in every request.
**Decision**: **Header-Based Context with JWT/Token Claims**
**Rationale**:
- Stateless and scalable.
- The `company_id` is embedded in the Authentication Token (e.g., JWT) signed by the auth service.
- Middleware extracts this and places it in a Request Context object (ThreadLocal or Context object).
- Repositories read from this Context to scope queries.

## 3. SuperAdmin & Provisioning

**Context**: How to create the first company?
**Decision**: **Seed Script / CLI Tool**
**Rationale**:
- Avoids building a public "Sign Up" UI in early phases.
- Secure (requires shell access or internal API key).
- Can simply insert the initial "SuperAdmin" user and "Company" record directly or via a privileged service method.

## 4. Deletion Strategy

**Context**: "Strict Hard Delete (Cascade)"
**Decision**: **Database-Level Cascade**
**Rationale**:
- Most reliable way to ensure no orphaned records.
- `ON DELETE CASCADE` constraints on Foreign Keys (`employee.company_id -> company.id`).
- If the database doesn't support this (e.g., NoSQL), the Application Service must implement a "cleanup job", but for the primary plan, we assume relational integrity capabilities.

## 5. User vs Employee

**Context**: Clarification defined separate User and Employee entities.
**Decision**:
- **User**: Auth credentials, system roles (Admin, Manager).
- **Employee**: Payroll data, schedule, domain roles.
- **Link**: A `User` can be linked to an `Employee` record (1:1 for this iteration).
- **Impact**: Login creates a session for the *User*, which loads the *Company* context.
