import { getNotifications, getNotificationById, createNotification, updateNotification, deleteNotification, getUsersForDropdown, getNotificationStats, markNotificationAsSent, getScheduledNotifications } from '../models/notificationModel.js';
import { sendFcmMessage } from '../services/fcmService.js';
// Get all notifications with pagination and filtering
export async function listNotifications(req, res, next) {
    try {
        const { page = 1, limit = 20, status, type, user_id, search } = req.query;
        const result = await getNotifications({
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
            status,
            type,
            user_id: user_id ? parseInt(user_id, 10) || null : null,
            search
        });
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    }
    catch (error) {
        next(error);
    }
}
// Get notification by ID
export async function getNotification(req, res, next) {
    try {
        const notification = await getNotificationById(req.params.id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        res.json({
            success: true,
            data: notification
        });
    }
    catch (error) {
        next(error);
    }
}
// Create new notification
export async function addNotification(req, res, next) {
    try {
        const { title, description, user_id, image_url, type = 'info', status = 'draft', scheduled_at } = req.body;
        // Validation
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }
        if (user_id && isNaN(parseInt(user_id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const validTypes = ['info', 'alert', 'promotion', 'warning', 'success'];
        if (type && !validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification type'
            });
        }
        const validStatuses = ['draft', 'scheduled', 'sent', 'failed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification status'
            });
        }
        const result = await createNotification({
            title: title.trim(),
            description: description?.trim() || null,
            user_id: user_id ? parseInt(user_id) : null,
            image_url: image_url?.trim() || null,
            type,
            status,
            scheduled_at: scheduled_at || null,
            created_by: req.user?.id || 1 // Default to admin user if no auth
        });
        // If status is 'sent' (immediate), send the notification right away
        if (status === 'sent') {
            try {
                const tokenFromBody = req.body?.token;
                const fallbackToken = process.env.TEST_FCM_TOKEN || null;
                const token = tokenFromBody || fallbackToken;
                if (token) {
                    const isImage = Boolean(image_url);
                    const fcmType = isImage ? 'image' : 'text';
                    const fcmTitle = title.trim();
                    const fcmDescription = description?.trim() || '';
                    const fcmImage = image_url?.trim() || undefined;
                    await sendFcmMessage({ type: fcmType, title: fcmTitle, description: fcmDescription, image: fcmImage, token });
                    await markNotificationAsSent(result.id);
                }
                else {
                    console.error('No FCM token available for immediate notification');
                }
            }
            catch (fcmError) {
                console.error('Failed to send immediate notification:', fcmError);
                // Don't fail the creation, just log the error
            }
        }
        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: { id: result.id }
        });
    }
    catch (error) {
        next(error);
    }
}
// Update notification
export async function editNotification(req, res, next) {
    try {
        const { id } = req.params;
        const { title, description, user_id, image_url, type, status, scheduled_at } = req.body;
        // Check if notification exists
        const existingNotification = await getNotificationById(id);
        if (!existingNotification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        // Validation
        if (title !== undefined && (!title || title.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: 'Title cannot be empty'
            });
        }
        if (user_id !== undefined && user_id !== null && isNaN(parseInt(user_id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }
        const validTypes = ['info', 'alert', 'promotion', 'warning', 'success'];
        if (type && !validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification type'
            });
        }
        const validStatuses = ['draft', 'scheduled', 'sent', 'failed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification status'
            });
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title.trim();
        if (description !== undefined)
            updateData.description = description?.trim() || null;
        if (user_id !== undefined)
            updateData.user_id = user_id ? parseInt(user_id) : null;
        if (image_url !== undefined)
            updateData.image_url = image_url?.trim() || null;
        if (type !== undefined)
            updateData.type = type;
        if (status !== undefined)
            updateData.status = status;
        if (scheduled_at !== undefined)
            updateData.scheduled_at = scheduled_at || null;
        updateData.updated_by = req.user?.id || 1;
        const result = await updateNotification(id, updateData);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found or no changes made'
            });
        }
        // If status is being updated to 'sent' (immediate), send the notification right away
        if (status === 'sent') {
            try {
                const tokenFromBody = req.body?.token;
                const fallbackToken = process.env.TEST_FCM_TOKEN || null;
                const token = tokenFromBody || fallbackToken;
                if (token) {
                    const notification = await getNotificationById(id);
                    if (notification) {
                        const isImage = Boolean(notification.image_url);
                        const fcmType = isImage ? 'image' : 'text';
                        const fcmTitle = notification.title;
                        const fcmDescription = notification.description || '';
                        const fcmImage = notification.image_url || undefined;
                        await sendFcmMessage({ type: fcmType, title: fcmTitle, description: fcmDescription, image: fcmImage, token });
                        await markNotificationAsSent(id);
                    }
                }
                else {
                    console.error('No FCM token available for immediate notification');
                }
            }
            catch (fcmError) {
                console.error('Failed to send immediate notification:', fcmError);
                // Don't fail the update, just log the error
            }
        }
        res.json({
            success: true,
            message: 'Notification updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
}
// Delete notification
export async function removeNotification(req, res, next) {
    try {
        const { id } = req.params;
        const result = await deleteNotification(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
}
// Get users for dropdown
export async function getUsers(req, res, next) {
    try {
        const users = await getUsersForDropdown();
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        next(error);
    }
}
// Get notification statistics
export async function getStats(req, res, next) {
    try {
        const stats = await getNotificationStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
}
// Send notification (mark as sent)
export async function sendNotification(req, res, next) {
    try {
        const { id } = req.params;
        // Check if notification exists
        const notification = await getNotificationById(id);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }
        if (notification.status === 'sent') {
            return res.status(400).json({
                success: false,
                message: 'Notification has already been sent'
            });
        }
        // Resolve FCM token
        const tokenFromBody = req.body?.token;
        const fallbackToken = process.env.TEST_FCM_TOKEN || null;
        const token = tokenFromBody || fallbackToken;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Missing FCM token. Provide in body.token or set TEST_FCM_TOKEN' });
        }
        // Map current notification shape to FCM payload
        const isImage = Boolean(notification.image_url);
        const type = isImage ? 'image' : 'text';
        const title = notification.title;
        const description = notification.description || '';
        const image = notification.image_url || undefined;
        try {
            await sendFcmMessage({ type, title, description, image, token });
            await markNotificationAsSent(id);
        }
        catch (err) {
            return res.status(502).json({ success: false, message: 'Failed to send via FCM', error: err.message });
        }
        res.json({
            success: true,
            message: 'Notification sent successfully'
        });
    }
    catch (error) {
        next(error);
    }
}
// Get scheduled notifications (for cron job or manual processing)
export async function getScheduled(req, res, next) {
    try {
        const notifications = await getScheduledNotifications();
        res.json({
            success: true,
            data: notifications
        });
    }
    catch (error) {
        next(error);
    }
}
// Bulk delete notifications
export async function bulkDeleteNotifications(req, res, next) {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'IDs array is required'
            });
        }
        // Validate all IDs are numbers
        const validIds = ids.filter(id => !isNaN(parseInt(id)));
        if (validIds.length !== ids.length) {
            return res.status(400).json({
                success: false,
                message: 'All IDs must be valid numbers'
            });
        }
        let deletedCount = 0;
        for (const id of validIds) {
            const result = await deleteNotification(id);
            if (result.affectedRows > 0) {
                deletedCount++;
            }
        }
        res.json({
            success: true,
            message: `${deletedCount} notifications deleted successfully`
        });
    }
    catch (error) {
        next(error);
    }
}
