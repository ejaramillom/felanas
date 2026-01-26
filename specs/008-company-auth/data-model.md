# Data Model: Company Authentication

## Entities

### ActivationKey

Represents a pre-provisioned key that allows a specific company to register.

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| id | UUID | Yes | Yes | Primary Key |
| company_name | VARCHAR(255) | Yes | Yes | The exact name of the company allowed to use this key. |
| encrypted_key | TEXT | Yes | No | The encrypted activation key string (format: `iv:tag:content`). |
| is_used | BOOLEAN | Yes | No | Tracks if the key has been consumed. Default: `false`. |
| created_at | TIMESTAMP | Yes | No | Audit timestamp. |

### Company (Update)

Existing entity updates.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| trial_ends_at | TIMESTAMP | No | The date/time when the free trial expires. Nullable (if full paid). |

### User (Behavioral Update)

No schema changes, but `password_hash` column must now store `bcrypt` hashes instead of plain text.

## Relationships

- `ActivationKey` is standalone (logically linked to `Company` via name, but no FK as Company doesn't exist when Key is created).
