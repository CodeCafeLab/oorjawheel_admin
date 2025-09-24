import pool from "../config/pool.js";
export async function getDevices(filters) {
    const conn = await pool.getConnection();
    try {
        let sql = `SELECT d.*, u.fullName as user_name, u.email as user_email 
               FROM devices d 
               LEFT JOIN users u ON CAST(d.user_id AS UNSIGNED) = u.id`;
        let params = [];
        let whereClause = "";
        if (filters.status) {
            whereClause += " WHERE d.status = ?";
            params.push(filters.status);
        }
        if (filters.deviceType) {
            whereClause += whereClause ? " AND d.device_type = ?" : " WHERE d.device_type = ?";
            params.push(filters.deviceType);
        }
        if (filters.search) {
            whereClause += whereClause ? " AND d.device_name LIKE ?" : " WHERE d.device_name LIKE ?";
            params.push(`%${filters.search}%`);
        }
        sql += whereClause;
        // Add pagination if provided
        if (filters.page && filters.limit) {
            const offset = (filters.page - 1) * filters.limit;
            sql += ` LIMIT ${filters.limit} OFFSET ${offset}`;
        }
        const [rows] = await conn.execute(sql, params);
        return rows;
    }
    finally {
        conn.release();
    }
}
export async function getDevicesByUserId(userId, { status, deviceType, search, page = 1, limit = 20 } = {}) {
    const conn = await pool.getConnection();
    try {
        let sql = `SELECT d.*
               FROM devices d
               WHERE CAST(d.user_id AS UNSIGNED) = ?`;
        const params = [Number(userId)];
        if (status) {
            sql += " AND d.status = ?";
            params.push(status);
        }
        if (deviceType) {
            sql += " AND d.device_type = ?";
            params.push(deviceType);
        }
        if (search) {
            sql += " AND d.device_name LIKE ?";
            params.push(`%${search}%`);
        }
        // Count total for pagination metadata
        const countSql = `SELECT COUNT(*) as total FROM (${sql}) as sub`;
        const [countRows] = await conn.execute(countSql, params);
        const total = countRows?.[0]?.total ?? 0;
        // Pagination
        const safeLimit = Number(limit) || 20;
        const safePage = Number(page) || 1;
        const offset = (safePage - 1) * safeLimit;
        sql += ` ORDER BY d.id DESC LIMIT ${safeLimit} OFFSET ${offset}`;
        const [rows] = await conn.execute(sql, params);
        return { data: rows, total, page: safePage, limit: safeLimit };
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
        const [rows] = await conn.execute(`SELECT d.*, u.fullName as user_name, u.email as user_email 
       FROM devices d 
       LEFT JOIN users u ON CAST(d.user_id AS UNSIGNED) = u.id 
       WHERE d.id = ?`, [id]);
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
