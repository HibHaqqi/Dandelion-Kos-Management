# Production Database Migration Guide

## Issue
After adding the `checkoutDate` column to the Customer model, the production database needs to be updated to match the new schema. Without this update, the dashboard will fail with "Failed to fetch dashboard data" error.

## Solution
You need to apply the Prisma schema changes to your production database.

## Steps to Fix Production Database

### Option 1: Automatic Migration (Recommended)

If you have access to run commands on your production server:

```bash
# Navigate to your project directory on production
cd /path/to/biztrackkos-2

# Pull the latest code
git pull

# Install dependencies if needed
npm install

# Push the schema changes to the production database
npx prisma db push
```

### Option 2: Manual SQL Migration

If you prefer to run SQL directly on your production database:

```sql
-- Add the checkoutDate column to the Customer table
ALTER TABLE "Customer" ADD COLUMN "checkoutDate" TIMESTAMP(3);
```

### Option 3: Using Prisma Migrate (For Production Best Practice)

If you want to use proper migrations:

```bash
# Create a migration (locally or on production)
npx prisma migrate dev --name add_checkout_date

# Then apply to production
npx prisma migrate deploy
```

## Verifying the Fix

After running the migration, verify the column exists:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Customer'
AND column_name = 'checkoutDate';
```

Expected output:
```
column_name   | data_type
--------------+-------------------
checkoutDate  | timestamp(3) without time zone
```

## Testing the Fix

1. Check if the dashboard loads without errors
2. Try accessing the customers page
3. Test the checkout functionality

## Quick Fix Script

If you're in a hurry, here's a complete script to run on your production server:

```bash
#!/bin/bash
# save as fix-production.sh

echo "Starting production database migration..."

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Run Prisma db push
npx prisma db push

echo "Migration completed!"
echo "Verifying..."

# Check if column exists
psql $DATABASE_URL -c "\d \"Customer\"" | grep checkoutDate

if [ $? -eq 0 ]; then
    echo "✅ Success! checkoutDate column added."
else
    echo "❌ Failed! Please check the error above."
fi
```

Make it executable and run:
```bash
chmod +x fix-production.sh
./fix-production.sh
```

## What Was Changed

The migration adds this column to your database:

**Table:** Customer
**Column:** checkoutDate
**Type:** TIMESTAMP(3)
**Nullable:** Yes
**Default:** NULL

This column tracks when a customer checked out of their room.

## Rolling Back (If Needed)

If you need to rollback:

```sql
ALTER TABLE "Customer" DROP COLUMN "checkoutDate";
```

## Common Issues and Solutions

### Issue: "Permission denied"
**Solution:** Make sure your database user has ALTER TABLE permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE kosmanage TO hihaqqi;
```

### Issue: "Column already exists"
**Solution:** The column was already added. You can skip this migration.

### Issue: "Connection refused"
**Solution:** Check your DATABASE_URL in .env file:
```bash
echo $DATABASE_URL
```

## Post-Migration Checklist

- [ ] Migration applied successfully
- [ ] Dashboard loads without errors
- [ ] Customers page displays correctly
- [ ] Checkout functionality works
- [ ] Room status updates correctly
- [ ] No errors in browser console
- [ ] No errors in server logs

## Need Help?

If you encounter issues:
1. Check the server logs: `journalctl -u your-app-name -n 50`
2. Check Prisma logs: `npx prisma studio`
3. Test database connection: `psql $DATABASE_URL`

---

**Created:** 2025-12-27
**Schema Version:** Added checkoutDate to Customer model
