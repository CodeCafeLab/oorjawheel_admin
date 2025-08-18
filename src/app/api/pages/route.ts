import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute('SELECT * FROM pages ORDER BY `order` ASC')
      return NextResponse.json(rows)
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const conn = await pool.getConnection()
    try {
      const [res] = await conn.execute('INSERT INTO pages (title, `order`, is_published) VALUES (?, ?, ?)', [body.title, body.order ?? 0, body.is_published ?? 1])
      return NextResponse.json({ message: 'Created', id: (res as any).insertId }, { status: 201 })
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}


