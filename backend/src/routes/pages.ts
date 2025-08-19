import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute('SELECT * FROM pages ORDER BY `order` ASC');
      res.json(rows);
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const b = req.body;
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute('INSERT INTO pages (title, `order`, is_published) VALUES (?, ?, ?)', [b.title, b.order ?? 0, b.is_published ?? 1]);
      res.status(201).json({ message: 'Created', id: (result as any).insertId });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute('SELECT * FROM pages WHERE id = ?', [req.params.id]);
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
      await conn.execute('UPDATE pages SET title = ?, `order` = ?, is_published = ? WHERE id = ?', [b.title, b.order ?? 0, b.is_published ?? 1, req.params.id]);
      res.json({ message: 'Updated' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM pages WHERE id = ?', [req.params.id]);
      res.json({ message: 'Deleted' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

export default router;


