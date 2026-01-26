# Research & Decisions: Company Authentication

## 1. Activation Key Encryption

### Problem
Activation keys are sensitive. If the database is compromised, we don't want attackers to find valid keys to register free accounts.

### Decision
Use **AES-256-GCM** (Galois/Counter Mode) for encrypting keys at rest.

### Rationale
-   **Security**: AES-256 is the industry standard. GCM provides authenticated encryption, ensuring data hasn't been tampered with.
-   **Performance**: Fast enough for registration flows.
-   **Availability**: Native support in Node.js `crypto` module.

### Implementation Details
-   **Key Management**: The Master Key for encryption will be stored in an environment variable `ACTIVATION_KEY_SECRET`.
-   **Storage**: The database will store the `iv` (initialization vector), `auth_tag`, and the `encrypted_content` (usually concatenated or in separate columns). For simplicity in TypeORM, we can store as a single colon-separated string: `iv:auth_tag:content`.

### Alternatives Considered
-   **Hashing**: We cannot use hashing (like bcrypt) because we need to *decrypt* the key to show it to an admin (if needed) or verify it against user input if the user input needs to be normalized. *Correction*: Actually, if we only need to verify, hashing is better. BUT, the spec implies we "provide the key". If we generate it, we need to save it. If we want to audit it later, reversible encryption is safer for "recovery" scenarios, though hashing is strictly more secure. **Decision Refinement**: Spec says "the table will be encrypted". It doesn't explicitly say we need to read it back to show the user, but it's "singular... we will provide". Let's stick to Encryption (AES) to allow administrative recovery/viewing if needed, which is common for "license keys".

## 2. Trial Management

### Problem
Companies get a 30-day free trial.

### Decision
Add `trial_ends_at` (Timestamp) to the `Company` entity.

### Rationale
-   Simple to query (`WHERE trial_ends_at > NOW()`).
-   Flexible (can extend trials easily).

## 3. Frontend Auth State

### Problem
Need to manage logged-in state in React.

### Decision
Use a simple `AuthContext` with `localStorage` persistence.

### Rationale
-   **Simplicity**: Redux is overkill.
-   **Persistence**: Users expect to stay logged in on refresh.
-   **Security**: `localStorage` is vulnerable to XSS, but acceptable for this MVP/First Iteration. (HttpOnly cookies are better but require more backend work/CORS setup).

## 4. Password Security

### Problem
Current `UserController` compares passwords in plain text.

### Decision
Integrate `bcryptjs` for all password operations.

### Rationale
-   **Mandatory**: Plain text passwords are a critical vulnerability.
-   `bcryptjs` is already a project dependency.
