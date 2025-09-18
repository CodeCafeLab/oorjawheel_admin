import pool from "../config/pool.js";


async function query(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

async function queryWithResult(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const [rows, fields] = await conn.execute(sql, params);
    return { rows, result: rows };
  } finally {
    conn.release();
  }
}

export async function getAll() {
  return await query("SELECT * FROM command_logs");
}

export async function getById(id) {
  const [rows] = await query("SELECT * FROM command_logs WHERE id = ?", [id]);
  return rows[0];
}

export async function create(data) {
  const { id, device_id, user_id, command, sent_at, result, type, status, details } = data;
  
  console.log('Creating command log with data:', JSON.stringify(data, null, 2));
  
  // Convert ISO datetime to MySQL format and handle undefined values
  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toISOString().slice(0, 19).replace('T', ' ');
  };
  
  // Validate required fields
  if (!device_id || !command) {
    throw new Error('device_id and command are required fields');
  }
  
  // Skip user validation since foreign key constraint is removed
  const validatedUserId = user_id || null;
  
  const commandId = id || `CMD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const sanitizedParams = [
    commandId,
    device_id.toString(), // Convert to string as per VARCHAR(255)
    validatedUserId,
    command,
    formatDateTime(sent_at) || formatDateTime(new Date().toISOString()),
    result ?? null,
    type ?? 'manual', // Default to 'manual' as per schema
    status ?? 'active', // Default to 'active' as per schema
    details ? JSON.stringify(details) : null
  ];
  
  console.log('Sanitized params for insertion:', sanitizedParams);
  
  try {
    await query(
      "INSERT INTO command_logs (id, device_id, user_id, command, sent_at, result, type, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      sanitizedParams
    );
    console.log('Successfully inserted command log');
    return { id: commandId, ...data };
  } catch (error) {
    console.error('Database insertion error:', error);
    throw error;
  }
}

export async function update(id, data) {
  const { device_id, user_id, command, sent_at, result, type, status, details } = data;
  
  // Convert ISO datetime to MySQL format and handle undefined values
  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toISOString().slice(0, 19).replace('T', ' ');
  };
  
  const sanitizedParams = [
    device_id ? device_id.toString() : null,
    user_id ?? null,
    command ?? null,
    formatDateTime(sent_at),
    result ?? null,
    type ?? null,
    status ?? null,
    details ? JSON.stringify(details) : null,
    id
  ];
  
  await query(
    "UPDATE command_logs SET device_id=?, user_id=?, command=?, sent_at=?, result=?, type=?, status=?, details=? WHERE id=?",
    sanitizedParams
  );
  return { id, ...data };
}

export async function remove(id) {
  await query("DELETE FROM command_logs WHERE id=?", [id]);
  return { id };
}