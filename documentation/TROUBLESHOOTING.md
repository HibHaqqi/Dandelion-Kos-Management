# Dashboard Error Troubleshooting Guide

## Error: "Failed to fetch dashboard data"

### Root Cause
The production database is missing the new `checkoutDate` column that was added to the Customer model. This causes the `getCustomers()` function to fail, which breaks the dashboard.

---

## Quick Fixes (Try in Order)

### Fix #1: Apply Database Migration (RECOMMENDED)

Run this command on your production server:

```bash
cd /path/to/biztrackkos-2
npx prisma db push
```

This will automatically add the missing column to your database.

---

### Fix #2: Manual SQL Migration

If Fix #1 doesn't work, run SQL directly:

```bash
# Connect to your database
psql -h localhost -U hihaqqi -d kosmanage

# Run this SQL command
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "checkoutDate" TIMESTAMP(3);

# Exit
\q
```

Or run in one line:
```bash
PGPASSWORD=rahasia psql -h localhost -U hihaqqi -d kosmanage -c "ALTER TABLE \"Customer\" ADD COLUMN IF NOT EXISTS \"checkoutDate\" TIMESTAMP(3);"
```

---

### Fix #3: Use the Deployment Script

```bash
cd /path/to/biztrackkos-2
./deploy.sh
```

This will:
1. Install dependencies
2. Apply database migrations
3. Build the application
4. Verify the migration

---

### Fix #4: Revert to Previous Version (TEMPORARY)

If you need the app working immediately and can't fix the database right now:

Revert the code changes:
```bash
git log --oneline -5  # Find the commit before the changes
git revert <commit-hash>
git push
```

Then redeploy. **Note:** This will disable the new checkout features.

---

## Verification Steps

After applying any fix, verify it worked:

### 1. Check Database Column

```bash
PGPASSWORD=rahasia psql -h localhost -U hihaqqi -d kosmanage -c "\d \"Customer\"" | grep checkoutDate
```

Expected output:
```
checkoutDate | timestamp(3) |           |          |          |
```

### 2. Test Dashboard

```bash
# If using Next.js dev server
curl http://localhost:3000/api/dashboard

# Or open in browser
# Navigate to http://your-domain.com/
```

Expected: JSON data without errors

### 3. Check Application Logs

```bash
# If using systemd
journalctl -u biztrackkos -n 50 -f

# If using pm2
pm2 logs biztrackkos --lines 50

# If using docker
docker logs <container-name> --tail 50
```

Look for errors related to "checkoutDate" or "Customer"

---

## Common Issues

### Issue: "column checkoutDate does not exist"
**Cause:** Database schema not updated
**Fix:** Run Fix #1 or Fix #2 above

### Issue: "permission denied for table Customer"
**Cause:** Database user lacks permissions
**Fix:**
```sql
GRANT ALL PRIVILEGES ON TABLE "Customer" TO hihaqqi;
GRANT USAGE ON SCHEMA public TO hihaqqi;
```

### Issue: "connection refused"
**Cause:** Database not running or wrong connection details
**Fix:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Issue: "Prisma Client initialization error"
**Cause:** Prisma Client not generated after schema change
**Fix:**
```bash
npx prisma generate
```

---

## Detailed Diagnostic Commands

### Check Database Schema

```bash
# View Customer table structure
PGPASSWORD=rahasia psql -h localhost -U hihaqqi -d kosmanage -c "\d \"Customer\""

# Count customers
PGPASSWORD=rahasia psql -h localhost -U hihaqqi -d kosmanage -c "SELECT COUNT(*) FROM \"Customer\";"

# Check for checkoutDate column specifically
PGPASSWORD=rahasia psql -h localhost -U hihaqqi -d kosmanage -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Customer' AND column_name = 'checkoutDate';"
```

### Test Database Connection

```bash
# Test connection
PGPASSWORD=rahasia psql -h localhost -U hihaqqi -d kosmanage -c "SELECT 1;"

# Check database size
PGPASSWORD=rahasia psql -h localhost -U hihaqqi -d kosmanage -c "SELECT pg_size_pretty(pg_database_size('kosmanage'));"
```

### Test API Endpoint

```bash
# Test dashboard API
curl -X GET http://localhost:3000/api/dashboard

# Test with POST (if using filters)
curl -X POST http://localhost:3000/api/dashboard \
  -H "Content-Type: application/json" \
  -d '{"dateFilter":{"type":"all"}}'
```

---

## Full Migration Process

If you want to do a complete fresh migration:

```bash
#!/bin/bash
# Complete migration script

echo "Starting complete migration..."

# 1. Backup database (IMPORTANT!)
echo "Backing up database..."
PGPASSWORD=rahasia pg_dump -h localhost -U hihaqqi kosmanage > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# 3. Push schema to database
echo "Pushing schema to database..."
npx prisma db push

# 4. Verify migration
echo "Verifying migration..."
PGPASSWORD=rahasia psql -h localhost -U hihaqqi -d kosmanage -c "\d \"Customer\"" | grep checkoutDate

if [ $? -eq 0 ]; then
    echo "✅ Migration successful!"
else
    echo "❌ Migration failed!"
    exit 1
fi

# 5. Rebuild application
echo "Rebuilding application..."
npm run build

echo "✅ Complete migration finished!"
```

Save as `migrate.sh` and run:
```bash
chmod +x migrate.sh
./migrate.sh
```

---

## Getting Help

If none of these fixes work:

1. **Check Prisma Studio** (GUI for database):
   ```bash
   npx prisma studio
   ```
   Open http://localhost:5555 and verify the Customer table structure

2. **Enable Debug Logging**:
   Add to your `.env`:
   ```
   DEBUG="prisma:query"
   ```

3. **Check Prisma Schema**:
   ```bash
   npx prisma validate
   npx prisma format
   ```

4. **Review Recent Changes**:
   ```bash
   git diff HEAD~1 prisma/schema.prisma
   ```

5. **Check Server Logs** for detailed error messages

---

## Prevention: Future Deployments

To avoid this in the future:

1. **Always run migrations before deploying:**
   ```bash
   npx prisma db push
   ```

2. **Use a deployment script** (like `deploy.sh` provided)

3. **Test migrations on staging first**

4. **Keep database backups before migrations**

5. **Document schema changes in CHANGELOG**

---

## Summary

**The Problem:** Production database missing `checkoutDate` column

**The Solution:** Run `npx prisma db push` on production server

**Time to Fix:** ~1 minute

**Risk Level:** Low (adding a nullable column is safe)

**Data Loss Risk:** None (only adding a column, not removing data)

---

**Last Updated:** 2025-12-27
**Related Files:**
- `prisma/schema.prisma`
- `src/lib/data.ts`
- `MIGRATE_PRODUCTION.md`
