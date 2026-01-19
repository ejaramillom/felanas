#!/bin/bash

# Setup environment variables for local development
# Usage: ./scripts/init-env.sh

set -e

# Default values
DEFAULT_DB_HOST="localhost"
DEFAULT_DB_PORT="5432"
DEFAULT_DB_USERNAME="postgres"
DEFAULT_DB_PASSWORD="postgres"
DEFAULT_DB_NAME="felanas"
DEFAULT_JWT_SECRET="default_secret_do_not_use_in_production"
DEFAULT_PORT="3000"

# Check if .env exists
if [ -f .env ]; then
    echo ".env file already exists. Skipping initialization."
else
    echo "Creating .env file with default values..."
    cat > .env <<EOF
DB_HOST=$DEFAULT_DB_HOST
DB_PORT=$DEFAULT_DB_PORT
DB_USERNAME=$DEFAULT_DB_USERNAME
DB_PASSWORD=$DEFAULT_DB_PASSWORD
DB_NAME=$DEFAULT_DB_NAME
JWT_SECRET=$DEFAULT_JWT_SECRET
PORT=$DEFAULT_PORT
NODE_ENV=development
EOF
    echo ".env file created successfully."
fi

# Ensure .env is gitignored
if ! grep -q ".env" .gitignore; then
    echo "Adding .env to .gitignore..."
    echo ".env" >> .gitignore
fi

echo "Environment setup complete."
