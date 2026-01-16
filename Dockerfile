# Optimized Dockerfile for faster builds
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache --no-cache openssl postgresql-client

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with npm config for speed
RUN npm config set fetch-retries 5 && \
    npm config set fetch-timeout 60000 && \
    npm install --legacy-peer-deps --no-audit --no-fund --quiet

# Copy application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Create uploads directory
RUN mkdir -p /app/public/uploads

# Expose port
EXPOSE 9002

# Set environment
ENV NODE_ENV=production
ENV PORT=9002

# Start the application
CMD ["npm", "start"]
