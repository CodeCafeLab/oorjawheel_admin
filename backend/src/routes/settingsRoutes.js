import { Router } from 'express';
import { authMiddleware } from '../utils/jwt.js';
import {
  getAdminProfile,
  putAdminProfile,
  putAdminPassword,
  getAdminGeneral,
  putAdminGeneral,
  getAdminNotifications,
  putAdminNotifications,
  getAllAdminSettings
} from '../controllers/adminSettingsController.js';

const router = Router();

// Combined
router.get('/all', authMiddleware, getAllAdminSettings);

// Individual
router.get('/profile', authMiddleware, getAdminProfile);
router.put('/profile', authMiddleware, putAdminProfile);
router.put('/password', authMiddleware, putAdminPassword);
router.get('/general', authMiddleware, getAdminGeneral);
router.put('/general', authMiddleware, putAdminGeneral);
router.get('/notifications', authMiddleware, getAdminNotifications);
router.put('/notifications', authMiddleware, putAdminNotifications);

export default router;



