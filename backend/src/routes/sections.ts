import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const pageId = req.query.page_id as string | undefined;
    const conn = await pool.getConnection();
    try {
      let query = 'SELECT * FROM sections';
      const params: any[] = [];
      if (pageId) { query += ' WHERE page_id = ?'; params.push(pageId); }
      query += ' ORDER BY `order` ASC';
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
      const [result] = await conn.execute('INSERT INTO sections (page_id, title, `order`) VALUES (?, ?, ?)', [b.page_id, b.title, b.order ?? 0]);
      res.status(201).json({ message: 'Created', id: (result as any).insertId });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute('SELECT * FROM sections WHERE id = ?', [req.params.id]);
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
      await conn.execute('UPDATE sections SET page_id = ?, title = ?, `order` = ? WHERE id = ?', [b.page_id, b.title, b.order ?? 0, req.params.id]);
      res.json({ message: 'Updated' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM sections WHERE id = ?', [req.params.id]);
      res.json({ message: 'Deleted' });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

export default router;


