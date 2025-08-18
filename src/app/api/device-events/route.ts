import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('device_id')
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '100')
    const offset = (page - 1) * limit
    let query = `SELECT SQL_CALC_FOUND_ROWS de.*, d.device_name as device
                 FROM device_events de LEFT JOIN devices d ON de.device_id = d.id WHERE 1=1`
    const params: any[] = []
    if (deviceId) { query += ' AND de.device_id = ?'; params.push(deviceId) }
    query += ' ORDER BY de.timestamp DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute(query, params)
      const [countRows] = await conn.query('SELECT FOUND_ROWS() as total')
      const total = (countRows as any[])[0]?.total ?? 0
      return NextResponse.json({ data: rows, page, limit, total })
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const conn = await pool.getConnection()
    try {
      const [res] = await conn.execute('INSERT INTO device_events (device_id, event, timestamp) VALUES (?, ?, ?)', [body.device_id, body.event, body.timestamp || new Date()])
      return NextResponse.json({ message: 'Created', id: (res as any).insertId }, { status: 201 })
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}


