# Production-ready Dockerfile for BizTrackKos-2
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache openssl postgresql-client curl

WORKDIR /app

# Copy package files FIRST (better layer caching)
COPY package.json package-lock.json ./

# Configure npm for reliability
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm config set fetch-retries 10 && \
    npm config set fetch-timeout 120000

# Install dependencies (cached if package.json unchanged)
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts || \
    (echo "First attempt failed, retrying..." && \
     npm cache clean --force && \
     npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts)

# Copy ONLY prisma schema before other files (better caching)
COPY prisma ./prisma/

# Generate Prisma client (cached if schema unchanged)
RUN npx prisma generate

# Copy application files LAST (this invalidates cache if any source changes)
COPY . .

# Build application (only runs if source files changed)
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache openssl postgresql-client curl dumb-init

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Create necessary directories with correct ownership
RUN mkdir -p /app/public/uploads && \
    chown -R node:node /app/public/uploads

# Startup script (must be done before switching to non-root user)
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

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

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
