import pool from "../config/pool.js";

export async function getDeviceMasters(filters) {
  const conn = await pool.getConnection();
  try {
    let sql = "SELECT * FROM device_masters";
    let params = [];
    if (filters.status) {
      sql += " WHERE status = ?";
      params.push(filters.status);
    }
    // ... more filters ...
    if (params.length > 0) {
      const [rows] = await conn.execute(sql, params);
      return rows;
    } else {
      const [rows] = await conn.execute(sql);
      return rows;
    }
  } finally {
    conn.release();
  }
}


export async function createDeviceMaster({
  deviceType,
  btServe,
  btChar,
  soundBtName,
  status,
}) {
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
    const [rows] = await conn.execute(
      "SELECT * FROM device_masters WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function updateDeviceMaster(
  id,
  { deviceType, btServe, btChar, soundBtName, status }
) {
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
    await conn.execute("DELETE FROM device_masters WHERE id = ?", [id]);
    return true;
  } finally {
    conn.release();
  }
}

