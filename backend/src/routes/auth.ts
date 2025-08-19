import { Router } from 'express';
import pool from './../config/db.js';
import bcrypt from 'bcryptjs';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const conn = await pool.getConnection();
    try {
      // Try users first, then fallback to admins if not found
      let user: any | null = null;
      const [userRows] = await conn.execute('SELECT id, email, password_hash, status FROM users WHERE email = ?', [email]);
      if ((userRows as any[]).length > 0) {
        user = (userRows as any[])[0];
      } else {
        const [adminRows] = await conn.execute('SELECT id, email, password_hash, role as status FROM admins WHERE email = ?', [email]);
        if ((adminRows as any[]).length > 0) user = (adminRows as any[])[0];
      }

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, user.password_hash || '');
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      res.json({ message: 'Logged in', user: { id: user.id, email: user.email, status: user.status } });
    } finally { conn.release(); }
  } catch (e) { next(e); }
});

export default router;