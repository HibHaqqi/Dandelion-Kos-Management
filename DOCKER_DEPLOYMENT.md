# 🐳 Docker Deployment Guide

## ✅ Updated for Next.js 16

The Dockerfile has been updated with multi-stage builds and standalone output for optimal performance.

---

## 📋 What Changed

### Dockerfile Improvements
1. **Multi-stage build** - Smaller final image size
2. **Alpine Linux** - Lightweight base image
3. **Standalone output** - Optimized for Docker
4. **Prisma integration** - Client generated during build
5. **File upload support** - `/app/public/uploads` directory created
6. **Non-root user** - Security best practice

### Next.js Config
- Added `output: 'standalone'` for Docker deployment

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Option 2: Docker Build

```bash
# Build image
docker build -t biztrackkos .

# Run container
docker run -d \
  --name biztrackkos \
  -p 9002:9002 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.com" \
  biztrackkos
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=biztrackkos
POSTGRES_PORT=5432

# Application
DATABASE_URL=postgres://postgres:your_password@db:5432/biztrackkos
NEXT_PUBLIC_APP_URL=http://localhost:9002

# Optional: Node Environment
NODE_ENV=production
```

### Production Environment

For production deployment, create `.env.production`:

```env
DATABASE_URL=postgresql://user:password@production-db:5432/biztrackkos
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 📦 Deployment Steps

### 1. Prepare Environment Files

```bash
# Copy example env
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Build Image

```bash
docker-compose build
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Verify Deployment

```bash
# Check logs
docker-compose logs -f app

# Check running containers
docker-compose ps

# Test application
curl http://localhost:9002
```

---

## 🔄 Common Issues & Solutions

### Issue 1: Container Removal Error

**Error**: `removal of container is already in progress`

**Solution**:
```bash
# Force remove container
docker rm -f bizkos

# Or reset everything
docker-compose down -v
docker-compose up -d --build
```

### Issue 2: Database Connection Failed

**Symptoms**: App crashes with "can't reach database"

**Solutions**:

1. **Check database is ready**:
```bash
docker-compose logs db
```

2. **Verify DATABASE_URL**:
```bash
docker-compose exec app env | grep DATABASE_URL
```

3. **Manual database check**:
```bash
docker-compose exec db psql -U postgres -d biztrackkos
```

### Issue 3: Prisma Client Not Found

**Symptoms**: Error accessing database features

**Solution**:
```bash
# Rebuild with --no-cache
docker-compose build --no-cache
```

### Issue 4: Port Already in Use

**Error**: `port is already allocated`

**Solution**:
```bash
# Find process using port 9002
lsof -i :9002

# Kill process or change port in docker-compose.yml
ports:
  - "9003:9002"  # Use different port
```

### Issue 5: File Uploads Fail

**Symptoms**: Can't upload receipts or images

**Check**:
```bash
# Verify uploads directory exists
docker-compose exec app ls -la /app/public/uploads

# Check permissions
docker-compose exec app ls -ld /app/public/uploads
```

**Expected output**: Directory should be owned by `nextjs` user

---

## 🎯 Production Deployment

### Deploy to VPS

1. **Copy files to server**:
```bash
rsync -avz --exclude 'node_modules' --exclude '.next' \
  /path/to/biztrackkos/ user@server:/var/www/biztrackkos/
```

2. **SSH into server**:
```bash
ssh user@server
cd /var/www/biztrackkos
```

3. **Start containers**:
```bash
docker-compose up -d --build
```

4. **Setup reverse proxy (nginx)**:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Deploy to Cloud Platforms

#### AWS ECS
1. Push image to ECR
2. Create task definition
3. Run service

#### Google Cloud Run
```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/biztrackkos

# Deploy
gcloud run deploy biztrackkos \
  --image gcr.io/PROJECT_ID/biztrackkos \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances
```bash
# Create resource group
az group create --name biztrackkos-rg --location eastus

# Create container
az container create \
  --resource-group biztrackkos-rg \
  --name biztrackkos \
  --image your-registry/biztrackkos:latest \
  --dns-name-label biztrackkos-unique \
  --ports 9002
```

---

## 🔍 Monitoring & Logs

### View Logs
```bash
# All logs
docker-compose logs

# App only
docker-compose logs app

# Follow logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Database Access
```bash
# Connect to database
docker-compose exec db psql -U postgres -d biztrackkos

# Run verification
docker-compose exec app node scripts/verify-deployment.js
```

### Container Stats
```bash
docker stats bizkos
```

---

## 🗄️ Database Management

### Backup Database
```bash
# Backup
docker-compose exec db pg_dump -U postgres biztrackkos > backup.sql

# Restore
cat backup.sql | docker-compose exec -T db psql -U postgres biztrackkos
```

### Reset Database
```bash
# WARNING: Deletes all data
docker-compose down -v
docker-compose up -d
```

---

## 📊 Performance Optimization

### Image Size
- **Before**: ~1GB (with node_modules)
- **After**: ~150MB (standalone output)

### Build Time
- **First build**: 3-5 minutes
- **Rebuild**: 1-2 minutes (cached layers)

### Startup Time
- **Database wait**: ~5-10 seconds
- **App start**: ~2-3 seconds

---

## 🔐 Security Best Practices

1. ✅ **Non-root user** - App runs as `nextjs` user
2. ✅ **Minimal base image** - Alpine Linux
3. ✅ **No secrets in image** - Use environment variables
4. ✅ **Read-only root** - Where possible
5. ✅ **Health checks** - Database health check enabled

### Additional Security

```bash
# Scan image for vulnerabilities
docker scan biztrackkos:latest

# Use specific version tags
FROM node:20-alpine@sha256:...
```

---

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Clean old images
docker image prune -a
```

### Update Dependencies
```bash
# On host machine
npm update

# Rebuild
docker-compose build --no-cache
```

---

## 📝 Troubleshooting Commands

```bash
# Enter container shell
docker-compose exec app sh

# Check environment variables
docker-compose exec app env

# Restart specific service
docker-compose restart app

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

---

## ✅ Pre-Deployment Checklist

- [ ] `.env` file configured
- [ ] Database credentials set
- [ ] `NEXT_PUBLIC_APP_URL` set correctly
- [ ] Port 9002 available
- [ ] Sufficient disk space (>2GB)
- [ ] Database backup created
- [ ] DNS configured (if using domain)
- [ ] SSL certificate ready (for HTTPS)

---

## 🎯 Success Criteria

After deployment, verify:

1. ✅ Application starts without errors
2. ✅ Database connection successful
3. ✅ Can login as admin
4. ✅ Can register tenant
5. ✅ File uploads work
6. ✅ All pages load correctly
7. ✅ Mobile responsive design works

---

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose logs`
2. Verify database: `docker-compose exec db pg_isready`
3. Test locally first: `npm run dev`
4. Check this guide's troubleshooting section

---

*Last Updated: 2025-01-16*
*Next.js Version: 16.1.1*
*Node Version: 20*
*Docker Compose Version: 3.8*
