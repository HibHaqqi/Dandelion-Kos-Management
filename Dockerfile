# Production-ready Dockerfile for BizTrackKos-2
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache openssl postgresql-client curl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Configure npm for reliability
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm config set fetch-retries 10 && \
    npm config set fetch-timeout 120000

# Install dependencies with error handling (skip postinstall to avoid prisma generate before schema is copied)
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts || \
    (echo "First attempt failed, retrying..." && \
     npm cache clean --force && \
     npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts)

# Copy application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache --no-cache openssl postgresql-client curl dumb-init

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/. ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

# Create necessary directories with correct ownership
RUN mkdir -p /app/public/uploads && \
    chown -R node:node /app/public/uploads

# Use non-root user for security
USER node

# Expose port
EXPOSE 9002

# Environment variables
ENV NODE_ENV=production \
    PORT=9002 \
    NODE_OPTIONS=--max-old-space-size=4096

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:9002 || exit 1

# Startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
