import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('page_id')
    const conn = await pool.getConnection()
    try {
      let query = 'SELECT * FROM sections'
      const params: any[] = []
      if (pageId) { query += ' WHERE page_id = ?'; params.push(pageId) }
      query += ' ORDER BY `order` ASC'
      const [rows] = await conn.execute(query, params)
      return NextResponse.json(rows)
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const conn = await pool.getConnection()
    try {
      const [res] = await conn.execute('INSERT INTO sections (page_id, title, `order`) VALUES (?, ?, ?)', [body.page_id, body.title, body.order ?? 0])
      return NextResponse.json({ message: 'Created', id: (res as any).insertId }, { status: 201 })
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}


