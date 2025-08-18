import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conn = await pool.getConnection()
    try {
      const [rows] = await conn.execute('SELECT * FROM devices WHERE id = ?', [params.id])
      if ((rows as any[]).length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json((rows as any[])[0])
    } finally {
      conn.release()
    }
  } catch (e) {
    console.error('GET /api/devices/:id', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const conn = await pool.getConnection()
    try {
      await conn.execute(
        'UPDATE devices SET device_name = ?, mac_address = ?, device_type = ?, user_id = ?, passcode = ?, status = ?, bt_name = ?, warranty_start = ?, default_cmd = ?, first_connected_at = ?, updated_at = NOW() WHERE id = ?',
        [
          body.device_name || body.deviceName,
          body.mac_address || body.macAddress,
          body.device_type || body.deviceType,
          body.user_id || body.userId,
          body.passcode,
          body.status,
          (body.bt_name ?? body.btName ?? ''),
          body.warranty_start || body.warrantyStart || null,
          body.default_cmd || body.defaultCmd || null,
          body.first_connected_at || body.firstConnectedAt || null,
          params.id,
        ]
      )
      return NextResponse.json({ message: 'Updated' })
    } finally {
      conn.release()
    }
  } catch (e) {
    console.error('PUT /api/devices/:id', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conn = await pool.getConnection()
    try {
      await conn.execute('DELETE FROM devices WHERE id = ?', [params.id])
      return NextResponse.json({ message: 'Deleted' })
    } finally {
      conn.release()
    }
  } catch (e) {
    console.error('DELETE /api/devices/:id', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}


