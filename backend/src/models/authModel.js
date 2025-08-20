import pool from '../config/pool.js';

// Query helper
async function query(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

// ---- Fetch user by email ----
export async function findUserByEmail(email) {
  const rows = await query(
    'SELECT id, email, password_hash, status FROM users WHERE email = ?',
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
}

// ---- Fetch admin by email ----
export async function findAdminByEmail(email) {
  const rows = await query(
    'SELECT id, email, password_hash, role as status FROM admins WHERE email = ?',
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
}
