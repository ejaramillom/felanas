# Data Model

## Entities

### User
Represents a system operator with access to the platform.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | UUID | Yes | PK | Unique identifier |
| `username` | String | Yes | Unique per Company | Login username |
| `password_hash` | String | Yes | | Bcrypt hashed password |
| `role` | Enum | Yes | Default: `VIEWER` | `ADMIN`, `MANAGER`, `VIEWER` |
| `company_id` | UUID | Yes | FK -> Company | Tenant association |

### Company
Represents a tenant in the system.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | UUID | Yes | PK | Unique identifier |
| `name` | String | Yes | | Company name |
| `currency_code` | String | Yes | Length(3) | ISO currency code |

## Relationships
- **User** `ManyToOne` **Company**: A user belongs to one company.
