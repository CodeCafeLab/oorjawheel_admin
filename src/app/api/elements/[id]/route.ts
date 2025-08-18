import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute('SELECT * FROM elements WHERE id = ?', [params.id])
      if ((rows as any[]).length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json((rows as any[])[0])
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const conn = await pool.getConnection()
    try {
      await conn.execute('UPDATE elements SET section_id = ?, type = ?, label = ?, payload = ? WHERE id = ?', [body.section_id, body.type, body.label, JSON.stringify(body.payload ?? {}), params.id])
      return NextResponse.json({ message: 'Updated' })
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conn = await pool.getConnection()
    try {
      await conn.execute('DELETE FROM elements WHERE id = ?', [params.id])
      return NextResponse.json({ message: 'Deleted' })
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}


