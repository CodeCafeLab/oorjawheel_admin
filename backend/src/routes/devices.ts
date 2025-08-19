import { Router } from 'express';

const router = Router();  

// GET /devices
router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const deviceType = req.query.deviceType as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Number(req.query.page || '1');
    const limit = Number(req.query.limit || '50');
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
      res.json({ data: rows, page, limit, total });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

// POST /devices
router.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        `INSERT INTO devices (device_name, mac_address, device_type, user_id, passcode, status, bt_name, warranty_start, default_cmd, first_connected_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          b.device_name || b.deviceName,
          b.mac_address || b.macAddress,
          b.device_type || b.deviceType,
          b.user_id || b.userId,
          b.passcode,
          b.status,
          b.bt_name ?? b.btName ?? '',
          b.warranty_start || b.warrantyStart || null,
          b.default_cmd || b.defaultCmd || null,
          b.first_connected_at || b.firstConnectedAt || null,
        ]
      );
      res.status(201).json({ message: 'Created', id: (result as any).insertId });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

// GET /devices/:id
router.get('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute('SELECT * FROM devices WHERE id = ?', [req.params.id]);
      if ((rows as any[]).length === 0) return res.status(404).json({ error: 'Not found' });
      res.json((rows as any[])[0]);
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

// PUT /devices/:id
router.put('/:id', async (req, res, next) => {
  try {
    const b = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `UPDATE devices SET device_name = ?, mac_address = ?, device_type = ?, user_id = ?, passcode = ?, status = ?, bt_name = ?, warranty_start = ?, default_cmd = ?, first_connected_at = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          b.device_name || b.deviceName,
          b.mac_address || b.macAddress,
          b.device_type || b.deviceType,
          b.user_id || b.userId,
          b.passcode,
          b.status,
          b.bt_name ?? b.btName ?? '',
          b.warranty_start || b.warrantyStart || null,
          b.default_cmd || b.defaultCmd || null,
          b.first_connected_at || b.firstConnectedAt || null,
          req.params.id,
        ]
      );
      res.json({ message: 'Updated' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

// DELETE /devices/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM devices WHERE id = ?', [req.params.id]);
      res.json({ message: 'Deleted' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

export default router;