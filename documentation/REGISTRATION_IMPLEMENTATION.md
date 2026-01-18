# Tenant Registration System

## Current Implementation

The tenant registration system now uses a **simple, single-mode registration flow**.

### Registration Flow

**Endpoint**: `POST /api/tenant/register-auto`

**File**: `src/app/api/tenant/register-auto/route.ts`

**Form**: `src/app/(tenant)/tenant/register/register-form.tsx`

### How It Works

1. **Tenant fills out registration form**:
   - Full Name (required)
   - Email (required, for login)
   - NIK - 16 digit Indonesian ID (required)
   - Phone Number (optional)
   - Room Number (optional)
   - Password (required, min 6 characters)
   - Confirm Password (required)

2. **System processes registration**:
   - Validates all input
   - Checks if email already exists
   - Checks if NIK already exists in customer table
   - **Auto-creates customer record** if it doesn't exist
   - Creates User account with TENANT role
   - Creates Tenant profile linking User ↔ Customer
   - Returns success

3. **Tenant can log in**:
   - Uses email and password
   - Dashboard shows customer info
   - "No Room Assigned" message if roomNumber is null

## Features

### ✅ Room Number is Optional

Tenants CAN register without knowing their room number:
- Leave roomNumber empty
- Customer record created with `roomNumber = null`
- Dashboard shows friendly "No Room Assigned" message
- Admin can assign room later by updating customer record

### ✅ Auto-Creates Customer Record

No need for admin to create customer first:
- System automatically creates customer record
- Assigns to first admin user
- Links to new tenant account
- Seamless one-step registration

### ✅ Email Field in Customer Table

Admin can add email to customer records:
- Helps with customer identification
- Useful for future features
- Optional field in admin customer form

## Database Schema

```prisma
model Customer {
  id          String        @id @default(cuid())
  name        String
  email       String?       // Optional email field
  phone       String
  nik         String        @unique
  entryDate   DateTime
  roomNumber  String?       // Optional - can be null
  lastPayment DateTime?
  checkoutDate DateTime?
  Tenant      Tenant?
  user        User?         @relation(fields: [userId], references: [id])
  userId      String?
}

model Tenant {
  id          String    @id @default(cuid())
  userId      String    @unique
  customerId  String    @unique
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user        User      @relation(fields: [userId], references: [id])
  customer    Customer  @relation(fields: [customerId], references: [id])
}
```

## API Endpoints

### POST /api/tenant/register-auto

Creates new tenant account with customer record.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "nik": "1234567890123456",
  "phone": "08123456789",
  "roomNumber": "101"  // Optional - can be empty string
}
```

**Response** (201 Created):
```json
{
  "message": "Tenant account created successfully",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "TENANT"
  },
  "tenant": {
    "id": "tenant_456",
    "customerName": "John Doe",
    "customerCreated": true
  }
}
```

### GET /api/customers/search

Search customers by email (available if you want to add customer lookup later).

**Query**: `?email=john@example.com`

**Response**:
```json
{
  "customers": [
    {
      "id": "cust_123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "08123456789",
      "nik": "1234567890123456",
      "roomNumber": "101"
    }
  ]
}
```

## Admin Actions

### Creating Customers with Email

Admin can add customer records via dashboard:
- Go to Customers page
- Click "Add Customer"
- Fill in:
  - Name (required)
  - **Email (optional)** - For identification
  - Phone (required)
  - NIK (required, 16 digits)
  - Entry Date (required)
  - Room Number (optional)
- Save

### Assigning Room to Existing Tenant

If tenant registered without room:

```typescript
// Admin updates customer record
await prisma.customer.update({
  where: { id: customerId },
  data: {
    roomNumber: "101",
    entryDate: new Date(),  // Update if needed
  },
});
```

Tenant will see room on next dashboard refresh.

## "No Room Assigned" Handling

### Registration Without Room

```bash
# Registration request
POST /api/tenant/register-auto
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "nik": "1234567890123457",
  "phone": "08123456789",
  "roomNumber": ""  // Empty = no room
}
```

**System behavior**:
- Creates customer with `roomNumber = null`
- Creates tenant account
- Allows login
- Dashboard shows "No Room Assigned" message

### Dashboard Display

**File**: `src/app/(tenant)/tenant/dashboard/page.tsx:35-57`

```typescript
if (!session.customerId) {
  // Show "No Room Assigned" message
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border rounded-lg p-6">
      <h2>No Room Assigned</h2>
      <p>
        Welcome! Your tenant account is set up, but you don't have a room
        assigned yet. Please contact the property administrator to assign
        you a room.
      </p>
    </div>
  );
}
```

## Login Flow

### POST /api/auth/login

**File**: `src/app/api/auth/login/route.ts`

**Request**:
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_123",
    "email": "jane@example.com",
    "role": "TENANT",
    "customerId": "cust_456",
    "tenantId": "tenant_789"
  }
}
```

**System**:
- Fetches user with tenant profile and customer relations
- Creates session with customerId and tenantId
- Redirects to tenant dashboard

## Migration History

### Email Field Addition

**Migration**: `add_customer_email`

**SQL**:
```sql
ALTER TABLE "Customer" ADD COLUMN "email" TEXT;
```

**Status**: ✅ Completed
**Files Updated**:
- `prisma/schema.prisma` - Added email field
- `src/types/index.ts` - Added email to Customer type
- `src/components/customers/customer-form-dialog.tsx` - Added email input
- `src/app/(dashboard)/customers/actions.ts` - Handle email field

## Removed Features

### Link Existing Record Mode (REMOVED)

Previously, tenants could search and link to existing customer records. This feature has been removed to simplify the registration flow.

**What was removed**:
- Registration mode selection (Create New Account vs Link Existing Record)
- Customer search by email
- Customer selection UI
- Link registration API endpoint

**Why removed**: Per user request to simplify registration

**Still available** (if needed later):
- `/api/customers/search` - Customer search API
- `/api/tenant/register-link` - Link registration API
- Code available in git history if needed

## Testing

### Test Case 1: Register with Room

```bash
curl -X POST http://localhost:3000/api/tenant/register-auto \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tenant",
    "email": "test@example.com",
    "password": "password123",
    "nik": "1111111111111111",
    "phone": "08123456789",
    "roomNumber": "101"
  }'
```

### Test Case 2: Register without Room

```bash
curl -X POST http://localhost:3000/api/tenant/register-auto \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tenant 2",
    "email": "test2@example.com",
    "password": "password123",
    "nik": "2222222222222222",
    "phone": "08123456789",
    "roomNumber": ""
  }'
```

### Test Case 3: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Issue: "Email already registered"

**Cause**: Email already used by another account

**Solution**: Use different email or recover existing account

### Issue: "NIK already has a tenant account"

**Cause**: Customer with this NIK already linked to a tenant

**Solution**:
- Check if tenant already exists
- Contact admin to update existing record

### Issue: Dashboard shows "No Room Assigned"

**Cause**: Customer record has `roomNumber = null`

**Solution**:
- Expected if tenant registered without room
- Admin can assign room later via customer update

### Issue: "No admin account found"

**Cause**: No admin user exists to assign new customer to

**Solution**: Create at least one admin user first

## Files

### Registration
- `src/app/(tenant)/tenant/register/page.tsx` - Registration page
- `src/app/(tenant)/tenant/register/register-form.tsx` - Registration form component
- `src/app/api/tenant/register-auto/route.ts` - Registration API

### Login
- `src/app/(site)/login/page.tsx` - Login page
- `src/app/api/auth/login/route.ts` - Login API

### Dashboard
- `src/app/(tenant)/tenant/dashboard/page.tsx` - Tenant dashboard

### Admin
- `src/components/customers/customer-form-dialog.tsx` - Customer form with email field
- `src/app/(dashboard)/customers/actions.ts` - Customer CRUD operations

### Schema & Types
- `prisma/schema.prisma` - Database schema
- `src/types/index.ts` - TypeScript types
- `src/lib/session.ts` - Session management

## Summary

✅ **Simple one-step registration** - Tenants fill one form
✅ **Auto-creates customer** - No admin setup needed first
✅ **Room number optional** - Can register without knowing room
✅ **"No Room Assigned" handled** - Friendly message in dashboard
✅ **Email field available** - Admin can add emails to customers
✅ **Clean UI** - No mode selection, straightforward flow

---

**Last Updated**: 2025-01-17

**Related Documentation**:
- `TENANT_CUSTOMER_LINKING.md` - Detailed tenant-customer linking guide
- `TENANT_REGISTRATION_BACKUP_PLAN.md` - Previous dual-mode documentation (archived)
