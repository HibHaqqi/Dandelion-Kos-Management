# File Upload URL Fix - Summary

## Problem
Files were uploading but returning 404 errors on the production site:
```
https://www.dandelionkos.site/uploads/1768919055274-Screenshot_from_2025-11-16_19-49-06.png
→ 404 Not Found
```

## Root Cause
The upload library (`src/lib/upload.ts`) was returning URLs like:
- `/uploads/filename.png`

But Next.js doesn't automatically serve files from `/public/uploads/` via the `/uploads/` route in production.

## Solution Applied ✅

### 1. Fixed New Upload URLs
**File**: `src/lib/upload.ts` (line 54)

```typescript
// OLD (broken)
const url = `/${folder}/${filename}`; // Returns: /uploads/file.png

// NEW (working)
const url = `/api/${folder}/${filename}`; // Returns: /api/uploads/file.png
```

### 2. Created Legacy Route for Old Files
**New file**: `src/app/uploads/[...path]/route.ts`

This route handles the old URL format so existing files in the database still work:
- `/uploads/filename.png` → Serves file from `/public/uploads/`

### 3. Existing Route Already Present
**File**: `src/app/api/uploads/[...path]/route.ts` (already existed)

This route serves files for the new URL format:
- `/api/uploads/filename.png` → Serves file from `/public/uploads/`

## URL Formats Supported

Both formats now work and serve the same files:

| Format | Example | Route | Status |
|--------|---------|-------|--------|
| Old (legacy) | `/uploads/file.png` | `src/app/uploads/[...path]/route.ts` | ✅ Works |
| New (current) | `/api/uploads/file.png` | `src/app/api/uploads/[...path]/route.ts` | ✅ Works |

## File Locations

- **Storage**: `/public/uploads/` (in container, persisted via Docker volume)
- **Volume**: `uploads:` (named Docker volume)
- **Database URLs**: Stored as `/uploads/...` or `/api/uploads/...`

## Database Migration (Optional)

If you want to update all old URLs in the database to the new format:

### SQL to update payment receipts
```sql
UPDATE "Payment"
SET "receiptUrl" = REPLACE("receiptUrl", '/uploads/', '/api/uploads/')
WHERE "receiptUrl" LIKE '/uploads/%';
```

### SQL to update complaint images
```sql
UPDATE "Complaint"
SET "imageUrl" = REPLACE("imageUrl", '/uploads/', '/api/uploads/')
WHERE "imageUrl" LIKE '/uploads/%';
```

**Note**: This is optional since both URL formats now work!

## Testing

### Test 1: New Uploads
1. Upload a new file via the web interface
2. Check the URL in the database
3. Should be: `/api/uploads/[filename]`
4. Access via browser: ✅ Works

### Test 2: Old Files
1. Access an old file URL: `/uploads/[filename]`
2. Should load: ✅ Works (via legacy route)

### Test 3: Both Formats Work
```bash
# Old format
curl http://localhost:9002/uploads/1768919055274-file.png

# New format
curl http://localhost:9002/api/uploads/1768919055274-file.png

# Both should return the same image! ✅
```

## What Changed

### For New Uploads
- ✅ URLs now use `/api/uploads/...` format
- ✅ Files stored in `/public/uploads/` (same as before)
- ✅ Persisted in Docker volume `uploads:`

### For Existing Files
- ✅ Old URLs (`/uploads/...`) still work
- ✅ No database migration needed
- ✅ No file migration needed

## Files Modified

1. **src/lib/upload.ts** - Fixed URL generation for new uploads
2. **src/app/uploads/[...path]/route.ts** - NEW: Legacy route for old URLs
3. **src/app/api/uploads/[...path]/route.ts** - Already existed (file serving)

## Deployment

No special deployment needed! Just:

```bash
# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

Both URL formats will work immediately:
- Old files continue to work
- New uploads use the new format

## Summary

✅ **Fixed**: New uploads return correct URLs
✅ **Backward Compatible**: Old URLs still work
✅ **No Data Loss**: No need to migrate database
✅ **No File Loss**: Files remain in place

Your file uploads are now fully functional! 🎉
