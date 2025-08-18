import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('section_id')
    const conn = await pool.getConnection()
    try {
      let query = 'SELECT * FROM elements'
      const params: any[] = []
      if (sectionId) { query += ' WHERE section_id = ?'; params.push(sectionId) }
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
      const [res] = await conn.execute('INSERT INTO elements (section_id, type, label, payload) VALUES (?, ?, ?, ?)', [body.section_id, body.type, body.label, JSON.stringify(body.payload ?? {})])
      return NextResponse.json({ message: 'Created', id: (res as any).insertId }, { status: 201 })
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}


