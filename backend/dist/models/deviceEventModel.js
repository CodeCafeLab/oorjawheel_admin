import pool from "../config/pool.js";
export async function getDeviceEvents(filters = {}) {
    const conn = await pool.getConnection();
    try {
        let sql = `
      SELECT e.*
      FROM device_events e
      WHERE 1=1
    `;
        const params = [];
        if (filters.deviceId) {
            sql += " AND e.device_id = ?";
            params.push(filters.deviceId);
        }
        if (filters.event) {
            sql += " AND e.event = ?";
            params.push(filters.event);
        }
        if (filters.startDate) {
            sql += " AND e.timestamp >= ?";
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            sql += " AND e.timestamp <= ?";
            params.push(filters.endDate);
        }
        sql += " ORDER BY e.timestamp DESC";
        const [rows] = await conn.execute(sql, params);
        return rows;
    }
    finally {
        conn.release();
    }
}
export async function createDeviceEvent({ deviceId, event }) {
    const conn = await pool.getConnection();
    try {
        // First check if device exists
        const [device] = await conn.execute('SELECT id FROM devices WHERE id = ?', [deviceId]);
        if (device.length === 0) {
            const error = new Error(`Device with ID ${deviceId} not found`);
            error.code = 'DEVICE_NOT_FOUND';
            throw error;
        }
        // If device exists, create the event
        const [result] = await conn.execute(`INSERT INTO device_events (device_id, event, timestamp) 
       VALUES (?, ?, NOW())`, [deviceId, event]);
        return { id: result.insertId };
    }
    finally {
        conn.release();
    }
}
export async function getDeviceEventById(id) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(`SELECT e.*, d.name as device_name 
       FROM device_events e
       LEFT JOIN devices d ON e.device_id = d.id
       WHERE e.id = ?`, [id]);
        return rows[0];
    }
    finally {
        conn.release();
    }
}
export async function getDeviceEventsByDevice(deviceId, limit = 50) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(`SELECT * FROM device_events 
       WHERE device_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`, [deviceId, parseInt(limit)]);
        return rows;
    }
    finally {
        conn.release();
    }
}
export async function deleteDeviceEvent(id) {
    const conn = await pool.getConnection();
    try {
        await conn.execute("DELETE FROM device_events WHERE id = ?", [id]);
        return { id };
    }
    finally {
        conn.release();
    }
}
