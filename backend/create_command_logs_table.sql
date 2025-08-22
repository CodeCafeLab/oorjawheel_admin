-- Create command_logs table
CREATE TABLE IF NOT EXISTS command_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    user_id INT,
    command VARCHAR(500) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result TEXT,
    type ENUM('manual', 'scheduled', 'automated') DEFAULT 'manual',
    status ENUM('pending', 'sent', 'success', 'failed') DEFAULT 'pending',
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_device_id (device_id),
    INDEX idx_user_id (user_id),
    INDEX idx_sent_at (sent_at),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
