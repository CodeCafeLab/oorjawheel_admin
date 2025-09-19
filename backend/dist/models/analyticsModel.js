import pool from '../config/pool.js';
async function query(sql, params = []) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(sql, params);
        return rows;
    }
    finally {
        conn.release();
    }
}
// ---- KPIs ----
export async function getActiveDevices() {
    const [row] = await query('SELECT COUNT(*) as count FROM devices WHERE status = "active"');
    return row?.count ?? 0;
}
export async function getTotalUsers() {
    const [row] = await query('SELECT COUNT(*) as count FROM users');
    return row?.count ?? 0;
}
export async function getCommands24h() {
    const [row] = await query('SELECT COUNT(*) as count FROM device_events WHERE timestamp >= (NOW() - INTERVAL 1 DAY)');
    return row?.count ?? 0;
}
export async function getWarrantyThisMonth() {
    const [row] = await query(`
    SELECT COUNT(*) as count 
    FROM devices 
    WHERE warranty_start IS NOT NULL 
      AND YEAR(warranty_start)=YEAR(CURDATE()) 
      AND MONTH(warranty_start)=MONTH(CURDATE())
  `);
    return row?.count ?? 0;
}
// ---- Charts ----
export async function getCommandVolume() {
    return query(`
    SELECT DATE_FORMAT(d, '%a') as day, IFNULL(cnt, 0) as commands
    FROM (
      SELECT CURDATE() - INTERVAL seq DAY as d
      FROM (SELECT 0 seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) days
    ) dates
    LEFT JOIN (
      SELECT DATE(timestamp) as d, COUNT(*) as cnt
      FROM device_events
      WHERE timestamp >= (CURDATE() - INTERVAL 6 DAY)
      GROUP BY DATE(timestamp)
    ) ev ON ev.d = dates.d
    ORDER BY d
  `);
}
export async function getDeviceStatus() {
    return query(`SELECT status as status, COUNT(*) as count FROM devices GROUP BY status`);
}
export async function getDeviceActivations() {
    return query(`
    SELECT DATE_FORMAT(d, '%Y-%m-%d') as date, IFNULL(cnt, 0) as count
    FROM (
      SELECT CURDATE() - INTERVAL seq DAY as d
      FROM (SELECT 0 seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
            UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) days
    ) dates
    LEFT JOIN (
      SELECT DATE(first_connected_at) as d, COUNT(*) as cnt
      FROM devices
      WHERE first_connected_at IS NOT NULL AND first_connected_at >= (CURDATE() - INTERVAL 6 DAY)
      GROUP BY DATE(first_connected_at)
    ) da ON da.d = dates.d
    ORDER BY d
  `);
}
export async function getWarrantyTriggers() {
    return query(`
    SELECT DATE_FORMAT(warranty_start, '%M') as month,
           COUNT(*) as triggers,
           DATE_FORMAT(warranty_start, '%Y-%m') as ym
    FROM devices
    WHERE warranty_start IS NOT NULL AND YEAR(warranty_start)=YEAR(CURDATE())
    GROUP BY ym
    ORDER BY ym
  `);
}
export async function getWeeklyActiveUsers() {
    return query(`
    SELECT CONCAT('Week ', DATE_FORMAT(s.logged_in_at, '%u')) as week, COUNT(DISTINCT s.user_id) as users
    FROM sessions s
    WHERE s.logged_in_at >= (CURDATE() - INTERVAL 28 DAY)
    GROUP BY DATE_FORMAT(s.logged_in_at, '%x-%v')
    ORDER BY DATE_FORMAT(s.logged_in_at, '%x-%v')
  `);
}
