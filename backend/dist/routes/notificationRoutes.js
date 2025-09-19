import express from 'express';
import { listNotifications, getNotification, addNotification, editNotification, removeNotification, getUsers, getStats, sendNotification, getScheduled, bulkDeleteNotifications } from '../controllers/notificationController.js';
const router = express.Router();
// Get all notifications with pagination and filtering
router.get('/', listNotifications);
// Get notification statistics
router.get('/stats', getStats);
// Get users for dropdown
router.get('/users', getUsers);
// Get scheduled notifications
router.get('/scheduled', getScheduled);
// Get notification by ID
router.get('/:id', getNotification);
// Create new notification
router.post('/', addNotification);
// Send notification (mark as sent)
router.post('/:id/send', sendNotification);
// Bulk delete notifications
router.post('/bulk-delete', bulkDeleteNotifications);
// Update notification
router.put('/:id', editNotification);
// Delete notification
router.delete('/:id', removeNotification);
export default router;
