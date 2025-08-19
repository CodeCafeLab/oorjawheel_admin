import { Router } from 'express';
import pool from '../config/pool.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Number(req.query.page || '1');
    const limit = Number(req.query.limit || '50');
    const offset = (page - 1) * limit;

    let query = 'SELECT SQL_CALC_FOUND_ROWS * FROM device_masters WHERE 1=1';
    const params: any[] = [];
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (search) { query += ' AND deviceType LIKE ?'; params.push(`%${search}%`); }
    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
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

router.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        'INSERT INTO device_masters (id, deviceType, btServe, btChar, soundBtName, status, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, ?, ?, NOW(), NOW())',
        [b.deviceType, b.btServe, b.btChar, b.soundBtName, b.status]
      );
      res.status(201).json({ message: 'Created', id: (result as any).insertId });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute('SELECT * FROM device_masters WHERE id = ?', [req.params.id]);
      if ((rows as any[]).length === 0) return res.status(404).json({ error: 'Not found' });
      res.json((rows as any[])[0]);
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const b = req.body;
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        'UPDATE device_masters SET deviceType = ?, btServe = ?, btChar = ?, soundBtName = ?, status = ?, updatedAt = NOW() WHERE id = ?',
        [b.deviceType, b.btServe, b.btChar, b.soundBtName, b.status, req.params.id]
      );
      res.json({ message: 'Updated' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM device_masters WHERE id = ?', [req.params.id]);
      res.json({ message: 'Deleted' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

export default router;