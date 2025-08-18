import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Row = Record<string, any>

async function query(sql: string, params: any[] = []) {
  const conn = await pool.getConnection()
  try {
    const [rows] = await conn.execute(sql, params)
    return rows as Row[]
  } finally {
    conn.release()
  }
}

export async function GET(_req: NextRequest) {
  try {
    // KPIs (each guarded)
    let activeDevices = 0
    let totalUsers = 0
    let commands24h = 0
    let warrantyThisMonth = 0
    try {
      const [row] = await query('SELECT COUNT(*) as count FROM devices WHERE status = "active"')
      activeDevices = row?.count ?? 0
    } catch {}
    try {
      const [row] = await query('SELECT COUNT(*) as count FROM users')
      totalUsers = row?.count ?? 0
    } catch {}
    try {
      const [row] = await query('SELECT COUNT(*) as count FROM device_events WHERE timestamp >= (NOW() - INTERVAL 1 DAY)')
      commands24h = row?.count ?? 0
    } catch {}
    try {
      const [row] = await query('SELECT COUNT(*) as count FROM devices WHERE warranty_start IS NOT NULL AND YEAR(warranty_start)=YEAR(CURDATE()) AND MONTH(warranty_start)=MONTH(CURDATE())')
      warrantyThisMonth = row?.count ?? 0
    } catch {}

    // Daily command volume (last 7 days)
    let commandVolume: Row[] = []
    try {
      commandVolume = await query(
        `SELECT DATE_FORMAT(d, '%a') as day, IFNULL(cnt, 0) as commands
         FROM (
           SELECT CURDATE() - INTERVAL seq DAY as d
           FROM (
             SELECT 0 seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
             UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
           ) days
         ) dates
         LEFT JOIN (
           SELECT DATE(timestamp) as d, COUNT(*) as cnt
           FROM device_events
           WHERE timestamp >= (CURDATE() - INTERVAL 6 DAY)
           GROUP BY DATE(timestamp)
         ) ev ON ev.d = dates.d
         ORDER BY d`
      )
    } catch {}

    // Device status distribution
    let deviceStatus: Row[] = []
    try {
      deviceStatus = await query(`SELECT status as status, COUNT(*) as count FROM devices GROUP BY status`)
    } catch {}

    // Device activations (first_connected_at - last 7 days)
    let deviceActivations: Row[] = []
    try {
      deviceActivations = await query(
        `SELECT DATE_FORMAT(d, '%Y-%m-%d') as date, IFNULL(cnt, 0) as count
         FROM (
           SELECT CURDATE() - INTERVAL seq DAY as d
           FROM (
             SELECT 0 seq UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
             UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
           ) days
         ) dates
         LEFT JOIN (
           SELECT DATE(first_connected_at) as d, COUNT(*) as cnt
           FROM devices
           WHERE first_connected_at IS NOT NULL AND first_connected_at >= (CURDATE() - INTERVAL 6 DAY)
           GROUP BY DATE(first_connected_at)
         ) da ON da.d = dates.d
         ORDER BY d`
      )
    } catch {}

    // Warranty triggers per month (current year)
    let warrantyTriggers: Row[] = []
    try {
      warrantyTriggers = await query(
        `SELECT DATE_FORMAT(warranty_start, '%M') as month,
                COUNT(*) as triggers,
                DATE_FORMAT(warranty_start, '%Y-%m') as ym
         FROM devices
         WHERE warranty_start IS NOT NULL AND YEAR(warranty_start)=YEAR(CURDATE())
         GROUP BY ym
         ORDER BY ym`
      )
    } catch {}

    // Weekly active users (last 4 weeks) based on sessions
    let weeklyActiveUsers: Row[] = []
    try {
      weeklyActiveUsers = await query(
        `SELECT CONCAT('Week ', DATE_FORMAT(s.logged_in_at, '%u')) as week, COUNT(DISTINCT s.user_id) as users
         FROM sessions s
         WHERE s.logged_in_at >= (CURDATE() - INTERVAL 28 DAY)
         GROUP BY DATE_FORMAT(s.logged_in_at, '%x-%v')
         ORDER BY DATE_FORMAT(s.logged_in_at, '%x-%v')`
      )
    } catch {}

    return NextResponse.json({
      kpis: {
        activeDevices,
        totalUsers,
        commands24h,
        warrantyThisMonth,
      },
      charts: {
        commandVolume,
        deviceStatus,
        deviceActivations,
        warrantyTriggers,
        weeklyActiveUsers,
      },
    })
  } catch (e) {
    console.error('Analytics API error', e)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}


