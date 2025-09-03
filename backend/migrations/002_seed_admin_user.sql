-- Add a default admin user
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO admins (email, password_hash, role, created_at)
VALUES (
  'admin@oorja.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'super_admin',
  NOW()
)
ON CONFLICT (email) DO NOTHING;
