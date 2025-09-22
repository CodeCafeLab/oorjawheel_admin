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

// ---- User Management ----

export async function findUserByEmail(email) {
  const rows = await query(
    `SELECT id, email, password_hash, status, 'user' as role 
     FROM users 
     WHERE email = ? AND status = 'active'`,
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function findUserById(id) {
  const rows = await query(
    `SELECT id, email, name, status, 'user' as role 
     FROM users 
     WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

// ---- Admin Management ----

export async function findAdminByEmail(email) {
  const rows = await query(
    `SELECT id, email, password_hash, role, status, created_at 
     FROM admins 
     WHERE email = ?`,
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function findAdminById(id) {
  const rows = await query(
    `SELECT id, email, role, created_at 
     FROM admins 
     WHERE id = ?`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function createAdmin(adminData) {
  const { email, password_hash, role = 'operator' } = adminData;
  
  const result = await query(
    `INSERT INTO admins (email, password_hash, role, created_at)
     VALUES (?, ?, ?, NOW())`,
    [email, password_hash, role]
  );

  return {
    id: result.insertId,
    email,
    role,
    created_at: new Date().toISOString()
  };
}

export async function updateAdmin(id, updates) {
  const { email, password_hash, role, last_login } = updates;
  const updateFields = [];
  const params = [];
  
  if (email) {
    updateFields.push('email = ?');
    params.push(email);
  }
  if (password_hash) {
    updateFields.push('password_hash = ?');
    params.push(password_hash);
  }
  if (role) {
    updateFields.push('role = ?');
    params.push(role);
  }
  if (last_login) {
    updateFields.push('last_login = ?');
    params.push(last_login);
  }
  
  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }
  
  params.push(id);
  
  await query(
    `UPDATE admins 
     SET ${updateFields.join(', ')}, updated_at = NOW() 
     WHERE id = ?`,
    params
  );
  
  return findAdminById(id);
}

export async function deleteAdmin(id) {
  await query('DELETE FROM admins WHERE id = ?', [id]);
  return { success: true };
}

// ---- User Session Management ----

export async function createSession(userId, token, expiresAt) {
  await query(
    `INSERT INTO user_sessions (user_id, token, expires_at, created_at)
     VALUES (?, ?, ?, NOW())`,
    [userId, token, expiresAt]
  );
  return true;
}

export async function deleteSession(token) {
  await query('DELETE FROM user_sessions WHERE token = ?', [token]);
  return true;
}

export async function findValidSession(token) {
  const rows = await query(
    `SELECT * FROM user_sessions 
     WHERE token = ? AND expires_at > NOW() AND is_revoked = 0`,
    [token]
  );
  return rows.length > 0 ? rows[0] : null;
}
