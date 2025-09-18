-- Fix command_logs table to match the provided schema
-- This script will modify the existing table structure

-- First, let's alter the table to ensure proper structure
ALTER TABLE command_logs 
MODIFY COLUMN id VARCHAR(255) NOT NULL AUTO_INCREMENT PRIMARY KEY,
MODIFY COLUMN device_id VARCHAR(255) NOT NULL,
MODIFY COLUMN user_id INT NULL,
MODIFY COLUMN command TEXT NOT NULL,
MODIFY COLUMN sent_at DATETIME NULL,
MODIFY COLUMN result TEXT NULL,
MODIFY COLUMN type ENUM('manual','auto') NOT NULL DEFAULT 'manual',
MODIFY COLUMN status ENUM('active','inactive') NOT NULL DEFAULT 'active',
MODIFY COLUMN details JSON NULL;

-- If the above fails due to AUTO_INCREMENT on VARCHAR, use this alternative:
-- Drop and recreate the table with proper structure
/*
DROP TABLE IF EXISTS command_logs_backup;
CREATE TABLE command_logs_backup AS SELECT * FROM command_logs;

DROP TABLE command_logs;

CREATE TABLE command_logs (
    id VARCHAR(255) PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    user_id INT NULL,
    command TEXT NOT NULL,
    sent_at DATETIME NULL,
    result TEXT NULL,
    type ENUM('manual','auto') NOT NULL DEFAULT 'manual',
    status ENUM('active','inactive') NOT NULL DEFAULT 'active',
    details JSON NULL
);

-- If you want to restore data (modify IDs as needed):
-- INSERT INTO command_logs SELECT 
--     CONCAT('CMD_', LPAD(ROW_NUMBER() OVER (ORDER BY sent_at), 6, '0')) as id,
--     device_id, user_id, command, sent_at, result, 
--     CASE WHEN type = 'automated' THEN 'auto' ELSE type END as type,
--     CASE WHEN status IN ('pending','sent','success','failed') THEN 'active' ELSE status END as status,
--     details 
-- FROM command_logs_backup;
*/
