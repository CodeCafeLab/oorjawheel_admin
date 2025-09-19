-- Setup script for notifications module
-- Run this in your MySQL database

USE oorja_wheel;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INT,
    image_url VARCHAR(500),
    type ENUM('info', 'alert', 'promotion', 'warning', 'success') DEFAULT 'info',
    status ENUM('draft', 'scheduled', 'sent', 'failed') DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_created_at (created_at)
);

-- Notification delivery logs table
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    delivery_status ENUM('pending', 'delivered', 'failed', 'read') DEFAULT 'pending',
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_notification_user (notification_id, user_id),
    INDEX idx_delivery_status (delivery_status),
    INDEX idx_delivered_at (delivered_at)
);

-- Insert some sample notifications for testing
INSERT INTO notifications (title, description, type, status, created_by) VALUES
('Welcome to Oorja Wheel!', 'Thank you for joining our platform. Explore all the amazing features we have to offer.', 'info', 'sent', 1),
('New Feature Available', 'Check out our latest update with improved device controls and better user experience.', 'promotion', 'draft', 1),
('System Maintenance Notice', 'We will be performing scheduled maintenance on Sunday from 2 AM to 4 AM. Some features may be temporarily unavailable.', 'warning', 'scheduled', 1),
('Security Update', 'We have implemented enhanced security measures to protect your account. Please ensure your password is strong and unique.', 'alert', 'sent', 1),
('Congratulations!', 'You have successfully completed the setup process. Your account is now fully configured and ready to use.', 'success', 'sent', 1);

-- Show the created tables
SHOW TABLES LIKE '%notification%';

-- Show sample data
SELECT * FROM notifications;
