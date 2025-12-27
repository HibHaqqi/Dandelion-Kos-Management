# CI/CD Deployment Guide for Gitea + Docker

## Overview

This project uses **Gitea Actions** for CI/CD and **Docker Compose** for deployment. When you push to the `master` branch, the application is automatically built and deployed to your VPS.

---

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Gitea     │────────▶│   Gitea     │────────▶│   Your VPS   │
│ Repository  │  Push   │  Actions    │  SSH    │   (Docker)   │
└─────────────┘         └─────────────┘         └──────────────┘
                                                           │
                                                           ▼
                                                ┌──────────────────────┐
                                                │  Docker Compose      │
                                                │  ┌────────────────┐  │
                                                │  │  App Container │  │
                                                │  │  (Next.js)     │  │
                                                │  └────────────────┘  │
                                                │  ┌────────────────┐  │
                                                │  │  DB Container  │  │
                                                │  │  (PostgreSQL)  │  │
                                                │  └────────────────┘  │
                                                └──────────────────────┘
```

---

## Prerequisites

### 1. Gitea Secrets Configuration

You need to configure these secrets in your Gitea repository:

Go to: **Repository → Settings → Secrets → Actions**

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `VPS_HOST` | Your VPS IP address or domain | `192.168.1.100` or `yourdomain.com` |
| `VPS_USERNAME` | SSH username for VPS | `hibhaqqi` |
| `VPS_PASSWORD` | SSH password for VPS | `your_password` |
| `VPS_PORT` | SSH port (optional, default: 22) | `22` |
| `PROJECT_PATH` | Full path to project on VPS | `/home/hibhaqqi/code/biztrackkos-2` |

### 2. VPS Setup

Ensure your VPS has:
- ✅ Docker installed
- ✅ Docker Compose installed
- ✅ Git installed
- ✅ SSH access configured
- ✅ Project cloned from Gitea

### 3. Gitea Actions Enabled

In your Gitea instance:
- Go to **Repository → Settings → Actions**
- Enable Actions if not already enabled
- Ensure the runner is configured

---

## Deployment Flow

### What Happens When You Push to Master?

1. **Trigger**: Gitea detects push to `master` branch
2. **Build**: Action workflow starts
3. **Connect**: SSH into your VPS
4. **Pull**: `git pull` latest changes
5. **Stop**: `docker compose down` stops old containers
6. **Build**: `docker compose up -d --build` builds new images
7. **Migrate**: Container startup runs `prisma db push` automatically
8. **Start**: Application starts on port 9002

---

## File Changes Made

### 1. Dockerfile (Updated)

**Key Changes:**
- ✅ Changed from `prisma migrate deploy` to `prisma db push`
- ✅ Added retry logic for database connection
- ✅ Better error handling and logging
- ✅ Automatic schema synchronization on startup

**What it does:**
```bash
# On container start:
1. Wait for database to be ready
2. Run 'prisma db push' to sync schema
3. Start the Next.js application
```

### 2. docker-compose.yml (Updated)

**Key Changes:**
- ✅ Added proper `DATABASE_URL` environment variable
- ✅ Added healthcheck for database
- ✅ Added `restart: unless-stopped` policy
- ✅ Fixed network configuration

**Benefits:**
- Automatic restart on failure
- Better database connection handling
- Proper environment variable passing

### 3. .gitea/workflows/deploy.yml (Enhanced)

**Key Changes:**
- ✅ More detailed logging
- ✅ Better error handling with `set -e`
- ✅ Container status checking
- ✅ Log output after deployment
- ✅ Force recreate containers

**What it does:**
```bash
1. SSH into VPS
2. Pull latest code
3. Stop old containers
4. Build and start new containers
5. Show status and logs
```

---

## How to Deploy

### Option 1: Automatic Deployment (Recommended)

Just push to master:

```bash
# Make your changes
git add .
git commit -m "Add new feature"
git push origin master
```

**Deployment happens automatically!** 🚀

Check deployment status:
- Go to **Repository → Actions** in Gitea
- Click on the latest workflow run
- View logs in real-time

### Option 2: Manual Deployment (For Testing)

SSH into your VPS and run:

```bash
cd /home/hibhaqqi/code/biztrackkos-2

# Pull latest changes
git pull origin master

# Rebuild and restart
docker compose down
docker compose up -d --build --force-recreate

# Check logs
docker compose logs -f app
```

---

## Troubleshooting

### Issue 1: Deployment Fails - "Permission Denied"

**Cause:** SSH credentials incorrect or insufficient permissions

**Solution:**
1. Verify secrets in Gitea:
   ```bash
   # Test SSH connection manually
   ssh hibhaqqi@YOUR_VPS_IP
   ```

2. Ensure user has Docker permissions:
   ```bash
   sudo usermod -aG docker hibhaqqi
   ```

### Issue 2: Database Migration Fails

**Cause:** Database not ready or connection issues

**Solution:**
1. Check database container logs:
   ```bash
   docker compose logs db
   ```

2. Manually run migration:
   ```bash
   docker compose exec app npx prisma db push
   ```

3. Check DATABASE_URL:
   ```bash
   docker compose exec app env | grep DATABASE_URL
   ```

### Issue 3: Container Won't Start

**Cause:** Port conflict or build error

**Solution:**
1. Check what's using port 9002:
   ```bash
   sudo lsof -i :9002
   ```

2. Check container logs:
   ```bash
   docker compose logs app
   ```

3. Rebuild from scratch:
   ```bash
   docker compose down -v
   docker compose up -d --build
   ```

### Issue 4: "Module Not Found" Errors

**Cause:** Dependencies not installed correctly

**Solution:**
1. Rebuild without cache:
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

### Issue 5: Gitea Actions Not Running

**Cause:** Actions disabled or runner not configured

**Solution:**
1. Check Gitea Actions settings
2. Ensure runner is active:
   ```bash
   # On Gitea server
   gitea actions --list
   ```

---

## Deployment Checklist

Before pushing to master:

- [ ] Code tested locally
- [ ] `prisma/schema.prisma` validated
- [ ] Environment variables in `.env` are correct
- [ ] Database migration compatible
- [ ] Gitea secrets configured
- [ ] VPS has sufficient disk space
- [ ] Docker is running on VPS

After deployment:

- [ ] Check Gitea Actions log for errors
- [ ] Verify containers are running: `docker compose ps`
- [ ] Check application logs: `docker compose logs app`
- [ ] Test application at `http://VPS_IP:9002`
- [ ] Verify database schema: check if new features work

---

## Useful Commands

### On Your VPS

```bash
# View running containers
docker compose ps

# View real-time logs
docker compose logs -f app

# View logs for all services
docker compose logs -f

# Restart containers
docker compose restart

# Stop containers
docker compose down

# Rebuild and start
docker compose up -d --build

# Execute command in container
docker compose exec app npm run prisma db push

# Check database connection
docker compose exec db psql -U hibhaqqi -d kosmanage -c "SELECT 1;"

# View disk usage
docker system df

# Clean up old images
docker system prune -a
```

### On Your Local Machine

```bash
# Test SSH connection
ssh hibhaqqi@YOUR_VPS_IP

# Check remote repository status
ssh hibhaqqi@YOUR_VPS_IP "cd /home/hibhaqqi/code/biztrackkos-2 && git status"

# Trigger manual deployment (via SSH)
ssh hibhaqqi@YOUR_VPS_IP "cd /home/hibhaqqi/code/biztrackkos-2 && ./deploy.sh"
```

---

## Database Migrations

### How Schema Changes Are Applied

**Before (Old Way - Using Migration Files):**
```dockerfile
npx prisma migrate deploy
```
❌ Requires migration files
❌ Fails if files don't exist
❌ Complex to manage

**Now (New Way - Using db push):**
```dockerfile
npx prisma db push --skip-generate
```
✅ No migration files needed
✅ Automatically syncs schema
✅ Simple and reliable

### When Schema Changes Happen

1. You modify `prisma/schema.prisma`
2. Push to master
3. Gitea Action triggers deployment
4. Docker builds new image
5. Container starts
6. `prisma db push` runs automatically
7. Database schema updated ✅

---

## Monitoring and Logs

### Application Logs

```bash
# Real-time logs
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app

# Logs with timestamps
docker compose logs -t app
```

### Database Logs

```bash
docker compose logs -f db
```

### Gitea Actions Logs

1. Go to your repository in Gitea
2. Click **Actions** tab
3. Click on the workflow run
4. Expand steps to see detailed logs

---

## Security Best Practices

### 1. Use SSH Keys Instead of Passwords (Recommended)

Generate SSH key pair:
```bash
ssh-keygen -t ed25519 -C "gitea-deploy" -f ~/.ssh/gitea_deploy
```

Add public key to VPS:
```bash
cat ~/.ssh/gitea_deploy.pub | ssh hibhaqqi@VPS_IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

Update Gitea secrets:
- Add `VPS_SSH_KEY` with private key content
- Update workflow to use SSH key authentication

### 2. Restrict SSH Access

```bash
# On VPS, restrict SSH to specific IP
sudo ufw allow from YOUR_IP to any port 22
```

### 3. Use Environment Variables

Never commit secrets:
```bash
# Add to .gitignore
.env
.env.local
.env.*.local
```

### 4. Regular Updates

```bash
# Keep Docker updated
sudo apt update && sudo apt upgrade docker.io docker-compose
```

---

## Performance Optimization

### 1. Use Build Cache

Docker caches layers by default. To leverage this:
- Don't use `--no-cache` unless necessary
- Order Dockerfile instructions optimally
- Keep dependencies stable

### 2. Database Backups

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -h localhost -U hibhaqqi kosmanage > /backups/bizkos_$(date +\%Y\%m\%d).sql
```

### 3. Log Rotation

Prevent disk filling:
```bash
# Configure Docker log rotation
sudo nano /etc/docker/daemon.json
```

Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## Rollback Procedure

If deployment breaks something:

### Quick Rollback

```bash
# SSH into VPS
ssh hibhaqqi@YOUR_VPS_IP

cd /home/hibhaqqi/code/biztrackkos-2

# Revert to previous commit
git log --oneline -5  # Find commit hash
git reset --hard <previous-commit-hash>

# Rebuild
docker compose down
docker compose up -d --build
```

### Database Rollback

If schema changes cause issues:
```bash
# Restore from backup
psql -h localhost -U hibhaqqi kosmanage < /backups/bizkos_YYYYMMDD.sql
```

---

## Support and Debugging

### Enable Debug Mode

Add to `.env`:
```bash
DEBUG=prisma:query
NODE_ENV=development
```

### Check Container Health

```bash
docker inspect bizkos | grep -A 10 Health
```

### Database Connection Test

```bash
docker compose exec app npx prisma db pull
```

---

## Summary

✅ **Auto-Deploy**: Push to master triggers automatic deployment
✅ **Zero Downtime**: Containers restart automatically
✅ **Database Migrations**: Applied automatically with `prisma db push`
✅ **Error Recovery**: Retry logic and health checks
✅ **Monitoring**: Logs and status checking
✅ **Rollback**: Easy git-based rollback

---

**Created:** 2025-12-27
**Updated:** 2025-12-27
**Version:** 2.0 (Using prisma db push)
