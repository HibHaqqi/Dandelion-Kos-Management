# Complaint Management UI - Complete Guide

## Features Added

### 1. Admin Complaint Management
**Location**: `/admin/complaints`
**Component**: `complaint-card.tsx`

#### Edit Feature (Already Existed)
- ✅ Click "Update Status / Reply" button
- ✅ Change status (Open, In Progress, Resolved, Closed)
- ✅ Add admin response/reply
- ✅ Save changes

#### Delete Feature (NEW)
- ✅ Red "Delete" button next to "Update Status / Reply"
- ✅ Confirmation dialog before deleting
- ✅ Can delete ANY complaint regardless of status
- ✅ Loading state during deletion
- ✅ Success/error toast notifications

**UI Layout**:
```
┌─────────────────────────────────────┐
│ Complaint Details                    │
├─────────────────────────────────────┤
│ [Admin Response Area]                │
│                                      │
│ [Update Status/Reply] [Delete 🗑️]  │
└─────────────────────────────────────┘
```

### 2. Tenant Complaint Management
**Location**: `/tenant/complaints`
**Component**: `complaint-ticket.tsx`

#### Delete Feature (NEW)
- ✅ "Delete Complaint" button (red, destructive variant)
- ✅ Only shown for OPEN status complaints
- ✅ Hidden if complaint is being processed or resolved
- ✅ Confirmation dialog before deleting
- ✅ Error messages if deletion not allowed
- ✅ Loading state during deletion

**UI Layout**:
```
┌─────────────────────────────────────┐
│ My Complaint                         │
│ [Details...]                         │
│                                      │
│ [Delete Complaint 🗑️] (only if OPEN)│
└─────────────────────────────────────┘
```

## User Flows

### Admin Delete Complaint

1. **Navigate to**: Admin → Complaints
2. **Find complaint** you want to delete
3. **Click "Delete"** button (red, with trash icon)
4. **Confirm deletion** in dialog
5. **Complaint deleted** from database
6. **Page refreshes** automatically
7. **Toast notification**: "Complaint deleted - The complaint has been removed"

**Features**:
- Can delete ANY complaint (no restrictions)
- Works for all statuses (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- Full admin privileges

### Tenant Delete Complaint

1. **Navigate to**: Tenant Portal → My Complaints
2. **Find your OPEN complaint**
3. **Click "Delete Complaint"** button (red, at bottom of ticket)
4. **Confirm deletion** in dialog
5. **Complaint deleted** (if allowed)
6. **Page refreshes** automatically
7. **Toast notification**: Success or error

**Restrictions**:
- ❌ Can only delete OWN complaints (verified by customerId)
- ❌ Can only delete OPEN status complaints
- ❌ Cannot delete if status is IN_PROGRESS, RESOLVED, or CLOSED
- ✅ Error message: "Cannot delete complaint that is being processed..."

## Button States

### Admin Delete Button

| State | Appearance | Behavior |
|-------|-----------|----------|
| Normal | Red, "Delete" with trash icon | Clickable |
| Loading | Red, "Deleting..." with spinner | Disabled |
| Error | N/A | Toast notification |

### Tenant Delete Button

| Condition | Appearance |
|-----------|-----------|
| Status = OPEN | Visible, red, full width |
| Status ≠ OPEN | Hidden (not rendered) |
| Loading | "Deleting..." with spinner |
| Success | Page refreshes |
| Error | Toast with error message |

## Error Handling

### Admin Errors
- Unauthorized (not logged in) → 401
- Not admin → 401
- Complaint not found → 404
- Server error → 500 with toast

### Tenant Errors
- Unauthorized (not logged in) → 401
- Not tenant → 401
- Not found → 404
- Not owner → 403 "Unauthorized to delete this complaint"
- Already processed → 400 "Cannot delete complaint being processed..."
- Server error → 500 with toast

## Code Changes

### Files Modified

1. **`src/app/api/admin/complaints/[id]/route.ts`**
   - Added DELETE method
   - Admin can delete any complaint
   - Added revalidation

2. **`src/app/api/tenant/complaints/[id]/route.ts`** (NEW)
   - Created DELETE endpoint
   - Tenant can delete own OPEN complaints
   - Validation and error handling

3. **`src/app/(dashboard)/admin/complaints/complaint-card.tsx`**
   - Added delete button
   - Confirmation dialog
   - Loading states
   - Error handling

4. **`src/app/(tenant)/tenant/complaints/complaint-ticket.tsx`**
   - Added delete button (conditional)
   - Only for OPEN status
   - Confirmation dialog
   - Error handling

## Testing Checklist

### Admin Complaints
- [ ] Can delete OPEN complaint
- [ ] Can delete IN_PROGRESS complaint
- [ ] Can delete RESOLVED complaint
- [ ] Can delete CLOSED complaint
- [ ] Confirmation dialog appears
- [ ] Toast notification on success
- [ ] Page refreshes after deletion
- [ ] Button disabled during deletion

### Tenant Complaints
- [ ] Delete button visible for OPEN complaints
- [ ] Delete button HIDDEN for other statuses
- [ ] Can delete own OPEN complaint
- [ ] Cannot delete other tenants' complaints
- [ ] Cannot delete processed complaints
- [ ] Proper error messages
- [ ] Confirmation dialog appears
- [ ] Toast notifications work

## API Endpoints

### Admin
```http
DELETE /api/admin/complaints/[id]
- Auth: Required (Admin)
- Can delete: Any complaint
- Returns: Success message
```

### Tenant
```http
DELETE /api/tenant/complaints/[id]
- Auth: Required (Tenant)
- Can delete: Only own OPEN complaints
- Returns: Success message or error
```

## Comparison with Payment Deletion

| Feature | Payments | Complaints |
|---------|----------|------------|
| **Admin Delete** | ❌ No (only verify/reject) | ✅ Yes (any complaint) |
| **Tenant Delete** | ✅ Yes (pending only) | ✅ Yes (OPEN only) |
| **Confirmation** | ✅ Yes | ✅ Yes |
| **Loading State** | ✅ Yes | ✅ Yes |
| **Restrictions** | Status-based | Status + ownership |

## Summary

✅ **Admin**: Full delete access to all complaints
✅ **Tenant**: Limited delete (own OPEN complaints only)
✅ **UI**: Delete buttons added to both interfaces
✅ **UX**: Confirmation dialogs, loading states, toast notifications
✅ **Security**: Role and ownership validation
✅ **Restrictions**: Tenant cannot delete processed complaints

Both admin and tenant can now manage complaints with appropriate restrictions!
