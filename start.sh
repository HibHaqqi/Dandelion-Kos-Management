#!/bin/bash
set -e

echo "Waiting for database to be ready..."
until pg_isready -h db -p 5432 -U postgres 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready - ensuring schema is in sync..."
echo "Running Prisma schema synchronization..."
npx prisma db push --skip-generate || {
  echo "Schema sync failed, retrying in 10 seconds..."
  sleep 10
  npx prisma db push --skip-generate
}

echo "Schema synchronized successfully!"
echo "Starting application..."
node server.js
