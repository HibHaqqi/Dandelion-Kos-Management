-- Migration: Add Tenant Portal Support
-- Date: 2025-01-13
-- Description: Add RBAC, Tenant profiles, Complaint system, and Payment verification

-- Step 1: Add role column to User table
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'ADMIN';

-- Step 2: Add tenant verification fields to Transaction table
ALTER TABLE "Transaction" ADD COLUMN "receiptUrl" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Transaction" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'VERIFIED';
ALTER TABLE "Transaction" ADD COLUMN "rejectionReason" TEXT;

-- Step 3: Create Tenant table
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- Step 4: Create unique indexes for Tenant
CREATE UNIQUE INDEX "Tenant_userId_key" ON "Tenant"("userId");
CREATE UNIQUE INDEX "Tenant_customerId_key" ON "Tenant"("customerId");

-- Step 5: Create Tenant foreign keys
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Create Complaint table
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "imageUrl" TEXT,
    "adminReply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- Step 7: Create Complaint foreign key
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Create indexes for better query performance
CREATE INDEX "Complaint_tenantId_idx" ON "Complaint"("tenantId");
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX "Transaction_customerId_idx" ON "Transaction"("customerId");

-- Step 9: Add check constraints for valid values
ALTER TABLE "User" ADD CONSTRAINT "User_role_check" CHECK ("role" IN ('ADMIN', 'TENANT'));
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_status_check" CHECK ("status" IN ('PENDING', 'VERIFIED', 'REJECTED'));
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_status_check" CHECK ("status" IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'));
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_category_check" CHECK ("category" IN ('ELECTRICITY', 'PLUMBING', 'INTERNET', 'OTHER', 'CLEANING', 'SECURITY'));
