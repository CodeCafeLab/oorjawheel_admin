import pool from '../config/pool.js';
import bcrypt from 'bcryptjs';
async function getAnyAdminId() {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT id FROM admins ORDER BY id ASC LIMIT 1');
        return rows[0]?.id ?? null;
    }
    finally {
        conn.release();
    }
}
export async function resolveUserId(req) {
    if (req?.user?.id)
        return req.user.id;
    // This should not happen in production with proper auth middleware
    throw new Error('User not authenticated');
}
export async function getAdminProfileById(userId) {
    const conn = await pool.getConnection();
    try {
        try {
            const [rows] = await conn.execute('SELECT id, email, name FROM admins WHERE id = ? LIMIT 1', [userId]);
            return rows[0] || null;
        }
        catch (err) {
            // Fallback when admins table has no `name` column
            if (/(Unknown column 'name'|ER_BAD_FIELD_ERROR)/.test(String(err?.message))) {
                const [rows] = await conn.execute('SELECT id, email FROM admins WHERE id = ? LIMIT 1', [userId]);
                const row = rows[0];
                return row ? { ...row, name: null } : null;
            }
            throw err;
        }
    }
    finally {
        conn.release();
    }
}
export async function updateAdminProfile(userId, { name, email }) {
    const conn = await pool.getConnection();
    try {
        // Try to update both name and email (assumes name column exists)
        await conn.execute('UPDATE admins SET name = ?, email = ? WHERE id = ?', [name ?? null, email, userId]);
        return true;
    }
    catch (err) {
        // Fallback: update only email if name column not present
        if (/(Unknown column 'name'|ER_BAD_FIELD_ERROR)/.test(String(err?.message))) {
            await conn.execute('UPDATE admins SET email = ? WHERE id = ?', [email, userId]);
            return true;
        }
        throw err;
    }
    finally {
        conn.release();
    }
}
export async function changeAdminPassword(userId, { oldPassword, newPassword }) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT password_hash FROM admins WHERE id = ?', [userId]);
        const hash = rows[0]?.password_hash;
        if (!hash)
            return { ok: false, reason: 'not_found' };
        const ok = await bcrypt.compare(oldPassword, hash);
        if (!ok)
            return { ok: false, reason: 'invalid_old' };
        const newHash = await bcrypt.hash(newPassword, 10);
        await conn.execute('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, userId]);
        return { ok: true };
    }
    finally {
        conn.release();
    }
}
// General settings per admin
export async function getAdminGeneralSettings(userId) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT * FROM admin_general_settings WHERE admin_id = ? LIMIT 1', [userId]);
        return rows[0] || null;
    }
    finally {
        conn.release();
    }
}
export async function upsertAdminGeneralSettings(userId, payload) {
    const conn = await pool.getConnection();
    try {
        const fields = [
            'site_name', 'official_email', 'app_logo_url', 'app_icon_url', 'admin_logo_url', 'admin_icon_url', 'play_store_link', 'app_store_link', 'support_number', 'whatsapp_number', 'facebook_link', 'instagram_link', 'website_link'
        ];
        const values = fields.map(k => payload?.[k] ?? null);
        await conn.execute(`INSERT INTO admin_general_settings (admin_id, ${fields.join(',')}) VALUES (?, ${fields.map(() => '?').join(',')})
       ON DUPLICATE KEY UPDATE ${fields.map(f => `${f}=VALUES(${f})`).join(', ')}`, [userId, ...values]);
        return true;
    }
    finally {
        conn.release();
    }
}
// Notification settings per admin
export async function getAdminNotificationSettings(userId) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT * FROM admin_notification_settings WHERE admin_id = ? LIMIT 1', [userId]);
        return rows[0] || null;
    }
    finally {
        conn.release();
    }
}
export async function upsertAdminNotificationSettings(userId, payload) {
    const conn = await pool.getConnection();
    try {
        const fields = [
            'email_enabled', 'push_enabled', 'firebase_project_id', 'firebase_api_key', 'firebase_auth_domain', 'firebase_storage_bucket', 'firebase_sender_id', 'firebase_project_number', 'firebase_app_id', 'firebase_measurement_id', 'firebase_vapid_key'
        ];
        // Coerce booleans to 0/1 and default to 0 if undefined
        const normalized = {
            email_enabled: payload?.email_enabled ? 1 : 0,
            push_enabled: payload?.push_enabled ? 1 : 0,
            firebase_project_id: payload?.firebase_project_id ?? null,
            firebase_api_key: payload?.firebase_api_key ?? null,
            firebase_auth_domain: payload?.firebase_auth_domain ?? null,
            firebase_storage_bucket: payload?.firebase_storage_bucket ?? null,
            firebase_sender_id: payload?.firebase_sender_id ?? payload?.firebase_project_number ?? '',
            firebase_project_number: payload?.firebase_project_number ?? payload?.firebase_sender_id ?? '',
            firebase_app_id: payload?.firebase_app_id ?? null,
            firebase_measurement_id: payload?.firebase_measurement_id ?? null,
            firebase_vapid_key: payload?.firebase_vapid_key ?? null,
        };
        const values = fields.map(k => normalized[k]);
        await conn.execute(`INSERT INTO admin_notification_settings (admin_id, ${fields.join(',')}) VALUES (?, ${fields.map(() => '?').join(',')})
       ON DUPLICATE KEY UPDATE ${fields.map(f => `${f}=VALUES(${f})`).join(', ')}`, [userId, ...values]);
        return true;
    }
    finally {
        conn.release();
    }
}
