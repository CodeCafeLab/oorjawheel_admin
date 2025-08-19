import bcrypt from 'bcryptjs';
import { findUserByEmail, findAdminByEmail } from '../models/authModel.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    let user = await findUserByEmail(email);
    if (!user) {
      user = await findAdminByEmail(email);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash || '');
    if (!passwordOk) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: 'Logged in',
      user: { id: user.id, email: user.email, status: user.status },
    });
  } catch (err) {
    next(err);
  }
}
