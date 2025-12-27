-- Migration: Add checkoutDate column to Customer table
-- Created: 2025-12-27
-- Description: Adds checkout date tracking for customers to enable proper room management

-- Add the checkoutDate column
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "checkoutDate" TIMESTAMP(3);

-- Verify the column was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Customer' AND column_name = 'checkoutDate'
    ) THEN
        RAISE NOTICE 'Column checkoutDate successfully added to Customer table';
    ELSE
        RAISE EXCEPTION 'Failed to add checkoutDate column';
    END IF;
END $$;
