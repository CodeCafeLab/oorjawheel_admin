import pool from "../config/pool.js";

// List all users with optional filters
export async function listUsers({ status, search, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  let query = `
    SELECT u.id, u.fullName, u.email, u.contactNumber, u.address, 
           u.country, u.status, u.first_login_at, u.created_at
    FROM users u 
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    query += " AND u.status = ?";
    params.push(status);
  }

  if (search) {
    query += " AND (u.fullName LIKE ? OR u.email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  // ✅ LIMIT and OFFSET must be directly interpolated
  query += ` ORDER BY u.created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    const countParams = [];

    if (status) {
      countQuery += " AND status = ?";
      countParams.push(status);
    }

    if (search) {
      countQuery += " AND (fullName LIKE ? OR email LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countRows] = await conn.execute(countQuery, countParams);

    return {
      data: rows,
      total: countRows[0]?.total ?? 0,
      page,
      limit,
    };
  } finally {
    conn.release();
  }
}


// Check if email exists
export async function findUserByEmail(email) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

// Get full user record by email (for authentication)
export async function getUserByEmail(email) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

// Create user
export async function createUser(user, passwordHash) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      `INSERT INTO users 
        (fullName, email, contactNumber, address, country, status, password_hash, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user.fullName,
        user.email,
        user.contactNumber,
        user.address,
        user.country,
        user.status || "active",
        passwordHash,
      ]
    );
    return { id: result.insertId };
  } finally {
    conn.release();
  }
}

// Get user by ID
export async function getUserById(id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

// Minimal profile fetch for users
export async function getUserProfileById(id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT id, email, fullName FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

// Update user profile (fullName, email)
export async function updateUserProfile(id, { fullName, email }) {
  const conn = await pool.getConnection();
  try {
    const fields = [];
    const params = [];
    if (typeof fullName !== 'undefined') { fields.push('fullName = ?'); params.push(fullName ?? null); }
    if (typeof email !== 'undefined') { fields.push('email = ?'); params.push(email); }
    if (fields.length === 0) return true;
    params.push(id);
    await conn.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    return true;
  } finally {
    conn.release();
  }
}

// Change user password with oldPassword verification
export async function changeUserPassword(id, { oldPassword, newPassword }) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT password_hash FROM users WHERE id = ?",
      [id]
    );
    const currentHash = rows[0]?.password_hash || null;
    if (!currentHash) return { ok: false, reason: "not_found" };
    const bcrypt = (await import("bcryptjs")).default;
    const ok = await bcrypt.compare(oldPassword, currentHash || "");
    if (!ok) return { ok: false, reason: "invalid_old" };
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, id]);
    return { ok: true };
  } finally {
    conn.release();
  }
}

// Update user
export async function updateUser(id, updates, passwordHash = null) {
  const conn = await pool.getConnection();
  try {
    let query =
      "UPDATE users SET fullName = ?, email = ?, contactNumber = ?, address = ?, country = ?, status = ?";
    const params = [
      updates.fullName,
      updates.email,
      updates.contactNumber,
      updates.address,
      updates.country,
      updates.status || "active",
    ];

    if (passwordHash) {
      query += ", password_hash = ?";
      params.push(passwordHash);
    }

    query += " WHERE id = ?";
    params.push(id);

    await conn.execute(query, params);
    return true;
  } finally {
    conn.release();
  }
}

// Delete user
export async function deleteUser(id) {
  const conn = await pool.getConnection();
  try {
    await conn.execute("DELETE FROM users WHERE id = ?", [id]);
    return true;
  } finally {
    conn.release();
  }
}
