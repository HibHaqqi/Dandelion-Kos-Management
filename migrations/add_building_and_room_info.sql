-- Migration: Add Building and Room Information Tables
-- Date: 2025-01-16

-- Create BuildingInfo table for shared building information
CREATE TABLE "BuildingInfo" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "BuildingInfo_pkey" PRIMARY KEY ("id")
);

-- Create unique index on key
CREATE UNIQUE INDEX "BuildingInfo_key_key" ON "BuildingInfo"("key");

-- Create foreign key to User
ALTER TABLE "BuildingInfo" ADD CONSTRAINT "BuildingInfo_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create RoomInfo table for room-specific information
CREATE TABLE "RoomInfo" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "RoomInfo_pkey" PRIMARY KEY ("id")
);

-- Create unique index on roomNumber + key combination
CREATE UNIQUE INDEX "RoomInfo_roomNumber_key_key" ON "RoomInfo"("roomNumber", "key");

-- Create foreign key to User
ALTER TABLE "RoomInfo" ADD CONSTRAINT "RoomInfo_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert default building information
INSERT INTO "BuildingInfo" ("id", "key", "value", "category", "description", "isActive", "updatedAt") VALUES
('cmkb01', 'wifi_ssid', 'BizTrackKos-Guest', 'general', 'Building WiFi network name', true, NOW()),
('cmkb02', 'wifi_password', 'kos123456', 'general', 'Building WiFi password', true, NOW()),
('cmkb03', 'gate_code', '1234#', 'security', 'Main gate access code', true, NOW()),
('cmkb04', 'emergency_contact', '08123456789', 'contact', 'Building emergency contact number', true, NOW()),
('cmkb05', 'admin_phone', '08198765432', 'contact', 'Building administrator phone', true, NOW()),
('cmkb06', 'checkout_time', '12:00', 'general', 'Standard checkout time', true, NOW());

-- Insert some sample room info (adjust room numbers as needed)
-- These are examples - you'll need to update based on your actual rooms
-- INSERT INTO "RoomInfo" ("id", "roomNumber", "key", "value", "category", "description", "updatedAt") VALUES
-- ('cmkr01', 'A101', 'electricity_token', '1234-5678-9012-3456', 'utilities', 'Prepaid electricity token for room', NOW()),
-- ('cmkr02', 'A101', 'server_password', 'server2024', 'server', 'Password for building server access', NOW());
