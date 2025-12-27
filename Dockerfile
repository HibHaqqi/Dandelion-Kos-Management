# Use the official Node.js 20 image.
FROM node:20-slim

# Install OpenSSL and PostgreSQL client tools
RUN apt-get update -y && apt-get install -y openssl postgresql-client && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Copy the prisma schema
COPY prisma ./prisma

# Install dependencies.
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application code to the working directory.
COPY . .

# Build the Next.js application.
RUN npm run build

# Expose the port the app runs on.
EXPOSE 9002

# Create a startup script
COPY <<EOF /app/start.sh
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
npm start
EOF

RUN chmod +x /app/start.sh

# Define the command to start the app.
CMD ["/app/start.sh"]
