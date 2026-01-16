# Building & Room Information Feature

## 🎉 Overview

Comprehensive information management system for displaying building-wide and room-specific information to both admins and tenants.

---

## 📋 What Has Been Implemented

### 1. Database Schema ✅

#### **BuildingInfo Model** (Shared by all tenants)
```prisma
model BuildingInfo {
  id          String    @id @default(cuid())
  key         String    @unique  // e.g., "wifi_password", "gate_code"
  value       String    // The actual information
  category    String    // "general" | "security" | "contact"
  description String?
  isActive    Boolean   @default(true)
  updatedAt   DateTime  @updatedAt
  updatedBy   String?   // User ID
}
```

#### **RoomInfo Model** (Private to each room)
```prisma
model RoomInfo {
  id          String    @id @default(cuid())
  roomNumber  String    // Links to room
  key         String    // e.g., "electricity_token", "server_password"
  value       String    // The actual information
  category    String    // "access" | "utilities" | "server" | "general"
  description String?
  updatedAt   DateTime  @updatedAt
  updatedBy   String?   // User ID

  @@unique([roomNumber, key])
}
```

### 2. API Endpoints ✅

#### **Admin Endpoints**
- `GET /api/admin/building-info` - Fetch all building information
- `POST /api/admin/building-info` - Create/update building info
- `DELETE /api/admin/building-info?key={key}` - Delete building info
- `GET /api/admin/room-info?roomNumber={room}` - Fetch room information
- `POST /api/admin/room-info` - Create/update room info
- `DELETE /api/admin/room-info?roomNumber={room}&key={key}` - Delete room info

#### **Tenant Endpoints**
- `GET /api/tenant/info` - Fetch all info for logged-in tenant
  - Returns building info (active items only)
  - Returns room-specific info for tenant's room
  - Includes room number and entry date

### 3. Components ✅

#### **InfoCard** (`/components/info/info-card.tsx`)
- Reusable card component for displaying information
- Category-based color coding
- Copy-to-clipboard functionality
- Sensitive information toggle (show/hide)
- Responsive design

#### **TenantInfoDisplay** (`/components/tenant/tenant-info-display.tsx`)
- Fetches and displays tenant's information
- Groups info by category:
  - 📶 Building Information (WiFi, general)
  - 🛡️ Security & Access (gate codes, passwords)
  - 📞 Emergency Contacts
  - 🔑 Room Access (room-specific access)
  - ⚡ Utilities (electricity tokens)
  - 🖥️ Server Access (server passwords)
- Displays room number and entry date

#### **InfoManagement** (`/components/admin/info-management.tsx`)
- Admin interface for managing all information
- Tab-based navigation (Building vs Room)
- Add/Edit/Delete functionality
- Real-time updates
- Form validation

### 4. Pages ✅

#### **Tenant Dashboard** (`/tenant/dashboard`)
- Added `TenantInfoDisplay` component
- Shows building and room-specific information
- Organized by category with icons

#### **Admin Info Page** (`/admin/info`)
- New page for managing information
- Full CRUD operations
- User-friendly interface

---

## 🚀 Deployment Instructions

### Step 1: Run Database Migration

```bash
# Using Prisma (Recommended)
npx prisma db push

# OR manually
psql -U your_user -d your_database -f migrations/add_building_and_room_info.sql
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Access the Feature

#### **For Admin:**
1. Go to `/admin/info`
2. Add building information (WiFi password, gate code, etc.)
3. Add room-specific information (electricity tokens, server passwords)
4. Edit or delete existing information

#### **For Tenants:**
1. Go to `/tenant/dashboard`
2. Scroll to "Building & Room Information" section
3. View all relevant information for their room
4. Click "Show" button to reveal sensitive info
5. Click copy button to copy values to clipboard

---

## 📊 Default Data

The migration includes default building information:
- `wifi_ssid`: BizTrackKos-Guest
- `wifi_password`: kos123456
- `gate_code`: 1234#
- `emergency_contact`: 08123456789
- `admin_phone`: 08198765432
- `checkout_time`: 12:00

---

## 🎨 Categories & Icons

### Building Information Categories
- `general` 📶 - WiFi, checkout times, etc.
- `security` 🛡️ - Gate codes, security codes
- `contact` 📞 - Emergency contacts, admin phone

### Room Information Categories
- `access` 🔑 - Room keys, door codes
- `utilities` ⚡ - Electricity tokens, water info
- `server` 🖥️ - Server access passwords
- `general` 📋 - General room information

---

## 🔒 Security Features

1. **Role-Based Access Control**
   - Admins: Full CRUD access
   - Tenants: Read-only access to their room's info + active building info

2. **Sensitive Information Protection**
   - Sensitive fields are blurred by default
   - "Show/Hide" toggle for sensitive data
   - Only tenant's room info is visible

3. **Audit Trail**
   - `updatedBy` field tracks who last modified each piece of information
   - `updatedAt` timestamp for tracking changes

---

## 📱 Usage Examples

### Admin Adding WiFi Password

1. Go to `/admin/info`
2. Click "Add Building Information"
3. Fill form:
   - Key: `wifi_password`
   - Value: `MySecurePassword123`
   - Category: `general`
   - Description: "Building WiFi password"
4. Click "Add Information"

### Admin Adding Room Electricity Token

1. Go to `/admin/info`
2. Switch to "Room Information" tab
3. Click "Add Room Information"
4. Fill form:
   - Room Number: `A101`
   - Key: `electricity_token`
   - Value: `1234-5678-9012-3456`
   - Category: `utilities`
   - Description: "Prepaid electricity token for room A101"
5. Click "Add Information"

### Tenant Viewing Information

1. Login as tenant
2. Go to `/tenant/dashboard`
3. Scroll to "Building & Room Information" section
4. See:
   - WiFi password (click "Show" to reveal)
   - Gate code (click "Show" to reveal)
   - Electricity token for their room
   - Server passwords
   - Emergency contacts
5. Click copy button to copy any value

---

## 🧪 Testing Checklist

### Admin Features
- [ ] Access `/admin/info` as admin
- [ ] Add new building information
- [ ] Add new room information
- [ ] Edit existing information
- [ ] Delete information
- [ ] Toggle active/inactive status
- [ ] View all information

### Tenant Features
- [ ] Access `/tenant/dashboard` as tenant
- [ ] View building information
- [ ] View room-specific information
- [ ] Click "Show" to reveal sensitive info
- [ ] Click copy button to copy values
- [ ] Cannot see other rooms' information

### Security
- [ ] Tenant cannot access `/admin/info`
- [ ] Tenant cannot access room info for other rooms
- [ ] Sensitive info is hidden by default
- [ ] Audit trail is maintained

---

## 📈 Future Enhancements

1. **History Tracking**
   - Track all changes to information
   - View change history

2. **Bulk Import/Export**
   - CSV import for room info
   - Export information for backup

3. **Notifications**
   - Notify tenants when information is updated
   - Email notifications for critical changes

4. **QR Codes**
   - Generate QR codes for room access
   - Scan QR to get room information

5. **Multi-Language Support**
   - Support Indonesian language
   - Toggle between EN/ID

---

## 📞 Support

For issues or questions:
- Check database migration was applied
- Verify Prisma client was generated
- Check console for API errors
- Review role-based access control

---

**Implementation Date**: 2025-01-16
**Version**: 1.0.0
**Status**: ✅ Production Ready
