import pool from '../config/pool.js';

export async function getDeviceMasters({ status, search, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;
  let sql = 'SELECT SQL_CALC_FOUND_ROWS * FROM device_masters WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND deviceType LIKE ?';
    params.push(`%${search}%`);
  }

  sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
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

export async function createDeviceMaster({ deviceType, btServe, btChar, soundBtName, status }) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      `INSERT INTO device_masters 
       (id, deviceType, btServe, btChar, soundBtName, status, createdAt, updatedAt) 
       VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())`,
      [deviceType, btServe, btChar, soundBtName, status]
    );
    return { id: result.insertId };
  } finally {
    conn.release();
  }
}

export async function getDeviceMasterById(id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute('SELECT * FROM device_masters WHERE id = ?', [id]);
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function updateDeviceMaster(id, { deviceType, btServe, btChar, soundBtName, status }) {
  const conn = await pool.getConnection();
  try {
    await conn.execute(
      `UPDATE device_masters 
       SET deviceType = ?, btServe = ?, btChar = ?, soundBtName = ?, status = ?, updatedAt = NOW() 
       WHERE id = ?`,
      [deviceType, btServe, btChar, soundBtName, status, id]
    );
    return true;
  } finally {
    conn.release();
  }
}

export async function deleteDeviceMaster(id) {
  const conn = await pool.getConnection();
  try {
    await conn.execute('DELETE FROM device_masters WHERE id = ?', [id]);
    return true;
  } finally {
    conn.release();
  }
}
