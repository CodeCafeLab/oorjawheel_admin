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

export async function getAll() {
  return await query("SELECT * FROM command_logs");
}

export async function getById(id) {
  const [rows] = await query("SELECT * FROM command_logs WHERE id = ?", [id]);
  return rows[0];
}

export async function create(data) {
  const { device_id, user_id, command, sent_at, result, type, status, details } = data;
  
  // Convert details object to JSON string if it's not already a string
  const detailsJson = typeof details === 'string' ? details : JSON.stringify(details);
  
  const [resultObj] = await query(
    "INSERT INTO command_logs (device_id, user_id, command, sent_at, result, type, status, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [device_id, user_id, command, sent_at, result, type, status, detailsJson]
  );
  return { id: resultObj.insertId.toString(), ...data };
}

export async function update(id, data) {
  const { device_id, user_id, command, sent_at, result, type, status, details } = data;
  
  // Convert details object to JSON string if it's not already a string
  const detailsJson = typeof details === 'string' ? details : JSON.stringify(details);
  
  await query(
    "UPDATE command_logs SET device_id=?, user_id=?, command=?, sent_at=?, result=?, type=?, status=?, details=? WHERE id=?",
    [device_id, user_id, command, sent_at, result, type, status, detailsJson, id]
  );
  return { id, ...data };
}

export async function remove(id) {
  await query("DELETE FROM command_logs WHERE id=?", [id]);
  return { id };
}