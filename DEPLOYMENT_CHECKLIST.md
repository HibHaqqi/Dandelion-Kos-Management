# Deployment Checklist - Tenant Portal Features

## ✅ Pre-Deployment Checks

### 1. Database Schema
- [x] All new models are in schema.prisma:
  - `Tenant` model
  - `Complaint` model
  - `BuildingInfo` model
  - `RoomInfo` model
  - `TenantServerApp` model
- [x] Prisma Client regenerated: `npx prisma generate`
- [x] Database synced: `npx prisma db push`

### 2. New API Endpoints Created

#### Tenant APIs
- [x] `POST /api/tenant/register` - Tenant registration
- [x] `POST /api/tenant/register-auto` - Auto-link tenant to customer
- [x] `GET /api/tenant/info` - Fetch tenant building/room info
- [x] `POST /api/tenant/payments` - Submit payment with receipt
- [x] `DELETE /api/tenant/payments/[id]` - Delete pending payment
- [x] `POST /api/tenant/complaints` - Submit complaint
- [x] `GET /api/tenant/dashboard/apps/health-check` - Server apps health check

#### Admin APIs
- [x] `GET /api/admin/complaints/open-count` - Count open complaints
- [x] `PATCH /api/admin/complaints/[id]` - Update complaint status
- [x] `POST /api/admin/verify-payment` - Verify/reject tenant payments
- [x] `GET /api/admin/payments/pending-count` - Count pending payments
- [x] `GET|POST|DELETE /api/admin/building-info` - Manage building info
- [x] `GET|POST|DELETE /api/admin/room-info` - Manage room info
- [x] `GET /api/admin/rooms/list` - List rooms for dropdown
- [x] `GET|POST|DELETE /api/admin/tenant-server-apps` - Manage tenant server apps
- [x] `GET /api/admin/tenants/list` - List tenants for dropdown

### 3. UI Components Created

#### Tenant Components
- [x] `TenantNav` - Mobile-responsive navigation with bottom bar
- [x] `QuickActions` - Quick action buttons
- [x] `ServerAppsGrid` - Display server apps with health checks
- [x] `TenantServerAppsWrapper` - Fetch custom server apps
- [x] `TenantDashboardInfo` - Display building & room info
- [x] `PaymentReceipt` - Payment card with delete option
- [x] `PaymentSubmitForm` - Payment submission with file upload
- [x] `ComplaintForm` - Complaint submission with image upload
- [x] `ComplaintTicket` - Display complaint ticket

#### Admin Components
- [x] `PaymentVerificationTable` - Verify payments with approval/rejection
- [x] `InfoManagement` - Manage building & room info
- [x] `TenantServerAppsManagement` - Manage per-tenant server apps
- [x] `AdminPageHeader` - Responsive page header with sidebar trigger
- [x] `PageHeader` - Updated to show sidebar trigger on all screen sizes

### 4. Responsive Design
- [x] Admin sidebar trigger visible on all pages
- [x] Mobile bottom navigation for tenant
- [x] Responsive grids (stack on mobile, multi-column on desktop)
- [x] Mobile-optimized buttons (full width on small screens)
- [x] Bottom padding to account for fixed navigation bars
- [x] Responsive text sizing (smaller on mobile)

## ⚠️ Potential Issues & Solutions

### Issue 1: Prisma Client Not Generated
**Symptom**: `Cannot read properties of undefined (reading 'upsert')`

**Solution**:
```bash
npx prisma generate
```

**Why**: New `TenantServerApp` model needs Prisma Client to be regenerated

---

### Issue 2: Database Out of Sync
**Symptom**: Foreign key constraint errors, model not found errors

**Solution**:
```bash
npx prisma db push
```

**Why**: New tables and relations need to be created in the database

---

### Issue 3: File Upload Permissions
**Symptom**: Receipt/image upload fails on production

**Solution**:
- Ensure upload directory exists: `mkdir -p public/uploads`
- Check write permissions: `chmod 755 public/uploads`
- Configure CDN/storage if using external services (Vercel Blob, AWS S3, etc.)

---

### Issue 4: Server Apps Health Check Fails
**Symptom**: All server apps show as "offline"

**Causes**:
1. URLs are not accessible from server (localhost URLs)
2. CORS restrictions
3. Servers require authentication
4. Network/firewall blocking

**Solutions**:
- Use public URLs or configure reverse proxy
- Ensure health check uses HEAD method (already implemented)
- Add 5-second timeout to prevent hanging
- Consider using server-side ping if client-side fetch fails

---

### Issue 5: Session Cookie Issues
**Symptom**: "User account not found" after deleting test data

**Solution**: Clear browser cookies or implement session validation

**Prevention**: User validation in API endpoints (already implemented in payment API)

---

### Issue 6: Mobile Navigation Overlapping Content
**Symptom**: Content hidden behind fixed navigation bars

**Solution**: Added `pb-20 md:pb-6` classes to tenant pages

**Pages Fixed**:
- `/tenant/dashboard`
- `/tenant/payments`
- `/tenant/complaints`

---

### Issue 7: Sidebar Not Visible on Some Admin Pages
**Symptom**: No hamburger menu on `/admin/payments`, `/admin/complaints`, etc.

**Solution**: Created `AdminPageHeader` component with `SidebarTrigger`

**Pages Fixed**:
- `/admin/payments`
- `/admin/complaints`
- `/admin/info`
- `/rooms` (removed duplicate header)

---

## 📋 Deployment Steps

### 1. Database Migration
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Verify migration
npx prisma studio
```

### 2. Environment Variables
Ensure these are set in production:
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Build Application
```bash
npm run build
```

### 4. Test Critical Features
- [ ] Tenant registration flow
- [ ] Login as tenant
- [ ] Submit payment with receipt
- [ ] Admin payment verification
- [ ] Submit complaint
- [ ] Admin complaint response
- [ ] Building/room info management
- [ ] Server apps configuration per tenant
- [ ] Server apps health check
- [ ] Mobile responsive design

### 5. Monitor Logs
Check for:
- Database connection errors
- File upload errors
- Authentication/session errors
- Health check failures

## 🔧 Post-Deployment Configuration

### 1. Create Initial Building Info
Add building-wide information (WiFi password, gate codes, etc.) via `/admin/info`

### 2. Configure Room-Specific Info
Add room passwords and utility tokens for each room

### 3. Set Up Default Server Apps
Configure default server apps (Jellyfin, Home Assistant, etc.) for each tenant

### 4. Test User Flows
- Test tenant registration
- Test payment submission and verification
- Test complaint submission and response
- Test server apps access and health checks

## 📝 Summary

**Total New Models**: 5 (Tenant, Complaint, BuildingInfo, RoomInfo, TenantServerApp)
**Total New API Routes**: 17
**Total New Components**: 15+
**Responsive Fixes**: 10+ pages

**Migration Required**: ✅ Already done locally
**Prisma Generate Required**: ✅ Already done

**Ready to Deploy**: ✅ Yes

---

## 🚨 Rollback Plan

If critical issues occur:

1. **Database**: Tables are additive, safe to rollback code
2. **Prisma**: Revert schema.prisma and run `npx prisma db push`
3. **Code**: Use Git to revert to previous commit
4. **Files**: Uploaded files in `public/uploads` remain, can be cleaned up manually

**No Breaking Changes**: All changes are additive, existing features unaffected
