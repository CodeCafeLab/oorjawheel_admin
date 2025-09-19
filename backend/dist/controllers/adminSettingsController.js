import { resolveUserId, getAdminProfileById, updateAdminProfile, changeAdminPassword, getAdminGeneralSettings, upsertAdminGeneralSettings } from '../models/adminSettingsModel.js';
export async function getAdminProfile(req, res, next) {
    try {
        const id = await resolveUserId(req);
        const data = await getAdminProfileById(id);
        res.json({ data });
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
        res.json({ message: 'Profile updated' });
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
            return res.status(400).json({ error: msg });
        }
        res.json({ message: 'Password changed' });
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
        res.json({ data });
    }
    catch (err) {
        next(err);
    }
}
export async function putAdminGeneral(req, res, next) {
    try {
        const id = await resolveUserId(req);
        await upsertAdminGeneralSettings(id, req.body || {});
        res.json({ message: 'General settings saved' });
    }
    catch (err) {
        next(err);
    }
}
