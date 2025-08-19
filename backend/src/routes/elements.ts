import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const sectionId = req.query.section_id as string | undefined;
    const conn = await pool.getConnection();
    try {
      let query = 'SELECT * FROM elements';
      const params: any[] = [];
      if (sectionId) { query += ' WHERE section_id = ?'; params.push(sectionId); }
      const [rows] = await conn.execute(query, params);
      res.json(rows);
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute('INSERT INTO elements (section_id, type, label, payload) VALUES (?, ?, ?, ?)', [b.section_id, b.type, b.label, JSON.stringify(b.payload ?? {})]);
      res.status(201).json({ message: 'Created', id: (result as any).insertId });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute('SELECT * FROM elements WHERE id = ?', [req.params.id]);
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
      await conn.execute('UPDATE elements SET section_id = ?, type = ?, label = ?, payload = ? WHERE id = ?', [b.section_id, b.type, b.label, JSON.stringify(b.payload ?? {}), req.params.id]);
      res.json({ message: 'Updated' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM elements WHERE id = ?', [req.params.id]);
      res.json({ message: 'Deleted' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

export default router;


