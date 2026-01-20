# Docker Uploads Persistence - Fixed!

## Problem
Previously, uploaded files were lost when rebuilding Docker containers because the uploads directory wasn't persisted in a volume.

## Solution ✅
Added persistent Docker volume for uploads in `docker-compose.yml`:

```yaml
volumes:
  - uploads:/app/public/uploads  # Persistent upload storage

volumes:
  pgdata:
  uploads:  # Named volume for upload persistence
```

## What This Means

### Before (Broken):
- ❌ Files uploaded to container
- ❌ Lost on `docker-compose down`
- ❌ Lost on `docker-compose up --build`
- ❌ Lost on container restart

### After (Fixed):
- ✅ Files stored in named Docker volume
- ✅ Persists across container rebuilds
- ✅ Persists across `docker-compose down`
- ✅ Survives container deletion (unless volume is explicitly deleted)

## Current Files Already in Container

If you have files already uploaded in the container (like `1768916467815-1000138896.jpg`), you need to copy them to the persistent volume:

### Step 1: Copy existing files to volume

```bash
# From the host machine
docker exec bizkos ls -la public/uploads/

# Copy files from container to a temporary location on host
docker cp bizkos:/app/public/uploads ./temp_uploads

# Or copy them to the volume directly (restart container after this)
docker exec bizkos sh -c "cp -r /app/public/uploads/* /tmp/uploads_backup/"
```

### Step 2: Restart with new volume configuration

```bash
# Stop containers
docker-compose down

# Start with new volume config
docker-compose up -d --build

# Copy files back if you backed them up
docker exec bizkos sh -c "cp -r /tmp/uploads_backup/* /app/public/uploads/ || true"
```

### Alternative: Direct Volume Access

```bash
# Find the volume name
docker volume ls | grep uploads

# Access volume directly (advanced)
docker run --rm -v bizkos_uploads:/data -v $(pwd):/host alpine sh -c "cp -r /data/* /host/temp_uploads/"
```

## Simplest Approach (Recommended)

Since your files are already in the container, just:

```bash
# 1. Stop everything
docker-compose down

# 2. The volume will be created automatically on next start
# 3. Start the service
docker-compose up -d --build

# 4. Upload a test file - it will now persist!
```

**Note**: Existing files in the container from before the volume was added will be lost after rebuild. To save them, copy them out first:

```bash
# Copy existing uploads to host machine BEFORE docker-compose down
docker cp bizkos:/app/public/uploads ./backed_up_uploads

# After rebuild, copy them back
docker cp ./backed_up_uploads/. bizkos:/app/public/uploads/
```

## Verification

After rebuilding, verify persistence:

```bash
# 1. Upload a test file via the web interface
# 2. Check it exists
docker exec bizkos ls -la public/uploads/

# 3. Stop and restart
docker-compose down
docker-compose up -d

# 4. File should still be there!
docker exec bizkos ls -la public/uploads/
```

## Volume Management

### View upload volume
```bash
docker volume inspect bizkos_uploads
```

### Backup uploads to host
```bash
docker run --rm -v bizkos_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .
```

### Restore uploads from backup
```bash
docker run --rm -v bizkos_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

### Clean up and start fresh
```bash
docker-compose down -v  # Removes volumes
docker-compose up -d --build
```

## File Access

Uploaded files are accessible at:
- URL: `http://localhost:9002/api/uploads/[filename]`
- Container path: `/app/public/uploads/`
- Volume name: `bizkos_uploads` (or `projectname_uploads`)

## Summary

✅ **Fixed**: Uploads now persist across container rebuilds
✅ **Fixed**: Files stored in named Docker volume
✅ **Fixed**: No more data loss on updates

The next time you rebuild, all your uploaded files will be safe!
