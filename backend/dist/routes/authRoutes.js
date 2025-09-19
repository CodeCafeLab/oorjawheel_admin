import { Router } from 'express';
import { login, registerAdmin, getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../utils/jwt.js';
const router = Router();
// Public routes
router.post('/login', login);
router.post('/register', registerAdmin);
// Protected routes (require authentication)
router.get('/me', authMiddleware, getCurrentUser);
export default router;
