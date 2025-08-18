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

    let query = `SELECT SQL_CALC_FOUND_ROWS 
      u.id, u.fullName, u.email, u.contactNumber, u.address, u.country, u.status, u.first_login_at
      FROM users u WHERE 1=1`
    const params: any[] = []
    if (status) { query += ' AND u.status = ?'; params.push(status) }
    if (search) { query += ' AND (u.fullName LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute(query, params)
      const [countRows] = await conn.query('SELECT FOUND_ROWS() as total')
      const total = (countRows as any[])[0]?.total ?? 0
      return NextResponse.json({ data: rows, page, limit, total })
    } finally { conn.release() }
  } catch (e) {
    console.error('GET /api/users', e)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const conn = await pool.getConnection()
    try {
      const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [body.email])
      if ((existing as any[]).length > 0) return NextResponse.json({ error: 'Email exists' }, { status: 409 })
      const [res] = await conn.execute(
        'INSERT INTO users (fullName, email, contactNumber, address, country, status, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [body.fullName, body.email, body.contactNumber, body.address, body.country, body.status || 'active', body.password_hash || null]
      )
      return NextResponse.json({ message: 'Created', id: (res as any).insertId }, { status: 201 })
    } finally { conn.release() }
  } catch (e) {
    console.error('POST /api/users', e)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}


