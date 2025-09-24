import { resolveUserId, getAdminProfileById, updateAdminProfile, changeAdminPassword, getAdminGeneralSettings, upsertAdminGeneralSettings, getAdminNotificationSettings, upsertAdminNotificationSettings, getAdminPasswordMeta } from '../models/adminSettingsModel.js';
export async function getAdminProfile(req, res, next) {
    try {
        const id = await resolveUserId(req);
        const data = await getAdminProfileById(id);
        res.status(200).json({ success: true, message: 'OK', data });
    }
    catch (err) {
        next(err);
    }
}
export async function putAdminProfile(req, res, next) {
    try {
        const id = await resolveUserId(req);
        const { name, email } = req.body;
        await updateAdminProfile(id, { name, email });
        res.status(200).json({ success: true, message: 'Profile updated' });
    }
    catch (err) {
        next(err);
    }
}
export async function putAdminPassword(req, res, next) {
    try {
        const id = await resolveUserId(req);
        const { oldPassword, newPassword } = req.body;
        const result = await changeAdminPassword(id, { oldPassword, newPassword });
        if (!result.ok) {
            const msg = result.reason === 'invalid_old' ? 'Old password incorrect' : 'User not found';
            return res.status(400).json({ success: false, message: msg });
        }
        res.status(200).json({ success: true, message: 'Password changed' });
    }
    catch (err) {
        next(err);
    }
}
// General per-admin
export async function getAdminGeneral(req, res, next) {
    try {
        const id = await resolveUserId(req);
        const data = await getAdminGeneralSettings(id);
        res.status(200).json({ success: true, message: 'OK', data });
    }
    catch (err) {
        next(err);
    }
}
export async function putAdminGeneral(req, res, next) {
    try {
        const id = await resolveUserId(req);
        await upsertAdminGeneralSettings(id, req.body || {});
        res.status(200).json({ success: true, message: 'General settings saved' });
    }
    catch (err) {
        next(err);
    }
}
// Notifications per-admin
export async function getAdminNotifications(req, res, next) {
    try {
        const id = await resolveUserId(req);
        const data = await getAdminNotificationSettings(id);
        res.status(200).json({ success: true, message: 'OK', data });
    }
    catch (err) {
        next(err);
    }
}
export async function putAdminNotifications(req, res, next) {
    try {
        const id = await resolveUserId(req);
        await upsertAdminNotificationSettings(id, req.body || {});
        res.status(200).json({ success: true, message: 'Notification settings saved' });
    }
    catch (err) {
        next(err);
    }
}
// Combined: profile, password meta, notifications, general
export async function getAllAdminSettings(req, res, next) {
    try {
        const id = await resolveUserId(req);
        const results = await Promise.allSettled([
            getAdminProfileById(id),
            getAdminPasswordMeta(id),
            getAdminGeneralSettings(id),
            getAdminNotificationSettings(id)
        ]);
        const [profileRes, passwordRes, generalRes, notificationsRes] = results;
        const data = {
            profile: profileRes.status === 'fulfilled' ? profileRes.value : null,
            password: passwordRes.status === 'fulfilled' ? passwordRes.value : null,
            general: generalRes.status === 'fulfilled' ? generalRes.value : null,
            notifications: notificationsRes.status === 'fulfilled' ? notificationsRes.value : null
        };
        const errors = results
            .map((r, idx) => ({ idx, r }))
            .filter(x => x.r.status === 'rejected')
            .map(x => ({ part: ['profile', 'password', 'general', 'notifications'][x.idx], message: String(x.r.reason?.message || x.r.reason) }));
        res.status(200).json({ success: true, message: errors.length ? 'Partial OK' : 'OK', data, errors: errors.length ? errors : undefined });
    }
    catch (err) {
        next(err);
    }
}
