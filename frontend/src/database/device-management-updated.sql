-- Device Management Database Schema - UPDATED
-- This script creates the necessary tables for the device management system with all required columns

-- Create devices table with all required columns
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    deviceName VARCHAR(255) NOT NULL,
    macAddress VARCHAR(17) NOT NULL UNIQUE,
    deviceType VARCHAR(100) NOT NULL,
    userId VARCHAR(36),
    passcode VARCHAR(6) NOT NULL,
    status ENUM('never_used', 'active', 'disabled') DEFAULT 'never_used',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- New columns for complete device management
    btName VARCHAR(100), -- Bluetooth device name (bt_name)
    warrantyStart DATE, -- Warranty start date (warranty_start)
    defaultCmd VARCHAR(100), -- Default command for device (default_cmd)
    firstConnectedAt DATETIME, -- First connection timestamp (first_connected_at)
    
    INDEX idx_macAddress (macAddress),
    INDEX idx_deviceType (deviceType),
    INDEX idx_status (status),
    INDEX idx_userId (userId),
    INDEX idx_warrantyStart (warrantyStart),
    INDEX idx_firstConnectedAt (firstConnectedAt),
    FOREIGN KEY (deviceType) REFERENCES device_masters(deviceType) ON DELETE RESTRICT
);

-- Create device_masters table
CREATE TABLE IF NOT EXISTS device_masters (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    deviceType VARCHAR(100) NOT NULL UNIQUE,
    btServe VARCHAR(100) NOT NULL,
    btChar VARCHAR(100) NOT NULL,
    soundBtName VARCHAR(100) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_deviceType (deviceType),
    INDEX idx_status (status)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_createdAt ON devices(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_devices_warrantyStart ON devices(warrantyStart DESC);
CREATE INDEX IF NOT EXISTS idx_devices_firstConnectedAt ON devices(firstConnectedAt DESC);

-- Insert sample device masters
INSERT IGNORE INTO device_masters (deviceType, btServe, btChar, soundBtName, status) VALUES
('OorjaWheel v2', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaWheelV2', 'active'),
('OorjaLight', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaLight', 'active'),
('OorjaSound', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaSound', 'active'),
('OorjaHub', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaHub', 'active'),
('OorjaSensor', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaSensor', 'active');

-- Insert enhanced sample devices with new fields
INSERT IGNORE INTO devices (
    deviceName, macAddress, deviceType, userId, passcode, status, 
    btName, warrantyStart, defaultCmd, firstConnectedAt
) VALUES
('Living Room Wheel', '00:1A:2B:3C:4D:5E', 'OorjaWheel v2', NULL, '3C4D5E', 'never_used', 
 'OorjaWheel-Living', '2024-01-15', 'POWER_ON', NULL),
('Bedroom Light', '00:1B:2C:3D:4E:5F', 'OorjaLight', NULL, '3D4E5F', 'never_used',
 'OorjaLight-Bedroom', '2024-02-01', 'LIGHT_ON', NULL),
('Kitchen Speaker', '00:1C:2D:3E:4F:50', 'OorjaSound', NULL, '3E4F50', 'never_used',
 'OorjaSound-Kitchen', '2024-01-20', 'VOLUME_UP', NULL);

-- Create triggers for updatedAt
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS devices_updated_at BEFORE UPDATE ON devices
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER IF NOT EXISTS device_masters_updated_at BEFORE UPDATE ON device_masters
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- Create enhanced view for device statistics
CREATE OR REPLACE VIEW device_statistics AS
SELECT 
    (SELECT COUNT(*) FROM devices) as total_devices,
    (SELECT COUNT(*) FROM devices WHERE status = 'active') as active_devices,
    (SELECT COUNT(*) FROM devices WHERE status = 'never_used') as never_used_devices,
    (SELECT COUNT(*) FROM devices WHERE status = 'disabled') as disabled_devices,
    (SELECT COUNT(*) FROM devices WHERE warrantyStart IS NOT NULL) as warranty_devices,
    (SELECT COUNT(*) FROM devices WHERE firstConnectedAt IS NOT NULL) as connected_devices,
    (SELECT COUNT(*) FROM device_masters) as total_device_types,
    (SELECT COUNT(*) FROM device_masters WHERE status = 'active') as active_device_types;

-- Create stored procedures for enhanced operations
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS GetDevicesWithDetails()
BEGIN
    SELECT 
        id, deviceName, macAddress, deviceType, userId, passcode, status,
        btName, warrantyStart, defaultCmd, firstConnectedAt,
        createdAt, updatedAt
    FROM devices 
    ORDER BY createdAt DESC;
END$$

CREATE PROCEDURE IF NOT EXISTS GetDevicesByWarrantyStatus(IN warranty_status VARCHAR(20))
BEGIN
    IF warranty_status = 'active' THEN
        SELECT * FROM devices WHERE warrantyStart <= CURDATE() AND status = 'active';
    ELSEIF warranty_status = 'expired' THEN
        SELECT * FROM devices WHERE warrantyStart < CURDATE() AND status = 'active';
    ELSE
        SELECT * FROM devices WHERE warrantyStart IS NULL;
    END IF;
END$$
DELIMITER ;

-- Migration script to add new columns to existing devices table
-- Run this if you need to update an existing table
-- ALTER TABLE devices 
-- ADD COLUMN IF NOT EXISTS btName VARCHAR(100),
-- ADD COLUMN IF NOT EXISTS warrantyStart DATE,
-- ADD COLUMN IF NOT EXISTS defaultCmd VARCHAR(100),
-- ADD COLUMN IF NOT EXISTS firstConnectedAt DATETIME;
