-- Update command_logs table to match the required schema
USE oorja_wheel;

DROP TABLE IF EXISTS command_logs;

CREATE TABLE command_logs (
    id VARCHAR(255) PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    user_id INT,
    command TEXT NOT NULL,
    sent_at DATETIME,
    result TEXT,
    type ENUM('manual','auto') DEFAULT 'manual',
    status ENUM('active','inactive') DEFAULT 'active',
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_id (device_id),
    INDEX idx_user_id (user_id),
    INDEX idx_sent_at (sent_at),
    INDEX idx_status (status)
);
