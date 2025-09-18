-- Device Management Database Schema
-- This script creates the necessary tables for the device management system

-- Create devices table
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
    INDEX idx_macAddress (macAddress),
    INDEX idx_deviceType (deviceType),
    INDEX idx_status (status),
    INDEX idx_userId (userId),
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
CREATE INDEX IF NOT EXISTS idx_device_masters_createdAt ON device_masters(createdAt DESC);

-- Insert sample device masters
INSERT IGNORE INTO device_masters (deviceType, btServe, btChar, soundBtName, status) VALUES
('OorjaWheel v2', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaWheelV2', 'active'),
('OorjaLight', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaLight', 'active'),
('OorjaSound', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaSound', 'active'),
('OorjaHub', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaHub', 'active'),
('OorjaSensor', '00001101-0000-1000-8000-00805F9B34FB', '00001101-0000-1000-8000-00805F9B34FB', 'OorjaSensor', 'active');

-- Insert sample devices
INSERT IGNORE INTO devices (deviceName, macAddress, deviceType, userId, passcode, status) VALUES
('Living Room Wheel', '00:1A:2B:3C:4D:5E', 'OorjaWheel v2', NULL, '3C4D5E', 'never_used'),
('Bedroom Light', '00:1B:2C:3D:4E:5F', 'OorjaLight', NULL, '3D4E5F', 'never_used'),
('Kitchen Speaker', '00:1C:2D:3E:4F:50', 'OorjaSound', NULL, '3E4F50', 'never_used');

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

-- Create view for device statistics
CREATE OR REPLACE VIEW device_statistics AS
SELECT 
    (SELECT COUNT(*) FROM devices) as total_devices,
    (SELECT COUNT(*) FROM devices WHERE status = 'active') as active_devices,
    (SELECT COUNT(*) FROM devices WHERE status = 'never_used') as never_used_devices,
    (SELECT COUNT(*) FROM devices WHERE status = 'disabled') as disabled_devices,
    (SELECT COUNT(*) FROM device_masters) as total_device_types,
    (SELECT COUNT(*) FROM device_masters WHERE status = 'active') as active_device_types;

-- Create stored procedures for common operations
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS GetDevicesByType(IN device_type VARCHAR(100))
BEGIN
    SELECT * FROM devices WHERE deviceType = device_type ORDER BY createdAt DESC;
END$$

CREATE PROCEDURE IF NOT EXISTS GetDeviceMastersByStatus(IN status_value VARCHAR(10))
BEGIN
    SELECT * FROM device_masters WHERE status = status_value ORDER BY createdAt DESC;
END$$

CREATE PROCEDURE IF NOT EXISTS GetDeviceCountByType()
BEGIN
    SELECT deviceType, COUNT(*) as count 
    FROM devices 
    GROUP BY deviceType 
    ORDER BY count DESC;
END$$
DELIMITER ;

-- Grant necessary permissions (adjust based on your MySQL user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON oorja_wheel.* TO 'your_user'@'localhost';
