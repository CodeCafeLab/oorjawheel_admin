import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let query = 'SELECT SQL_CALC_FOUND_ROWS * FROM device_masters WHERE 1=1'
    const params: any[] = []
    if (status) { query += ' AND status = ?'; params.push(status) }
    if (search) { query += ' AND deviceType LIKE ?'; params.push(`%${search}%`) }
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute(query, params)
      const [countRows] = await conn.query('SELECT FOUND_ROWS() as total')
      const total = (countRows as any[])[0]?.total ?? 0
      return NextResponse.json({ data: rows, page, limit, total })
    } finally { conn.release() }
  } catch (e) {
    console.error('GET /api/device-masters', e)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const conn = await pool.getConnection()
    try {
      const [res] = await conn.execute(
        'INSERT INTO device_masters (id, deviceType, btServe, btChar, soundBtName, status, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())',
        [body.deviceType, body.btServe, body.btChar, body.soundBtName, body.status]
      )
      return NextResponse.json({ message: 'Created', id: (res as any).insertId }, { status: 201 })
    } finally { conn.release() }
  } catch (e) {
    console.error('POST /api/device-masters', e)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}


