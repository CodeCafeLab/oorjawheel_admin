import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute('SELECT * FROM users WHERE id = ?', [params.id])
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
      await conn.execute(
        'UPDATE users SET fullName = ?, email = ?, contactNumber = ?, address = ?, country = ?, status = ?, password_hash = COALESCE(?, password_hash) WHERE id = ?',
        [body.fullName, body.email, body.contactNumber, body.address, body.country, body.status || 'active', body.password_hash || null, params.id]
      )
      return NextResponse.json({ message: 'Updated' })
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conn = await pool.getConnection()
    try {
      await conn.execute('DELETE FROM users WHERE id = ?', [params.id])
      return NextResponse.json({ message: 'Deleted' })
    } finally { conn.release() }
  } catch (e) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}


