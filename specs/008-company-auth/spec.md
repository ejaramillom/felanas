# Feature Specification: Company Authentication & Activation

**Feature Branch**: `008-company-auth`  
**Created**: 2026-01-26  
**Status**: Draft  
**Input**: User description: "build the frontend part for authentication and user login. the first iteration should be able to cover registration for a new user, create a new company, and activate through a provided key. the provided key is a singular, encrypted value we will provide the user for registration, but for the time being the company can work 30 days for free on trial. the key will be blocked by company name and it can exist only one key in the table for activation. (lets say felanas company registered, there will be a single key in the database table we will give them, and the table will be encrypted). remember to share with me the encryption keys to be stored in secure vaults like bitwarden. it can also be that you share with me the encryption keys or write them into the environment variables, so i can manage them and delete manually at some point in the future. check for backend and frontend features, as there is an existing backend that has CRUD actions enabled for users and companies. start the feature branch with 008-"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Company Registration & Activation (Priority: P1)

As a new Company Administrator, I want to register my company and create my admin account using a provided activation key so that I can start using the platform with a 30-day free trial.

**Why this priority**: This is the entry point for all new customers. Without this, no new companies can onboard securely.

**Independent Test**: Can be fully tested by attempting to register with a valid company name/key pair (success) and invalid pairs (failure), verifying the company is created with a trial expiration.

**Acceptance Scenarios**:

1. **Given** a valid activation key exists for company "Felanas" in the system, **When** I register with Company Name "Felanas", a valid email/password, and the correct activation key, **Then** a new Company "Felanas" is created with a 30-day trial expiration, a new User is created and linked to it, and I am logged in.
2. **Given** a valid activation key exists for company "Felanas", **When** I register with Company Name "OtherCorp" and the key for "Felanas", **Then** the system rejects the registration with an invalid key/company mismatch error.
3. **Given** no activation key exists, **When** I attempt to register, **Then** the system rejects the request.
4. **Given** a used activation key (company already registered), **When** I attempt to reuse it, **Then** the system rejects the request.

---

### User Story 2 - User Login (Priority: P1)

As a registered User, I want to log in with my email and password so that I can access my company's data.

**Why this priority**: Essential for returning users to access the application.

**Independent Test**: Can be tested by logging in with valid and invalid credentials.

**Acceptance Scenarios**:

1. **Given** an existing user "admin@felanas.com", **When** I enter the correct email and password, **Then** I am authenticated and redirected to the dashboard.
2. **Given** an existing user, **When** I enter an incorrect password, **Then** the system denies access and shows an error message.
3. **Given** a non-existent user, **When** I attempt to login, **Then** the system denies access.

---

### Edge Cases

- **Activation Key format**: System should handle whitespace or case sensitivity in activation keys gracefully (e.g., trim whitespace).
- **Duplicate Email**: User tries to register an admin account with an email that already exists (should fail).
- **Database Encryption**: Verify that if the database is inspected directly, the activation keys are not visible in plain text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a frontend registration form collecting: Company Name, User Email, User Password, and Activation Key.
- **FR-002**: System MUST provide a frontend login form collecting: Email and Password.
- **FR-003**: Backend MUST validate the provided Activation Key against the provided Company Name before creating any records.
- **FR-004**: System MUST store Activation Keys in an encrypted format in the database (Application-level encryption).
- **FR-005**: System MUST allow administrators to configure/retrieve the encryption key via Environment Variables.
- **FR-006**: Upon successful registration, the new Company MUST be set to a "Trial" status with an expiration date 30 days in the future.
- **FR-007**: The Activation Key used for registration MUST be marked as used or deleted to prevent reuse.
- **FR-008**: System MUST authenticate users using secure password hashing and standard session management.

### Key Entities *(include if feature involves data)*

- **ActivationKey**: Stores the relationship between a pre-approved Company Name and its specific Key.
  - `company_name`: String (Unique)
  - `encrypted_key`: String (Encrypted value of the key)
  - `is_used`: Boolean (or delete row upon use)
- **Company**: (Existing) Updated to include `trial_ends_at` or similar subscription status fields.
- **User**: (Existing)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with a valid key can complete the full registration flow (Form -> Dashboard) in under 2 minutes.
- **SC-002**: 100% of stored activation keys are encrypted at rest in the database; no plain text keys are visible via direct database inspection.
- **SC-003**: System successfully blocks 100% of registration attempts where the Company Name does not match the assigned Activation Key.
- **SC-004**: Newly registered companies automatically have a trial expiration date set to 30 days from creation (+/- 1 minute).