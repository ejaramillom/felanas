# Quickstart: Frontend User Management

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local dev without docker)

## Running the Stack (Containerized)

1. **Environment Setup**:
   ```bash
   # Create .env from example (script provided as per FR-012)
   ./scripts/init-env.sh
   ```

2. **Start Services**:
   ```bash
   docker-compose up --build
   ```
   - **Frontend**: http://localhost:8080 (Login: admin / password)
   - **Backend API**: http://localhost:3000
   - **Database**: Port 5432

3. **Stop Services**:
   ```bash
   docker-compose down
   ```

## Local Development (Hybrid)

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
