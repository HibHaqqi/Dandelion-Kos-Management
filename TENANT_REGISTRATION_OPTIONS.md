# Tenant Registration Options

## 🎯 **What Changed**

The tenant registration system now supports **TWO modes**:

---

## ✅ **Option 1: Auto-Registration (NEW - Default)**

**Route**: `/api/tenant/register-auto`

**Flow**:
```
1. Tenant fills registration form
   • Name, Email, Password
   • NIK (16 digits)
   • Phone (optional)
   • Room Number (optional)

2. System checks if customer exists with NIK
   → If EXISTS: Link to existing customer
   → If NOT EXISTS: Auto-create new customer

3. Create tenant account
   • User account with TENANT role
   • Tenant profile linked to customer
```

**Pros**:
- ✅ Fully self-service
- ✅ No admin intervention needed
- ✅ Auto-creates customer records
- ✅ Works immediately out of the box

**Cons**:
- ⚠️ Anyone can register (you may want to add email verification later)
- ⚠️ No admin approval process

**Use Case**: Best for testing, development, or production if you want self-service

---

## 🔒 **Option 2: Admin-Pre-Approved Registration (Original)**

**Route**: `/api/tenant/register`

**Flow**:
```
1. Admin creates customer first (through admin panel)
   • Customer: Budi Santoso
   • NIK: 1234567890123456
   • Room: 101

2. Tenant registers with same NIK
   • Must match existing customer's NIK
   • Links user account to customer

3. Only pre-approved customers can register
```

**Pros**:
- ✅ Admin has full control
- ✅ Only verified tenants can register
- ✅ Prevents fraudulent accounts

**Cons**:
- ❌ Requires admin work first
- ❌ Not self-service

**Use Case**: Best for high-security environments or controlled access

---

## 🚀 **How to Use**

### **Current Implementation (Auto-Registration)**

The registration form at `/tenant/register` now uses **Option 1 (Auto-Registration)** by default.

**To test it**:
```bash
# 1. Start dev server
npm run dev

# 2. Go to: http://localhost:9002/tenant/register

# 3. Fill form:
   Name: Budi Santoso
   Email: budi@example.com
   NIK: 1234567890123456 (any 16 digits)
   Phone: 08123456789 (optional)
   Room: 101 (optional)
   Password: password123

# 4. Submit → Account created automatically!
```

### **Switch to Admin-Pre-Approved Mode**

If you want to use **Option 2** instead:

1. **In `register-form.tsx`**, change line 49:
```typescript
// FROM:
const response = await fetch('/api/tenant/register-auto', {

// TO:
const response = await fetch('/api/tenant/register', {
```

2. **Remove optional fields** from form (phone, roomNumber)

3. **Create customers first** through admin panel

---

## 📊 **Comparison Table**

| Feature | Auto-Register | Admin-Pre-Approved |
|---------|--------------|-------------------|
| Self-service | ✅ Yes | ❌ No |
| Admin approval | ❌ No | ✅ Yes |
| Customer creation | Automatic | Manual |
| Security | Medium | High |
| Setup required | None | Admin creates customers first |
| Best for | Testing, open environments | Controlled environments |

---

## 🔐 **Security Enhancements (Future)**

To improve security for auto-registration, consider adding:

### **1. Email Verification**
```typescript
// Send verification email after registration
await sendVerificationEmail(user.email, verificationToken);

// User must click link to activate account
// Tenant account = inactive until verified
```

### **2. Admin Approval Queue**
```typescript
// Tenant registers → Status = PENDING
// Admin reviews → Approve/Reject
// Tenant gets email notification
```

### **3. CAPTCHA**
```typescript
// Add Google reCAPTCHA to registration form
// Prevent bot registrations
```

### **4. Phone Verification**
```typescript
// Send OTP via WhatsApp/SMS
// Verify phone number before activating account
```

---

## 🎛️ **Configuration**

### **Enable/Disable Auto-Registration**

**Environment Variable** (add to `.env`):
```bash
# Enable auto-registration (default: true)
TENANT_AUTO_REGISTER=true
```

**Then check in API**:
```typescript
// register-auto route.ts
if (process.env.TENANT_AUTO_REGISTER !== 'true') {
  return NextResponse.json(
    { error: 'Self-registration is disabled' },
    { status: 403 }
  );
}
```

---

## 📝 **Summary**

**Current State**: ✅ **Auto-Registration is ENABLED**

- Tenants can register immediately
- Customer records created automatically
- No admin intervention needed
- Perfect for testing and development

**To Change**: Edit `register-form.tsx` line 49 to use `/api/tenant/register` instead

**For Production**: Consider adding email verification or admin approval for better security

---

**Need help?** Check:
- `TENANT_PORTAL_SETUP.md` - Full setup guide
- `TENANT_PORTAL_SUMMARY.md` - Complete feature summary
