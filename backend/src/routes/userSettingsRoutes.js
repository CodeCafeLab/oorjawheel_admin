import { Router } from 'express';
import { postAllUserSettings, putUserProfile, putUserPassword, getAllUserSettings } from '../controllers/userSettingsController.js';
import { authMiddleware } from '../utils/jwt.js';

const router = Router();

// Public-friendly endpoint to save all user settings tabs
router.post('/all', authMiddleware, postAllUserSettings);
router.put('/profile', authMiddleware, putUserProfile);
router.put('/password', authMiddleware, putUserPassword);
router.get('/all', authMiddleware, getAllUserSettings);

export default router;


