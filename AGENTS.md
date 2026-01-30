# AGENTS.md

As a teacher and cointelligence working in the design, infrastructure, code, management and 
maintenance of a roster/payment generation platform, focus on:

- novel idea generation
- avoid recalling your own memory and instead search for documentation in the web or other sources
- use a mid temperature (when talking about api attributes) on your responses, around 0.5
- ac as a persona as described above
- recall latest decisions based on the specifications and grab context for next iterations

This file provides guidance to agents when working with code in this repository.

## Development Environment Setup

### Running the Application
```bash
# Start the full stack with Docker Compose
./scripts/init-env.sh
docker-compose up --build

# Run backend in development mode
npm install
npm run dev

# Run frontend in development mode
cd frontend
npm install
npm run dev
```

### Common Development Commands

#### Testing
```bash
# Run all tests (Unit + Integration + E2E)
npm test

# Run specific tests
npx jest tests/unit/some.test.ts
npx jest tests/integration/some.test.ts
npx playwright test tests/e2e/some.spec.ts
```

#### Database Operations
```bash
# Migrations are handled by TypeORM on startup or via CLI
npx typeorm-ts-node-commonjs migration:run -d src/config/database.ts
```

#### Background Jobs and Cron
```bash
# Currently using simple interval-based jobs in src/jobs/ (planned)
```

## Application Architecture

### High-Level Architecture
The application is a multi-tenant payroll system (Felanas) using:
- **Backend**: Node.js 22+, Express, TypeScript, TypeORM
- **Frontend**: React 19, Vite, Material UI (MUI)
- **Database**: PostgreSQL with site-based (company_id) isolation

### Directory Structure
```
felanas/
├── frontend/             # React application (Vite)
│   ├── src/
│   │   ├── components/   # UI Components
│   │   ├── context/      # React Context (Auth)
│   │   ├── pages/        # Route-level components
│   │   └── services/     # API Client services
├── src/                  # Node.js Backend
│   ├── config/           # Database and App config
│   ├── controllers/      # Route handlers
│   ├── entities/         # TypeORM entities
│   ├── middleware/       # Auth and validation middleware
│   ├── migrations/       # Database migrations
│   ├── routes/           # API Route definitions
│   ├── services/         # Business logic
│   └── utils/            # Shared utilities
├── tests/                # Test suite
│   ├── unit/             # Unit tests
│   ├── integration/      # API/DB integration tests
│   └── e2e/              # Playwright E2E tests
└── specs/                # Project specifications and task lists
```

### Database Architecture
- **Primary Database**: PostgreSQL
- **Isolation**: Tenant isolation achieved via `company_id` on all entities.
- **Entities**: Company, User, Employee, Paycheck, etc.

Future implementations will make use of systems such as
- **Spanner Database**: Google Cloud Spanner or a similar tool for specific use cases
- **Read Replicas**: Configured for read-heavy operations

### Key Architectural Patterns

#### Domain-Driven Design Services
Business logic is organized into domain services following this pattern:

```typescript
export class UserFactory {
    constructor(
        private readonly params: CreateUserDto,
        private readonly companyId: string
    ) {}

    async call(): Promise<Result<User>> {
        if (!this.isValid()) return Result.failure(["Invalid parameters"]);

        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const result = await this.performOperation(transactionalEntityManager);
            if (result.success) {
                await this.publishEvents(result.data);
            }
            return result;
        });
    }

    private async performOperation(entityManager: EntityManager): Promise<Result<User>> {
        // Business logic implementation
    }
}
```

#### Model Organization
Models (Entities) follow a consistent structure using TypeORM:
```typescript
@Entity()
@Unique(["companyId", "username"])
export class User {
    // 1. Columns
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    username!: string;

    @Column({ name: "password_hash" })
    passwordHash!: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.VIEWER
    })
    role!: UserRole;

    // 2. Tenant Isolation
    @Column({ name: "company_id" })
    companyId!: string;

    // 3. Associations
    @ManyToOne(() => Company, (company) => company.users, { onDelete: "CASCADE" })
    @JoinColumn({ name: "company_id" })
    company!: Relation<Company>;

    // 4. Methods
    async comparePassword(password: string): Promise<boolean> {
        const bcrypt = await import('bcryptjs');
        return bcrypt.default.compare(password, this.passwordHash);
    }
}
```

#### Controller Patterns
Controllers delegate business logic to domain services:
```typescript
export class UserController {
    static async create(req: Request, res: Response) {
        const factory = new UserFactory(req.body, req.context.companyId);
        const result = await factory.call();

        if (result.success) {
            return res.status(201).json(result.data);
        } else {
            return res.status(422).json({ errors: result.errors });
        }
    }
}
```

### Multi-tenant Isolation
The application uses company-based isolation (tenant isolation):

```typescript
// Query for a specific company
const users = await userRepository.find({ 
    where: { companyId: currentCompany.id } 
});

// Using QueryBuilder with isolation
const employees = await employeeRepository.createQueryBuilder("employee")
    .where("employee.companyId = :companyId", { companyId: currentCompany.id })
    .getMany();
```

### Testing Strategy
- **Unit Tests**: Using Jest for business logic and services in `tests/unit/`
- **Integration Tests**: Testing API endpoints and database interactions in `tests/integration/`
- **E2E Tests**: Using Playwright for full user journeys in `tests/e2e/`
- **Data Generation**: Using custom factory functions or `test-data-creator` patterns.

### API Design
- **REST-first approach** with standardized JSON responses.
- **Authentication**: JWT-based auth with `companyId` claim.
- **Middleware**: `authMiddleware` for validating tokens and populating `req.context`.
- **Validation**: Using `class-validator` or simple schema validation.

### Monitoring and Observability
- **Structured logging**: Using `winston` or `pino`.
- **Error tracking**: Sentry integration (planned).
- **Performance**: Monitoring query execution times.

### GitHub Actions Best Practices
- Use semantic job and step names
- Implement proper conditional logic with `if:` statements
- Use outputs and needs for job dependencies
- Cache dependencies appropriately
- Use secrets properly and avoid logging sensitive data

### Error Handling
- Use standard JavaScript Error classes or custom Error subclasses.
- Provide meaningful error messages and HTTP status codes in API responses.
- Log errors with appropriate severity using the logger utility.
- Use try/catch blocks in async functions and services.

### API Integration Patterns
- Implement consistent error handling for external API calls using Axios interceptors.
- Use Bearer tokens for authentication where required.
- Handle pagination for list operations using `skip` and `take` in TypeORM.
- Validate incoming request bodies using middleware.

### Testing
- Write Jest tests for services and repositories.
- Use mocks for database connections and external services in unit tests.
- Test both success and failure scenarios (e.g., validation errors, 404s).
- Use `supertest` for integration testing of Express routes.

## Docker & Containerization

### Build Optimization
- Use multi-stage builds (see `Dockerfile.backend` and `frontend/Dockerfile.frontend`).
- Implement layer caching for `node_modules`.
- Use specific Node.js Alpine images for minimal size.

### Security
- Use non-root users in containers.
- Use specific version tags (e.g., `node:22-alpine`).
- Inject secrets via environment variables in `docker-compose.yml`.

## Common Patterns

### CLI Tools
- Use `ts-node` or `node` for execution of utility scripts in `src/scripts/`.
- Implement clear command-line arguments and help text.

### API Clients
- Use Axios for all HTTP requests.
- Implement a base client with interceptors for auth headers and error logging.

## Important Notes for Development

### Code Organization
- Keep business logic in `src/services/`.
- Use TypeORM entities in `src/entities/` for database schema.
- Follow the controller-service-repository pattern.

### Database Considerations
- Always include `companyId` in queries for tenant-isolated models.
- Use migrations for all schema changes in `src/migrations/`.

### Performance Guidelines
- Avoid N+1 queries by using TypeORM relations or `join` when necessary.
- Use indexes on frequently queried columns (especially `company_id`).
- Monitor database query performance during development.

### Feature Development
- Use feature toggles or environment variables for new functionality.
- Write unit tests for all new service methods.
- Follow the established tenant isolation patterns.
