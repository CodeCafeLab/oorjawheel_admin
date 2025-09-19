-- Admin General Settings (per admin)
CREATE TABLE IF NOT EXISTS admin_general_settings (
    admin_id INT PRIMARY KEY,
    site_name VARCHAR(120) DEFAULT 'Oorja',
    official_email VARCHAR(160) DEFAULT NULL,
    app_logo_url VARCHAR(500) DEFAULT NULL,
    app_icon_url VARCHAR(500) DEFAULT NULL,
    admin_logo_url VARCHAR(500) DEFAULT NULL,
    admin_icon_url VARCHAR(500) DEFAULT NULL,
    play_store_link VARCHAR(500) DEFAULT NULL,
    app_store_link VARCHAR(500) DEFAULT NULL,
    support_number VARCHAR(64) DEFAULT NULL,
    whatsapp_number VARCHAR(64) DEFAULT NULL,
    facebook_link VARCHAR(500) DEFAULT NULL,
    instagram_link VARCHAR(500) DEFAULT NULL,
    website_link VARCHAR(500) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);