import pool from '../config/pool.js';

async function query(sql, params = []) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    return rows;
  } finally {
    conn.release();
  }
}

export async function getDeviceEvents({ deviceId, page = 1, limit = 100 }) {
  const offset = (page - 1) * limit;
  let sql = `
    SELECT SQL_CALC_FOUND_ROWS de.*, d.device_name as device
    FROM device_events de
    LEFT JOIN devices d ON de.device_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (deviceId) {
    sql += ' AND de.device_id = ?';
    params.push(deviceId);
  }

  sql += ' ORDER BY de.timestamp DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(sql, params);
    const [countRows] = await conn.query('SELECT FOUND_ROWS() as total');
    const total = countRows[0]?.total ?? 0;

    return { data: rows, page, limit, total };
  } finally {
    conn.release();
  }
}

export async function createDeviceEvent({ device_id, event, timestamp }) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      'INSERT INTO device_events (device_id, event, timestamp) VALUES (?, ?, ?)',
      [device_id, event, timestamp || new Date()]
    );
    return { id: result.insertId };
  } finally {
    conn.release();
  }
}
