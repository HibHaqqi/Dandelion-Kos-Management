This technical summary outlines the architecture for a dedicated **Tenant Portal** within **BizTrackKos-2**. This system shifts from a "Management-only" tool to a "Service-oriented" platform.

---

## 🏗️ 1. Authentication & Access Logic

To secure the tenant pages, you must update your authentication flow to support **Roles**.

* **Role-Based Access Control (RBAC):** Users will now have a `role` (ADMIN or TENANT).
* **Tenant Mapping:** A Tenant user must be linked to a `CustomerId`. This ensures that when they log in, they only see transactions and rooms associated with their identity.
* **Session Management:** The session cookie will now include `tenantId` and `customerId` for fast database querying.

---

## 📋 2. Core Feature Specifications

### A. Historical Payment List

A read-only ledger of the tenant's financial history.

* **Data Source:** Query the `Transaction` table where `customerId === session.customerId`.
* **UI Elements:** A list view grouped by month showing `Date`, `Amount`, `Description`, and `Status`.
* **Logic:** Filter out "Expenses" (internal business costs) and only show "Revenue" (payments they made).

### B. Payment Submission (JPG Upload)

Allows tenants to upload proof of transfer for manual verification.

* **Technical Stack:** Use **UploadThing** or **Cloudinary** for image hosting (since PostgreSQL is not ideal for storing raw image data).
* **Workflow:** 1. Tenant fills out amount and date.
2. Uploads JPG/PNG receipt.
3. System creates a `Transaction` with status `PENDING_VERIFICATION`.
4. Admin receives a notification to approve or reject.

### C. Complaint Submission System

A ticketing system for maintenance requests.

* **Model:** A new `Complaint` table linked to `TenantId`.
* **Fields:** Category (Electricity, Plumbing, Internet, etc.), Title, Description, Status (Open, In-Progress, Resolved).
* **Business Logic:** Admins can reply or update the status, which reflects in real-time on the Tenant's dashboard.

### D. Server Apps Directory (Dashboard)

A "Value-Add" hub for internal services.

* **Feature:** A grid of cards linking to your home server apps (Jellyfin, Jellyseerr, etc.).
* **Connectivity Check:** (Optional) Use a server-side `fetch` to check if the local IP of the server is "Up" before showing the link.
* **Redirection:** Links are protected—only visible to tenants with an `Active` room status.

---

## 🗄️ 3. Updated Database Schema (Conceptual)

```prisma
// Extension of your current schema
model Tenant {
  id           String      @id @default(cuid())
  userId       String      @unique // Link to auth user
  customerId   String      @unique // Link to business record
  complaints   Complaint[]
  active       Boolean     @default(true)
}

model Complaint {
  id          String   @id @default(cuid())
  tenantId    String
  title       String
  description String
  status      String   @default("OPEN") // OPEN, IN_PROGRESS, RESOLVED
  imageUrl    String?  // Proof of the issue
  createdAt   DateTime @default(now())
}

// Transaction update
model Transaction {
  // ... existing fields
  receiptUrl  String?  // For the JPG upload
  isVerified  Boolean  @default(false) 
}

```

---

## 🛠️ 4. Development Roadmap

| Phase | Task | Key Tool |
| --- | --- | --- |
| **1. Auth** | Split Login for Admin vs Tenant | Next-Auth / Middleware |
| **2. Storage** | Setup Image Uploading for JPGs | UploadThing / S3 |
| **3. UI** | Build the Tenant Mobile-First Dashboard | Tailwind + Lucide Icons |
| **4. Logic** | Implement Complaint & Verify Flow | Prisma Actions |

---

**Would you like me to generate the React code for the "Server Apps" dashboard cards or the Prisma logic for the "Payment Submission" upload?**