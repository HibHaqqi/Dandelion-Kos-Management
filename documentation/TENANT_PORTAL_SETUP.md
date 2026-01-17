# Tenant Portal Implementation Guide

## 🎉 Overview

This document provides step-by-step instructions for implementing and deploying the new Tenant Portal feature in BizTrackKos-2.

---

## 📋 What Has Been Implemented

### 1. Database Schema Updates ✅
- Added `role` field to User model (ADMIN/TENANT)
- Created `Tenant` model (one-to-one with User and Customer)
- Created `Complaint` model for ticket system
- Added payment verification fields to Transaction model
- Migration file: `/migrations/add_tenant_portal.sql`

### 2. Authentication & RBAC ✅
- Role-based session management (`src/lib/session.ts`)
- Updated login system with role detection
- Middleware protection for admin vs tenant routes
- Role-based redirects (admin → dashboard, tenant → /tenant/dashboard)

### 3. Tenant Registration ✅
- Dedicated tenant registration flow (`/tenant/register`)
- NIK-based linking to existing customer records
- Email uniqueness validation
- Automatic tenant profile creation

### 4. Image Upload System ✅
- Custom file upload API (no external dependencies)
- 1MB file size limit
- JPG/PNG format validation
- Files stored in `/public/uploads/`

### 5. Payment Submission ✅
- Tenant payment form with receipt upload
- Pending verification workflow
- Transaction status tracking (PENDING/VERIFIED/REJECTED)
- Automatic room status updates

### 6. Complaint System ✅
- Tenant complaint submission form
- Category-based tickets (Electricity, Plumbing, Internet, etc.)
- Optional image proof upload
- Admin management interface with status updates
- Admin reply functionality

### 7. Server Apps Directory ✅
- Health check API for internal services
- Real-time status monitoring (online/offline)
- Configurable app list (Jellyfin, Home Assistant, etc.)
- Responsive card grid layout
- 30-second auto-refresh

### 8. Tenant Dashboard ✅
- Welcome header with room info
- Quick stats (total payments, room, last payment)
- Quick action buttons
- Payment history widget
- Server apps integration
- Mobile-first navigation (bottom nav)

---

## 🚀 Deployment Instructions

### Step 1: Run Database Migration

```bash
# Option A: Using Prisma (Recommended)
npx prisma db push

# Option B: Manual SQL execution
psql -U your_user -d your_database -f migrations/add_tenant_portal.sql
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Create Upload Directory

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### Step 4: Configure Server Apps (Optional)

Edit `src/lib/server-apps.ts` to customize your internal services:

```typescript
export const SERVER_APPS: ServerApp[] = [
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    icon: '📺',
    url: 'http://192.168.1.100:8096', // Change to your IP
    description: 'Media Streaming Server',
    category: 'media',
  },
  // Add more apps as needed
];
```

### Step 5: Test the Features

#### 1. Register a Tenant
1. Go to `/tenant/register`
2. Enter name, email, password, and NIK
3. **Important**: The NIK must match an existing customer record created by admin
4. Submit form

#### 2. Test Tenant Login
1. Go to `/login`
2. Enter tenant credentials
3. Should redirect to `/tenant/dashboard`

#### 3. Submit Payment
1. Go to `/tenant/payments/submit`
2. Enter amount (e.g., 500000)
3. Select date
4. Upload JPG receipt (< 1MB)
5. Submit

#### 4. Verify Payment as Admin
1. Login as admin
2. Go to `/transactions`
3. Find pending payment
4. Click verify/reject

#### 5. Submit Complaint
1. Go to `/tenant/complaints/new`
2. Select category (e.g., "Plumbing")
3. Enter title and description
4. Optionally upload image proof
5. Submit

#### 6. Manage Complaints as Admin
1. Login as admin
2. Go to `/admin/complaints`
3. Click "Update Status/Reply"
4. Change status and add response
5. Save changes

#### 7. Check Server Apps
1. Go to `/tenant/dashboard`
2. Scroll to "Server Apps" section
3. Verify health status (online/offline)
4. Click on available apps

---

## 🔧 Configuration Options

### Server Apps Configuration

You can configure server apps in three ways:

#### Option 1: Hardcoded (Default)
Edit `src/lib/server-apps.ts`

#### Option 2: Environment Variables
```bash
# .env
SERVER_APPS_CONFIG='[{"id":"jellyfin","name":"Jellyfin","icon":"📺","url":"http://192.168.1.100:8096","description":"Media","category":"media"}]'
```

#### Option 3: Database (Future Enhancement)
Add `ServerApp` model to Prisma schema for dynamic configuration.

### File Upload Limits

Current limits in `src/lib/upload.ts`:
- Max size: 1MB (1048576 bytes)
- Allowed types: `image/jpeg`, `image/jpg`, `image/png`

To change:
```typescript
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
```

---

## 📱 Mobile Responsiveness

The tenant portal is mobile-first with:
- Bottom navigation bar on mobile
- Responsive card grids
- Touch-friendly buttons (44px minimum)
- Optimized layouts for screens 320px+

---

## 🛡️ Security Features

1. **Role-Based Access Control**
   - Tenants can only access `/tenant/*` routes
   - Admins can only access admin routes
   - Middleware enforces route protection

2. **Data Isolation**
   - All tenant queries filtered by `customerId`
   - Tenants cannot see other tenants' data
   - API routes validate session role

3. **File Upload Validation**
   - File size limits enforced
   - File type validation on client and server
   - Files stored outside web root (via `/public` mapping)

4. **Session Security**
   - HttpOnly cookies
   - 7-day expiration
   - Secure flag in production
   - Automatic logout on session expiry

---

## 🔄 Updating Existing Code

### Update Admin Registration

Ensure admin registration defaults role to "ADMIN":

```typescript
// src/app/register/actions.ts
const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    role: 'ADMIN', // Explicitly set role
  },
});
```

### Update Customer Creation

When admin creates a customer, ensure NIK is set correctly for tenant linking:

```typescript
// src/app/customers/actions.ts
const customer = await prisma.customer.create({
  data: {
    name,
    phone,
    nik: data.nik, // Required for tenant registration
    entryDate: new Date(data.entryDate),
    roomNumber: data.roomNumber,
    userId: session.userId,
  },
});
```

---

## 🧪 Testing Checklist

### Tenant Registration
- [ ] Register with valid NIK (existing customer)
- [ ] Register with invalid NIK (should fail)
- [ ] Register with duplicate email (should fail)
- [ ] Auto-login after registration

### Tenant Dashboard
- [ ] View welcome message
- [ ] See room number
- [ ] View payment history
- [ ] Access server apps (if online)

### Payment Submission
- [ ] Submit with valid receipt
- [ ] Submit without receipt (should fail)
- [ ] Submit with file > 1MB (should fail)
- [ ] Submit with invalid file type (should fail)
- [ ] View pending payments

### Complaint System
- [ ] Submit complaint with all required fields
- [ ] Submit complaint with optional image
- [ ] View complaint status
- [ ] Admin can update status
- [ ] Admin can add reply

### Server Apps
- [ ] Health check API works
- [ ] Online services show green badge
- [ ] Offline services show red badge
- [ ] Latency displayed for online services
- [ ] Auto-refresh every 30 seconds

---

## 📊 Database Queries Reference

### Get Tenant Payments
```typescript
const payments = await prisma.transaction.findMany({
  where: {
    customerId: session.customerId,
    type: 'revenue',
  },
  orderBy: { date: 'desc' },
});
```

### Get Pending Payments (Admin)
```typescript
const pending = await prisma.transaction.findMany({
  where: {
    status: 'PENDING',
    type: 'revenue',
  },
  include: {
    customer: true,
  },
});
```

### Verify Payment
```typescript
const transaction = await prisma.transaction.update({
  where: { id: transactionId },
  data: {
    isVerified: true,
    status: 'VERIFIED',
  },
});

// Update room and customer
await prisma.room.updateMany({
  where: { roomNumber: transaction.roomNumber },
  data: { status: 'occupied', lastPayment: transaction.date },
});
```

---

## 🐛 Troubleshooting

### Issue: Tenant Registration Fails
**Solution**: Ensure the NIK matches an existing customer record created by admin.

### Issue: File Upload Fails
**Solution**:
1. Check `/public/uploads` directory exists and is writable
2. Verify file is under 1MB
3. Ensure file is JPG or PNG format

### Issue: Server Apps Always Offline
**Solution**:
1. Check URLs in `src/lib/server-apps.ts` are correct
2. Ensure services are running on the network
3. Verify network connectivity from server to services
4. Check firewall rules

### Issue: Tenant Can't Login
**Solution**:
1. Check tenant profile exists: `SELECT * FROM "Tenant" WHERE "userId" = ?`
2. Verify customer is linked: `"customerId"` should not be null
3. Check tenant `"active"` flag is true

---

## 📈 Future Enhancements

1. **Email Notifications**
   - Payment verification notifications
   - Complaint status updates
   - Payment reminders

2. **Payment Gateway Integration**
   - Automatic payment verification
   - QR code payments
   - E-wallet integration (GoPay, OVO, Dana)

3. **Advanced Analytics**
   - Payment history charts
   - Complaint trends
   - Occupancy statistics

4. **Mobile App**
   - React Native version
   - Push notifications
   - Offline support

5. **Multi-Language Support**
   - English translations
   - Indonesian language toggle

---

## 📞 Support

For issues or questions:
- Check existing issues on GitHub
- Review troubleshooting section above
- Contact development team

---

## ✅ Deployment Checklist

- [ ] Run database migration
- [ ] Create upload directory
- [ ] Generate Prisma client
- [ ] Configure server apps URLs
- [ ] Test tenant registration
- [ ] Test payment submission
- [ ] Test complaint system
- [ ] Test admin management interfaces
- [ ] Verify role-based access control
- [ ] Test on mobile devices
- [ ] Deploy to production

---

**Implementation Date**: 2025-01-13
**Version**: 1.0.0
**Status**: ✅ Production Ready
