# Fix File Upload Issue on Production VPS

## Problem
- Data can be saved to database ✓
- File uploads fail ✗
- PostgreSQL errors showing "nextcloud" user authentication failures

## Diagnosis Steps

### 1. Run the diagnostic script on your VPS:

```bash
# SSH into your VPS
cd /path/to/biztrackkos-2

# Make script executable (if not already)
chmod +x diagnose-production.sh

# Run diagnostics
./diagnose-production.sh
```

This will show you:
- Running containers
- Environment variables in bizkos container
- Upload directory permissions
- Nextcloud containers (if any)
- PostgreSQL connections
- Recent error logs

### 2. Check the actual error on production:

```bash
# View live logs when trying to upload
docker logs -f bizkos

# In another terminal, check database logs
docker logs -f bizkos-db
```

## Common Issues and Fixes

### Issue 1: Wrong DATABASE_URL in Container

**Symptom:** Container tries to connect as user "nextcloud"

**Fix:**
```bash
# Stop containers
docker-compose down

# Check your .env file
cat .env | grep DATABASE_URL

# Should be: postgres://hibhaqqi:rahasia@db:5432/kosmanage
# If it shows nextcloud, edit the file:
nano .env

# Restart containers
docker-compose up -d
```

### Issue 2: Multiple Docker Networks/Containers Conflict

**Symptom:** Requests going to wrong database container

**Check:**
```bash
# See all networks
docker network ls

# See what's connected
docker network inspect <network-name>
```

**Fix:** Make sure each app uses its own database:
```yaml
# In docker-compose.yml, ensure:
services:
  db:
    container_name: bizkos-db  # Unique name
    environment:
      - POSTGRES_USER=hibhaqqi  # Your app's user
      - POSTGRES_DB=kosmanage   # Your app's database
```

### Issue 3: Upload Directory Permissions

**Symptom:** Permission denied when writing files

**Fix:**
```bash
# Check ownership
docker exec bizkos ls -la /app/public/uploads/

# Fix permissions (run on host)
docker exec bizkos chown -R node:node /app/public/uploads/
docker exec bizkos chmod -R 755 /app/public/uploads/
```

### Issue 4: Shared PostgreSQL Instance

**Symptom:** Both apps using same PostgreSQL but different databases

**Current Setup (likely):**
```
PostgreSQL Server
├── Database: nextclouddb (User: nextcloud)
└── Database: kosmanage (User: hibhaqqi) ← Your app
```

**Your DATABASE_URL should be:**
```
DATABASE_URL=postgres://hibhaqqi:rahasia@db:5432/kosmanage
```

**NOT:**
```
DATABASE_URL=postgres://nextcloud:password@db:5432/nextclouddb
```

## Quick Fix Commands

### Option A: Restart with correct environment
```bash
cd /path/to/biztrackkos-2
docker-compose down
docker-compose up -d --build
docker logs -f bizkos
```

### Option B: Recreate container completely
```bash
docker-compose down -v  # WARNING: Deletes data!
docker-compose up -d --build
```

### Option C: Check and fix environment in running container
```bash
# See current env
docker exec bizkos env | grep DATABASE

# If wrong, recreate container (Docker doesn't allow env change in running container)
docker-compose down
# Edit .env file
nano .env
docker-compose up -d
```

## Verify Fix

After applying fix, test upload:

1. Go to complaint or payment page
2. Try uploading an image
3. Check logs:
```bash
docker logs bizkos --tail=20
```

You should see:
- ✓ "Image uploaded successfully" in browser
- ✓ No "nextcloud" errors in logs
- ✓ File appears in `public/uploads/`

## Still Having Issues?

Collect this info and share:

```bash
# Container info
docker ps -a

# Environment (hide passwords!)
docker exec bizkos env | sed 's/PASSWORD=.*/PASSWORD=**HIDDEN**/'

# Recent errors
docker logs bizkos --tail=100 > bizkos-errors.log

# Upload directory
docker exec bizkos ls -laR /app/public/uploads/
```

## Prevention

To avoid this in the future:

1. **Use unique container names**
   ```yaml
   # Good:
   container_name: bizkos-db
   # Not:
   container_name: db  # Too generic
   ```

2. **Use unique database names**
   ```env
   POSTGRES_DB=kosmanage  # Specific to your app
   ```

3. **Use environment-specific .env files**
   ```bash
   .env.local      # Local development
   .env.production # Production VPS
   ```

4. **Don't share DATABASE_URL between apps**
   Each app should have its own database credentials.
