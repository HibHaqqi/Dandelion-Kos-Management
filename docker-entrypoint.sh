#!/bin/sh
set -e

echo "=== Starting BizTrackKos-2 Container ==="

# Wait for database if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database to be ready..."
    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if pg_isready -h db -U "$POSTGRES_USER" >/dev/null 2>&1; then
            echo "✅ Database is ready!"
            break
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "Waiting for database... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo "⚠️  Database not ready after 60 seconds, but continuing..."
    fi

    # Run Prisma migrations
    echo "Running database migrations..."
    npx prisma db push --skip-generate --accept-data-loss || \
        echo "⚠️  Migration had issues, but continuing startup..."

    # Generate Prisma client
    echo "Generating Prisma client..."
    npx prisma generate || echo "⚠️  Prisma generate failed, using existing client"
fi

echo "✅ Starting application..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "Database: ${DATABASE_URL:+configured}"

# Start the application
exec "$@"
