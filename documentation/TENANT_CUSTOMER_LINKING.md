# Tenant-Customer Linking Logic

## Overview

This document explains how tenant accounts are linked with customer data in the Dandelion Kos management system, including the handling of the "No Room Assigned" scenario.

## Database Architecture

### Three-Layer Relationship

```
User (Login Credentials)
  ↓ 1:1
Tenant (Profile)
  ↓ 1:1
Customer (Business Record)
```

### Schema Details

**User Table** (`prisma/schema.prisma:63-83`)
- Stores login credentials (email, password)
- Has `role` field: "ADMIN" or "TENANT"
- One-to-one relationship with `Tenant` via `tenantProfile`

**Tenant Table** (`prisma/schema.prisma:99-111`)
- Links `userId` ↔ `customerId`
- Has `active` status flag
- This is the bridge between authentication and business data

**Customer Table** (`prisma/schema.prisma:13-27`)
- Stores business data: name, phone, NIK, roomNumber
- `roomNumber` field is **nullable** (can be null)
- One-to-one relationship with `Tenant`

## Registration Flow

### Auto-Registration (Recommended)

**Endpoint**: `POST /api/tenant/register-auto`

**File**: `src/app/api/tenant/register-auto/route.ts`

**Flow**:
1. Tenant registers with email, password, NIK, name, phone, optional roomNumber
2. System checks if customer with NIK exists
3. **If customer doesn't exist**: Auto-creates customer record
   - Assigns to first admin user
   - Sets `roomNumber` to provided value or `null` if empty
4. Creates User account with TENANT role
5. Creates Tenant profile linking User ↔ Customer
6. Returns success

**Example Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "nik": "1234567890123456",
  "phone": "08123456789",
  "roomNumber": "101"  // Optional - can be empty
}
```

**Scenario: No Room Assigned**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "nik": "1234567890123457",
  "phone": "08123456789",
  "roomNumber": ""  // Empty = no room assigned
}
```

### Manual Registration (Requires Existing Customer)

**Endpoint**: `POST /api/tenant/register`

**File**: `src/app/api/tenant/register/route.ts`

**Flow**:
1. Tenant registers with email, password, NIK
2. System checks if customer with NIK exists
3. **If customer doesn't exist**: Returns error
   - Message: "NIK not found. Please contact your property owner."
4. Creates User account with TENANT role
5. Creates Tenant profile linking User ↔ Customer
6. Returns success

This flow is used when the property owner has already created customer records in the system.

## Login Flow

### Session Creation

**Endpoint**: `POST /api/auth/login`

**File**: `src/app/api/auth/login/route.ts` (Updated)

**Flow**:
1. User logs in with email/password
2. System fetches User with tenantProfile and customer relations
3. **For TENANT role**:
   - Gets customer through `tenantProfile.customer`
   - Creates session with `customerId` and `tenantId`
4. **For ADMIN role**:
   - Gets first customer from `user.customers` (if any)
   - Creates session with admin data

**Session Data** (`src/lib/session.ts:6-12`):
```typescript
interface SessionData {
  userId: string;
  role: 'ADMIN' | 'TENANT';
  customerId?: string;  // Only for TENANT - may be undefined
  tenantId?: string;    // Only for TENANT
  expires: Date;
}
```

## Dashboard Logic

### No Room Assigned Handling

**File**: `src/app/(tenant)/tenant/dashboard/page.tsx`

The dashboard handles three scenarios:

#### 1. No Tenant Profile (Lines 18-32)
```typescript
if (!session.tenantId) {
  // Show error: "Account Not Configured"
  // This should rarely happen if registration works correctly
}
```

#### 2. No Customer Linked (Lines 35-57)
```typescript
if (!session.customerId) {
  // Show warning: "No Room Assigned"
  // Message: "Your tenant account is set up, but you don't have a room assigned yet."
  // Instructions: "Please contact the property administrator to assign you a room."
}
```

**This is the scenario you're asking about!**

When can this happen?
- Tenant registered without a roomNumber
- Customer record has `roomNumber = null`
- Tenant account exists but customer hasn't been assigned a room yet

#### 3. Normal Operation (Lines 59-159)
```typescript
// Fetch customer data
const customer = await prisma.customer.findUnique({
  where: { id: session.customerId },
  include: { Transaction: {...} }
});

// Display dashboard with:
// - Welcome message
// - Room number (or "Not Assigned")
// - Payment history
// - Quick actions
// - Server apps
```

## Admin Actions to Assign Room

### Option 1: Update Customer Record

Admin can update the customer's roomNumber directly:

```typescript
// Via admin dashboard
await prisma.customer.update({
  where: { id: customerId },
  data: { roomNumber: "101" }
});
```

### Option 2: Create Customer with Room First

Admin creates customer record with roomNumber BEFORE tenant registers:

1. Admin goes to Customers page
2. Creates new customer with roomNumber
3. Gives NIK to tenant
4. Tenant uses manual registration flow with that NIK

## Code Examples

### Creating a Tenant Without Room

```typescript
// Registration API auto-creates customer with null room
const customer = await prisma.customer.create({
  data: {
    name: "Jane Smith",
    phone: "08123456789",
    nik: "1234567890123457",
    roomNumber: null,  // No room assigned
    userId: adminUser.id,
  },
});

const tenant = await prisma.tenant.create({
  data: {
    userId: user.id,
    customerId: customer.id,
    active: true,
  },
});
```

### Checking if Tenant Has Room

```typescript
// In tenant dashboard
const customer = await prisma.customer.findUnique({
  where: { id: session.customerId }
});

if (!customer.roomNumber) {
  // Show "No Room Assigned" message
} else {
  // Show room-specific features
}
```

### Assigning Room to Existing Tenant

```typescript
// Admin action
const customer = await prisma.customer.update({
  where: { id: customerId },
  data: {
    roomNumber: "101",
    entryDate: new Date(),  // Update entry date when room assigned
  },
});

// Tenant will see room on next login/dashboard refresh
```

## UI Display

### Registration Form
**File**: `src/app/(tenant)/tenant/register/register-form.tsx:142-154`

```tsx
<div className="space-y-2">
  <Label htmlFor="roomNumber">Room Number (Optional)</Label>
  <Input
    id="roomNumber"
    name="roomNumber"
    type="text"
    placeholder="101"
    disabled={isLoading}
  />
  <p className="text-xs text-gray-500">
    Leave empty if not assigned yet
  </p>
</div>
```

### Login Page
**File**: `src/app/(site)/login/page.tsx:155-165`

Added link to registration for users without accounts:
```tsx
<div className="mt-6 text-center">
  <p className="text-sm text-zinc-600 dark:text-zinc-400">
    Don't have an account?{' '}
    <Link href="/tenant/register">
      Register here
    </Link>
  </p>
</div>
```

## Summary

### "No Room Assigned" Scenario Flow

1. **Registration**
   - Tenant registers without providing roomNumber
   - System creates customer with `roomNumber = null`
   - Tenant account is created successfully

2. **Login**
   - Tenant logs in normally
   - Session includes `tenantId` and `customerId`
   - System can fetch customer data

3. **Dashboard**
   - System detects `customer.roomNumber` is null
   - Shows friendly "No Room Assigned" message
   - Provides instructions to contact admin
   - Still shows basic account info (Tenant ID, etc.)

4. **Room Assignment**
   - Admin updates customer record with roomNumber
   - Tenant sees room on next dashboard visit
   - Full dashboard features become available

### Key Points

✅ **Tenants CAN register without a room**
- The system handles `roomNumber = null` gracefully
- Dashboard shows appropriate "No Room Assigned" message
- Tenants can still access basic features

✅ **Customer linking happens during registration**
- Auto-registration: Creates customer if needed
- Manual registration: Requires existing customer
- Both methods create the User ↔ Tenant ↔ Customer bridge

✅ **Session management properly handles this**
- Login API fetches customer through tenant profile
- Session stores both `tenantId` and `customerId`
- Dashboard checks for both values

✅ **Admin can assign room later**
- Update customer record with roomNumber
- Tenant sees changes on next refresh
- No need to re-register

## Testing the Flow

### Test Scenario: Tenant Without Room

```bash
# 1. Register tenant without room
curl -X POST http://localhost:3000/api/tenant/register-auto \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tenant",
    "email": "test@example.com",
    "password": "password123",
    "nik": "1234567890123456",
    "phone": "08123456789"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Response should include:
# {
#   "user": {
#     "customerId": "...",  // Will be present
#     "tenantId": "...",    // Will be present
#   }
# }

# 3. Access dashboard - should show "No Room Assigned" message
```

## Troubleshooting

### Issue: Tenant sees "Account Not Configured"
**Cause**: `session.tenantId` is missing
**Solution**: Check registration completed successfully, tenant profile was created

### Issue: Tenant sees "No Room Assigned" but has room
**Cause**: Login API not fetching customer correctly
**Solution**: Update to latest login API code (fetches customer through tenantProfile)

### Issue: Can't register - "NIK not found"
**Cause**: Using manual registration flow without existing customer
**Solution**: Use auto-registration endpoint, or have admin create customer first

### Issue: Registration fails - "No admin account found"
**Cause**: Auto-registration can't find admin to assign customer to
**Solution**: Create at least one admin user first

---

**Last Updated**: 2025-01-17
**Related Files**:
- `src/app/api/tenant/register-auto/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/(tenant)/tenant/dashboard/page.tsx`
- `src/lib/session.ts`
- `prisma/schema.prisma`
