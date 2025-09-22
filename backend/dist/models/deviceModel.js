import pool from "../config/pool.js";
export async function getDevices(filters) {
    const conn = await pool.getConnection();
    try {
        let sql = "SELECT * FROM devices";
        let params = [];
        if (filters.status) {
            sql += " WHERE status = ?";
            params.push(filters.status);
        }
        // ... more filters ...
        if (params.length > 0) {
            const [rows] = await conn.execute(sql, params);
            return rows;
        }
        else {
            const [rows] = await conn.execute(sql);
            return rows;
        }
    }
    finally {
        conn.release();
    }
}
export async function createDevice({ device_name, mac_address, device_type, user_id, passcode, status, bt_name, warranty_start, default_cmd, first_connected_at, }) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute(`INSERT INTO devices 
       (device_name, mac_address, device_type, user_id, passcode, status, bt_name, warranty_start, default_cmd, first_connected_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
            device_name ?? null,
            mac_address ?? null,
            device_type ?? null,
            user_id ?? null,
            passcode ?? null,
            status ?? null,
            bt_name ?? null,
            warranty_start ?? null,
            default_cmd ?? null,
            first_connected_at ?? null,
        ]);
        return { id: result.insertId };
    }
    finally {
        conn.release();
    }
}
export async function getDeviceById(id) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute("SELECT * FROM devices WHERE id = ?", [
            id,
        ]);
        return rows[0] || null;
    }
    finally {
        conn.release();
    }
}
export async function updateDevice(id, { device_name, mac_address, device_type, user_id, passcode, status, bt_name = "", warranty_start = null, default_cmd = null, first_connected_at = null, }) {
    const conn = await pool.getConnection();
    try {
        await conn.execute(`UPDATE devices 
       SET device_name = ?, mac_address = ?, device_type = ?, user_id = ?, passcode = ?, status = ?, 
           bt_name = ?, warranty_start = ?, default_cmd = ?, first_connected_at = ?, updated_at = NOW()
       WHERE id = ?`, [
            device_name,
            mac_address,
            device_type,
            user_id || null,
            passcode,
            status,
            bt_name || null,
            warranty_start || null,
            default_cmd || null,
            first_connected_at || null,
            id,
        ]);
        return true;
    }
    finally {
        conn.release();
    }
}
export async function deleteDevice(id) {
    const conn = await pool.getConnection();
    try {
        await conn.execute("DELETE FROM devices WHERE id = ?", [id]);
        return true;
    }
    finally {
        conn.release();
    }
}
