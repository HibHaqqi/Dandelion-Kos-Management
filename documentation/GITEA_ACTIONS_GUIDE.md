# 🚀 Gitea Actions Deployment Guide

## ✅ Auto-Deploy Configured

Your Gitea Actions workflow is set up to **automatically deploy** when you push to `master` or `main` branch.

---

## 📋 How It Works

### Deployment Flow

1. **Push to master/main** → Triggers workflow
2. **SSH into VPS** → Using credentials from secrets
3. **Pull latest code** → `git pull`
4. **Stop containers** → `docker compose down`
5. **Clean build cache** → `docker builder prune -f`
6. **Build new images** → `docker compose build --no-cache`
7. **Start containers** → `docker compose up -d`
8. **Run migrations** → `npx prisma db push`
9. **Health check** → Verifies app is running
10. **Show logs** → Displays deployment status

---

## 🔐 Required Secrets

Configure these in your **Gitea Repository Settings → Secrets**:

| Secret | Description | Example |
|--------|-------------|---------|
| `VPS_HOST` | Your VPS IP or domain | `192.168.1.100` or `your-domain.com` |
| `VPS_USERNAME` | SSH username | `root` or `hibhaqqi` |
| `VPS_PASSWORD` | SSH password | `your_password` |
| `VPS_PORT` | SSH port (optional) | `22` (default) |
| `PROJECT_PATH` | Path to project on VPS | `/home/hibhaqqi/code/biztrackkos-2` |

### How to Add Secrets

1. Go to your Gitea repository
2. Click **Settings** → **Secrets**
3. Click **New Secret**
4. Add each secret from the table above

---

## 🚀 Quick Start

### First Time Setup

1. **Configure Secrets** (see above)

2. **Push to master**:
```bash
git add .
git commit -m "Deploy to production"
git push origin master
```

3. **Watch Deployment**:
   - Go to your repository in Gitea
   - Click **Actions** tab
   - See the deployment workflow running

---

## 🔄 Automatic Deployment Process

### What Happens When You Push

```bash
git push origin master
```

**This automatically triggers:**

1. ✅ Code pulled on VPS
2. ✅ Old containers stopped
3. ✅ New Docker image built (using reliable Dockerfile)
4. ✅ Containers started
5. ✅ Database migrations applied
6. ✅ Health check performed
7. ✅ Logs shown

**Total time**: ~3-5 minutes

---

## 📊 Deployment Steps Explained

### Step 1: Pull Latest Changes
```bash
git fetch origin
git reset --hard origin/master
git pull origin master
```
Ensures VPS has the exact same code as master branch.

### Step 2: Stop Containers
```bash
docker compose down
```
Stops all running containers gracefully.

### Step 3: Clean Build Cache
```bash
docker builder prune -f
```
Removes old build cache to prevent "npm ci" errors.

### Step 4: Build New Images
```bash
docker compose build --no-cache
```
Builds fresh image using the updated Dockerfile with `npm install --legacy-peer-deps`.

### Step 5: Start Containers
```bash
docker compose up -d --force-recreate
```
Starts all services in detached mode.

### Step 6: Run Migrations
```bash
docker compose exec -T app npx prisma db push
```
Applies any database schema changes.

### Step 7: Health Check
```bash
curl -f http://localhost:9002
```
Verifies the application is responding.

### Step 8: Show Logs
```bash
docker compose logs --tail=50 app
```
Displays recent application logs for verification.

---

## ⚠️ Troubleshooting

### Issue 1: Deployment Fails - SSH Connection

**Error**: `ssh: connect to host`

**Solution**:
1. Verify `VPS_HOST` secret is correct
2. Check VPS firewall allows SSH (port 22)
3. Verify credentials in secrets

### Issue 2: Build Fails - npm install Error

**Error**: `exit code 1` during build

**Solution**:
Already fixed! The workflow now:
- Uses `--no-cache` flag
- Cleans build cache before building
- Uses updated Dockerfile with `--legacy-peer-deps`

### Issue 3: Container Not Starting

**Error**: App shows as unhealthy

**Solution**:
```bash
# SSH into VPS manually
ssh user@your-vps

# Check logs
cd /path/to/biztrackkos
docker compose logs app

# Restart manually
docker compose restart
```

### Issue 4: Database Migration Fails

**Error**: `Prisma schema sync failed`

**Solution**:
```bash
# Manual migration on VPS
docker compose exec app npx prisma db push
```

---

## 🎯 Best Practices

### 1. Test Locally First
Before pushing to master:
```bash
# Build and test locally
docker-compose build
docker-compose up

# Run tests
npm test

# If everything works, then push
git push origin master
```

### 2. Use Feature Branches
For development:
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to feature branch (won't trigger deploy)
git push origin feature/new-feature

# After testing, merge to master
git checkout master
git merge feature/new-feature
git push origin master  # This triggers deployment
```

### 3. Monitor Deployments

Always check:
- Gitea Actions tab for workflow status
- Application URL after deployment
- Logs if deployment fails

---

## 📱 Monitoring

### Check Deployment Status

1. **In Gitea**:
   - Repository → Actions
   - See all workflow runs
   - Click on a run to see details

2. **On VPS**:
```bash
# SSH into VPS
ssh user@your-vps

# Check running containers
cd /path/to/biztrackkos
docker compose ps

# View logs
docker compose logs -f app
```

3. **Application**:
   - Open `http://your-vps:9002`
   - Verify it loads correctly
   - Test login and features

---

## 🔧 Manual Deployment (If Auto-Deploy Fails)

If automatic deployment fails, you can deploy manually:

```bash
# SSH into VPS
ssh user@your-vps

# Navigate to project
cd /path/to/biztrackkos

# Pull latest code
git pull origin master

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Check logs
docker compose logs -f app
```

---

## 🚨 Rollback

If deployment breaks production:

### Option 1: Revert Commit
```bash
# On your local machine
git revert HEAD
git push origin master

# This will trigger auto-deploy with previous version
```

### Option 2: Manual Rollback on VPS
```bash
# SSH into VPS
ssh user@your-vps

# Go to project directory
cd /path/to/biztrackkos

# Checkout previous commit
git log  # Find commit hash
git checkout <previous-commit-hash>

# Rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 📊 Deployment History

All deployments are tracked in Gitea Actions:

1. Repository → Actions
2. See list of all deployments
3. Click on any deployment to see:
   - Timestamp
   - Commit hash
   - Duration
   - Logs
   - Success/failure status

---

## ✅ Pre-Deployment Checklist

Before pushing to master:

- [ ] Code tested locally
- [ ] Database migrations tested
- [ ] Environment variables updated
- [ ] No sensitive data in code
- [ ] Commit message is clear
- [ ] Feature branch tested (if using branches)

---

## 🎯 Summary

### Your Setup
- ✅ **Auto-deploy**: Enabled for master/main branch
- ✅ **Docker**: Reliable build with fixed Dockerfile
- ✅ **Database**: Automatic migrations
- ✅ **Health checks**: Post-deployment verification

### How to Deploy
```bash
git add .
git commit -m "Your message"
git push origin master
```

**That's it!** The rest happens automatically.

### What's Automated
1. ✅ Code pull
2. ✅ Docker build
3. ✅ Container restart
4. ✅ Database migration
5. ✅ Health check
6. ✅ Log display

---

## 🆘 Need Help?

### Quick Commands

```bash
# Check deployment status in Gitea
# Repository → Actions tab

# SSH into VPS for manual intervention
ssh user@your-vps

# Check logs on VPS
cd /path/to/biztrackkos
docker compose logs -f app

# Restart containers
docker compose restart

# Full rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

*Last Updated: 2025-01-16*
*Workflow: .gitea/workflows/deploy.yml*
*Trigger: Push to master/main*
