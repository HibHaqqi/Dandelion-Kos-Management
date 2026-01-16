# Optimized Dockerfile for faster builds
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache --no-cache openssl postgresql-client

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Increase Node.js memory limit and install dependencies
# Skip postinstall since we'll run prisma generate after copying source
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm config set fetch-retries 10 && \
    npm config set fetch-timeout 120000 && \
    npm config set fetch-max-mb-timestamp 50 && \
    npm cache clean --force && \
    npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts || \
    (npm cache clean --force && npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts)

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
