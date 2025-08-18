import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { comparePassword } from '@/lib/hash'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute('SELECT * FROM admins WHERE email = ?', [email])
      if ((rows as any[]).length === 0) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      const admin = (rows as any[])[0]
      const ok = await comparePassword(password, admin.password_hash)
      if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      const session = await getSession()
      session.email = admin.email
      session.isLoggedIn = true
      await session.save()
      return NextResponse.json({ message: 'Logged in', role: admin.role })
    } finally { conn.release() }
  } catch (e) {
    console.error('POST /api/auth/login', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


