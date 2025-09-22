#!/bin/bash

# Load environment variables from .env file
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Validate required environment variables
required_vars=("POSTGRES_DB" "POSTGRES_USER" "POSTGRES_PASSWORD" "POSTGRES_PORT" "SECRET_KEY" "DEBUG")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "Error: Missing required environment variables:"
    printf '  - %s\n' "${missing_vars[@]}"
    echo "Please check your .env file and ensure all required variables are set."
    exit 1
fi

echo "Starting Docker containers..."
docker-compose up -d

echo "Waiting for database to be ready..."
sleep 10

echo "Running database migrations..."
docker-compose exec backend python manage.py migrate

echo "Setup complete!"
echo "Manual task: Remember to create a user! "