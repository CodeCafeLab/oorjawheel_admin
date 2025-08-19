import pool from "../config/db.js";

// List users with pagination, filters, and search
export async function listUsers({ status, search, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;

  let query = `SELECT SQL_CALC_FOUND_ROWS 
    u.id, u.fullName, u.email, u.contactNumber, u.address, u.country, u.status, u.first_login_at
    FROM users u WHERE 1=1`;
  const params = [];

  if (status) {
    query += " AND u.status = ?";
    params.push(status);
  }
  if (search) {
    query += " AND (u.fullName LIKE ? OR u.email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(query, params);
    const [countRows] = await conn.query("SELECT FOUND_ROWS() as total");
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
    const [rows] = await conn.execute("SELECT id FROM users WHERE email = ?", [email]);
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
