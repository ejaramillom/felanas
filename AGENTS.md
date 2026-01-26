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
# TODO: pending to be defined
```

### Common Development Commands

#### Testing
```bash
# TODO: pending to be defined
```

#### Database Operations
```bash
# TODO: pending to be defined
```

#### Elasticsearch Operations
```bash
# TODO: pending to be defined
```

#### Background Jobs and Cron
```bash
# TODO: pending to be defined
```

## Application Architecture

### High-Level Architecture
The first iteration is a small-scale application implementing Domain-Driven Design (DDD) principles with:

- **Multi-tenant SaaS platform** with site-based isolation
- **Single-database architecture** 

The future architecture should be able to allow for (but will be revisited in future constitutions):
- **Microservices integration** with platform services
- **Event-driven architecture** using RabbitMQ and Sidekiq
- **API-first design** with REST APIs and webhooks
- **Elasticsearch-powered search** for all listing pages
- **Real-time features** with WebSockets and Server-Sent Events

### Directory Structure
```
# TODO: Define folder structure based on design decisions
```

### Database Architecture
- **Primary Database**: MySQL with horizontal sharding by `site_id`
- **Sharding Strategy**: Site-based partitioning for scalability
- **Global Database**: Shared data across all sites (manager users, configurations, feature flags)

Future implementations will make use of systems such as
- **Spanner Database**: Google Cloud Spanner or a similar tool for specific use cases
- **Read Replicas**: Configured for read-heavy operations

### Key Architectural Patterns

#### Domain-Driven Design Services
This is an example in ruby language, but must adapt to other languages based on its strength and flaws.

Business logic is organized into domain services following this pattern:

```ruby
module Users
  class Factory
    def initialize(params, site:, user: nil)
      @params = params
      @site = site
      @user = user
    end

    def call
      return failure_result unless valid?

      ActiveRecord::Base.transaction do
        result = perform_operation
        publish_events if result.success?
        result
      end
    rescue => e
      failure_result([e.message])
    end

    private

    def perform_operation
      # Business logic implementation
    end
  end
end
```

#### Model Organization
This is an example in ruby language, but must adapt to other languages based on its strength and flaws.

Models follow a consistent structure:
```ruby
class User < ApplicationRecord
  # 1. Associations
  belongs_to :site
  has_many :subscriptions

  # 2. Concerns for shared behavior
  include CurrencyFields
  include ValidatedEnum
  include Paranoid::Delete

  # 3. Enums with validation
  validated_enum state: { active: 'active', closed: 'closed' }

  # 4. Validations
  validates :user_code, presence: true, uniqueness: { scope: :site_id }

  # 5. Scopes
  scope :active, -> { where(state: 'active') }

  # 6. Callbacks
  before_create :generate_user_code

  # 7. Business logic methods
  def can_be_charged?
    active? && billing_info.present?
  end

  # 8. Shard key for database sharding
  def shard_key
    site_id
  end
end
```

#### Controller Patterns
This is an example in ruby language, but must adapt to other languages based on its strength and flaws.

Controllers delegate business logic to domain services:
```ruby
class UserController < ApplicationController
  def create
    result = Users::Factory.new(user_params, site: current_site).call

    if result.success?
      redirect_to result.data, notice: 'User created successfully'
    else
      @user = User.new(user_params)
      @errors = result.errors
      render :new, status: :unprocessable_entity
    end
  end
end
```

### Database Sharding
This is an example in ruby language, but must adapt to other languages based on its strength and flaws.

The application uses site-based sharding:
```ruby
# Query specific shard
ApplicationRecord.on_shard(shard_key: site.id) do
  User.where(email: email)
end

# Query across all shards
ApplicationRecord.each_shard do |shard|
  results = User.where(email: email)
  return results if results.exists?
end
```

### Shard Maintenance
The application includes automatic protection during maintenance operations:

#### Site Clearing Protection
When sites are being cleared (during transitions or site closures), the system automatically prevents race conditions:

```ruby
# Site clearing is handled automatically by on_shard
ApplicationRecord.on_shard(shard_key: site.id) do
  # This will raise Database::ShardMaintenance::MaintenanceInProgress
  # if site clearing is in progress
  perform_site_operations
end
```

#### Error Handling
All controllers automatically handle maintenance scenarios with 503 responses:

```ruby
# Controllers automatically rescue maintenance exceptions
rescue Database::ShardMaintenance::MaintenanceInProgress => e
  logger.warn "#{e.maintenance_type.to_s.humanize} is in progress, rejecting request"
  response.headers['Retry-After'] = e.retry_after.seconds
  render_error('Service Unavailable', :service_unavailable)
end
```

#### Maintenance Types
- **Database Cutover**: Shard migrations (10 second retry)
- **Site Clearing**: Data purging operations (30 second retry)

The system could use Redis or similar tools for caching maintenance coordination to prevent write operations during maintenance windows.

### Testing Strategy
- **To be defined** for unit, integration, and system tests
- **To be defined** for test data generation
- **To be defined** for HTTP interaction recording
- **To be defined** for HTTP request stubbing
- **Feature flags** for testing new functionality
- **Parallel test execution** for faster CI/CD

### Background Processing
- **Sidekiq** for background job processing
- **Hutch** for RabbitMQ message consumption
- **Event-driven architecture** for domain events
- **Dedicated webhook queues** for different site types

### API Design
- **Versioned APIs** (V1, V2) with backward compatibility
- **REST-first approach** with standardized error handling
- **Webhook system** for real-time notifications
- **Rate limiting** and authentication middleware
- **Comprehensive API documentation** with OpenAPI specs

### Security Features
- **Multi-factor authentication** with device trust
- **OAuth2 integrations** for external services
- **PCI compliance** for payment processing
- **Audit logging** for all sensitive operations
- **VPN-aware authentication** for internal access

### Monitoring and Observability
- **Structured logging** with semantic_logger
- **Distributed tracing** with OpenTelemetry
- **Custom metrics** with Prometheus
- **Error tracking** with Sentry
- **Performance monitoring** with New Relic

### GitHub Actions Best Practices
- Use semantic job and step names
- Implement proper conditional logic with `if:` statements
- Use outputs and needs for job dependencies
- Cache dependencies appropriately
- Use secrets properly and avoid logging sensitive data

### Error Handling
- Use Ruby's exception hierarchy appropriately
- Provide meaningful error messages with context
- Log errors with appropriate severity levels
- Handle API rate limits and network failures gracefully
- Use retry logic for transient failures

### API Integration Patterns
- Implement consistent error handling across all API clients
- Use proper authentication patterns (tokens, service users)
- Handle pagination for list operations
- Implement rate limiting and backoff strategies
- Validate API responses before processing

### Testing
- Write RSpec tests for Ruby modules
- Mock external API calls in tests
- Test both success and failure scenarios
- Use shared examples for common behaviors
- Include integration tests for critical workflows

## Docker & Containerization

### Build Optimization
- Use multi-stage builds where appropriate
- Implement proper layer caching strategies
- Use BuildKit cache mounts for package managers
- Optimize image sizes with minimal base images
- Use proper .dockerignore files

### Security
- Use non-root users in containers
- Scan images for vulnerabilities
- Use specific version tags rather than latest
- Implement proper secret handling

## GitHub Actions Workflows

### Workflow Design
- Use reusable workflows for common patterns
- Implement proper job dependencies with needs
- Use matrix strategies for parallel execution
- Handle different repository configurations (master vs main)
- Implement proper artifact management

### Performance
- Use appropriate runner sizes (small, medium, large)
- Implement caching for dependencies
- Parallelize independent operations
- Use conditional execution to skip unnecessary steps

## Common Patterns

### CLI Tools (scripts/bin/reaction)
- Use consistent command structure with subcommands
- Implement proper option parsing and validation
- Provide helpful error messages and usage information
- Support both interactive and automated execution

### API Clients
- Use consistent client initialization patterns
- Implement proper authentication handling
- Handle different response formats gracefully
- Use appropriate HTTP libraries and patterns

### Configuration Management
- Use YAML for structured configuration
- Implement environment-specific configurations
- Validate configuration at startup
- Use consistent naming conventions

## Security Considerations
- Never log sensitive information (tokens, passwords)
- Use GitHub secrets appropriately
- Implement proper token scoping
- Validate all inputs to prevent injection attacks
- Use secure communication (HTTPS, TLS)

## Monitoring & Observability
- Use structured logging with appropriate levels
- Include contextual information in logs
- Implement proper error reporting
- Use GitHub Actions summaries for visibility
- Monitor API usage and rate limits

### Development Best Practices
1. **Domain services** for complex business logic
2. **Shard-aware** database operations
3. **Feature flags** for gradual rollouts
4. **Comprehensive test coverage** with multiple test types
5. **Code concerns** for shared behavior
6. **Presenter pattern** for view logic
7. **Result objects** for service responses
8. **Event publishing** for state changes

## Key Integration Points

### External Services
- **Notification Services**: Braze for customer communication
- **Analytics**: Google Analytics, custom metrics
- **Accountancy**: Integrations for tax management

### Internal Platform Services
- **Webhooks Service**: Notification delivery
- **Analytics Service**: Data aggregation and reporting
- **Merchant Identity**: Authentication and SSO
- **Freightliner**: Export and reporting backend
- **Taxman**: Tax calculation service
- **Emaily**: User lifecycle emails

## Important Notes for Development

### Code Organization
- Keep business logic in `app/domain/` services
- Use concerns for shared model/controller behavior
- Implement presenters for complex view logic
- Follow the established testing patterns

### Database Considerations
- Always include `site_id` in queries for sharded models
- Use `on_shard` methods for shard-specific operations
- Consider transaction boundaries across shards
- Include shard key in database indexes

### Performance Guidelines
- Prevent N+1 queries with specific language implementations and big O complexity of algorithms.
- Implement caching for expensive operations
- Use background jobs for time-consuming tasks
- Monitor database query performance

### Feature Development
- Use feature flags for new functionality
- Use on/off switches when implementing sync or coordination operations
- Write comprehensive tests before implementation
- Follow the domain service pattern for business logic
- Ensure proper error handling and logging

# Gemini Project Guidelines

This document outlines the conventions and best practices for working with the Global application codebase. 
As an AI assistant, I will adhere to these guidelines to ensure consistency and maintain code quality.
Most examples are written in ruby or explained using ruby conventions, but should be determined after the corresponding
Framework was selected during planning and a programming language selected for the task, as well as a working framework.

## Project Overview

This is a small-scale application implementing Domain-Driven Design (DDD) principles. It uses a number of standard components, as well as a number of third-party libraries and internal libraries. The application appears to be a schedule management platform, with features for managing users, user profiles, skillsets, schedules, partial payments, and customers.

## Key Technologies

- **To be defined:** The core framework for the application.
- **PostgreSQL:** The application uses PostgreSQL for main structured schemas and general development.
- **Spanner:** Desired, use in future developments.
- **To be defined:** The primary testing framework.
- **Sidekiq or similar:** Used for background job processing.
- **To be defined:** The templating language for views.
- **Elasticsearch:** Used for search functionality.
- **To be defined:** Some parts of the frontend are built with the defined tool.

## Conventions and Style

### Language

- **Style Guide:** The project follows a defined style guide.
- **Linter:** There is a linting tool for code consistency. The configuration is defined in `.linter.yml` or as defined in the tool.
- **Line Length:** Maximum line length is 120 characters.
- **Quotes:** Use single quotes for string literals unless interpolation is required.

### Testing

- **Framework:** A defined testing framework is defined.
- **File Location:** Specs are located in the `spec` directory, following the standard testing naming conventions according to the selected framework.
- **Factories:** Factory methods are used for creating test data. Factories are located in `spec/factories`.
- **Mocks and Stubs:** Tool built-in mocking and stubbing capabilities are used.

### Database and Sharding

- **Sharded Models (e.g., `Site`):** Models that reside on sharded databases (like `Site`) **must only be accessed or loaded within an `ApplicationRecord.on_shard` block**. Attempting to access them outside this context will result in errors or incorrect data.
- **Global Models (e.g., `GlobalSite`):** Models that reside on the global, unsharded database (like `GlobalSite`) can be accessed anywhere. Use `GlobalSite` when you need information about a site without establishing a shard connection.
- **Accessing `Site` Objects:** When you have a sharded record (e.g., `Transaction`, `BillingInfo`) that has a `site` association, prefer `record.site` to access the `Site` object within the `on_shard` block. Avoid redundant `Site.find` calls if the `Site` object can be retrieved through an already-loaded associated record, as this can lead to unnecessary database queries.
- **`ApplicationRecord.on_shard`:** This method establishes the connection to the correct shard. Any operations on sharded models must occur within its block.

### Frontend

- **To be defined:** The project uses a mix of frontend tools.
- **Styling:** The project uses a defined tool for styling.
- **Asset Pipeline:** A defined asset pipeline is used for managing assets.

### Commits

- **Message Style:** I will analyze the git history to match the commit message style.

## Development Workflow

1.  **Create a new branch:** For each new feature or bug fix, create a new branch from `main`. command: `git checkout -b new-branch-name`
2.  **Write code:** Follow the conventions and best practices outlined in this document.
3.  **Write tests:** Write tests to cover the new code.
4.  **Run tests:** Only run specific test files relevant to your changes. Do not run the entire test suite.
5.  **Push changes:** Push the changes to the remote repository.
6.  **Create a pull request:** Request approval to run commands when creating a pull request to merge the changes into `staging`.

## Rule: Pair Programming Guidelines
Act as a pair programming teacher and code reviewer. Do not make changes to files unless explicitly instructed to do so by the user. Focus on:
- Keeping solutions simple, easy to follow, and maintainable
- Explaining code and concepts
- Suggesting improvements and alternatives
- Identifying potential issues
- Teaching best practices
- Answering questions about the codebase

## Project Overview
Pipeline Configs is a comprehensive CI/CD automation platform built with Selected language and GitHub Actions that provides:
- GitHub Actions workflows for build, test, and deployment
- Language-based CLI tools for repository management and automation
- Integration for intelligent test selection
- Docker image building and caching optimizations
- GitHub runner scale sets for dynamic compute
- Release management and PR automation

## Architecture & Key Components

### Core Technologies
- **Language**: To be defined with dependency management
- **CI/CD**: GitHub Actions workflows with reusable components
- **AI Integration**: AI for test selection and release notes
- **Containerization**: Docker with BuildKit caching and multi-architecture builds
- **Orchestration**: To be defined charts or tool to scale in the future
- **Authentication**: GitHub Apps, Google Cloud service users, OAuth tokens or other defined tools

### Directory Structure
- `.github/workflows/`: Reusable GitHub Actions workflows
- `.github/actions/`: Custom composite actions for common tasks
- `reactions/lib/`: Language library modules organized by functionality
- `reactions/bin/`: CLI executables (reaction, etc.)
- `scripts/`: Legacy scripts retained for reference
- `gha-runner-scale-set/`: Orchestration configurations for GitHub runners
- `ext-lib-release/`: External library release automation
- `docs/`: Documentation and images

### Key Language Modules
- `reactions/lib/reaction/api/`: API integrations (GitHub, Vertex AI, Jira, Slack, Coda)
- `reactions/lib/reaction/cli/`: Command-line interface implementations
- `reactions/lib/reaction/github/`: GitHub-specific operations and middleware
- `reactions/lib/reaction/utils/`: Utility helpers and shared functionality
- `reactions/lib/reaction/auth/`: Authentication and authorization modules
- `reactions/lib/reaction/release/`: Release orchestration workflows and helpers
- `reactions/lib/reaction/slack/`: Slack integration helpers and messaging utilities
- `reactions/lib/reaction/coda/`: Coda export and automation tooling
