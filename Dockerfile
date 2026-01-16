# Simple Dockerfile for reliable deployment
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache openssl postgresql-client

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

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
