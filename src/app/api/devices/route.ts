import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const conn = await pool.getConnection();
    try {
      const [res] = await conn.execute(
        'INSERT INTO devices (device_name, mac_address, device_type, user_id, passcode, status, bt_name, warranty_start, default_cmd, first_connected_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
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
        ]
      );
      const insertId = (res as any).insertId;
      return NextResponse.json({ message: 'Device created', id: insertId }, { status: 201 });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('API POST /devices error:', error);
    return NextResponse.json({ error: 'Failed to add device.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Device ID is required for update.' }, { status: 400 });
    }
    const conn = await pool.getConnection();
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
          body.id,
        ]
      );
      return NextResponse.json({ message: 'Device updated' }, { status: 200 });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('API PUT /devices error:', error);
    return NextResponse.json({ error: 'Failed to update device.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Device ID is required for deletion.' }, { status: 400 });
    }
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM devices WHERE id = ?', [body.id]);
      return NextResponse.json({ message: 'Device deleted' }, { status: 200 });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('API DELETE /devices error:', error);
    return NextResponse.json({ error: 'Failed to delete device.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const deviceType = searchParams.get('deviceType');
    const search = searchParams.get('search');
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    let query = 'SELECT SQL_CALC_FOUND_ROWS * FROM devices WHERE 1=1';
    const params: any[] = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (deviceType) { query += ' AND device_type = ?'; params.push(deviceType); }
    if (search) { query += ' AND (device_name LIKE ? OR mac_address LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(query, params);
      const [countRows] = await conn.query('SELECT FOUND_ROWS() as total');
      const total = (countRows as any[])[0]?.total ?? 0;
      return NextResponse.json({ data: rows, page, limit, total });
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error('API GET /devices error:', e);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
