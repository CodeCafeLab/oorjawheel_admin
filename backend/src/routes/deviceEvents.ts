import { Router } from 'express';
import pool from '../config/pool.js';

const router = Router();

// GET /device-events
router.get('/', async (req, res, next) => {
  try {
    const deviceId = req.query.device_id as string | undefined;
    const page = Number(req.query.page || '1');
    const limit = Number(req.query.limit || '100');
    const offset = (page - 1) * limit;

    let query = `SELECT SQL_CALC_FOUND_ROWS de.*, d.device_name as device
                 FROM device_events de LEFT JOIN devices d ON de.device_id = d.id WHERE 1=1`;
    const params: any[] = [];
    if (deviceId) { query += ' AND de.device_id = ?'; params.push(deviceId); }
    query += ' ORDER BY de.timestamp DESC LIMIT ? OFFSET ?';
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

// POST /device-events
router.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        'INSERT INTO device_events (device_id, event, timestamp) VALUES (?, ?, ?)',
        [b.device_id, b.event, b.timestamp || new Date()]
      );
      res.status(201).json({ message: 'Created', id: (result as any).insertId });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

export default router;


