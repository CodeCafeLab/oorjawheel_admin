import pool from '../config/pool.js';

export async function upsertUserGeneralSettings(userId, payload = {}) {
  const conn = await pool.getConnection();
  try {
    const fields = [
      'display_name','avatar_url','country','language','timezone','marketing_opt_in'
    ];
    const normalized = {
      display_name: payload?.display_name ?? null,
      avatar_url: payload?.avatar_url ?? null,
      country: payload?.country ?? null,
      language: payload?.language ?? null,
      timezone: payload?.timezone ?? null,
      marketing_opt_in: payload?.marketing_opt_in ? 1 : 0,
    };
    const values = fields.map(k => normalized[k]);

    await conn.execute(
      `INSERT INTO user_general_settings (user_id, ${fields.join(',')}) VALUES (?, ${fields.map(()=>'?').join(',')})
       ON DUPLICATE KEY UPDATE ${fields.map(f=>`${f}=VALUES(${f})`).join(', ')}`,
      [userId, ...values]
    );
    return true;
  } finally {
    conn.release();
  }
}

export async function upsertUserNotificationSettings(userId, payload = {}) {
  const conn = await pool.getConnection();
  try {
    const fields = [
      'email_enabled','push_enabled','sms_enabled','fcm_token','device_platform'
    ];
    const normalized = {
      email_enabled: payload?.email_enabled ? 1 : 0,
      push_enabled: payload?.push_enabled ? 1 : 0,
      sms_enabled: payload?.sms_enabled ? 1 : 0,
      fcm_token: payload?.fcm_token ?? null,
      device_platform: payload?.device_platform ?? null,
    };
    const values = fields.map(k => normalized[k]);

    await conn.execute(
      `INSERT INTO user_notification_settings (user_id, ${fields.join(',')}) VALUES (?, ${fields.map(()=>'?').join(',')})
       ON DUPLICATE KEY UPDATE ${fields.map(f=>`${f}=VALUES(${f})`).join(', ')}`,
      [userId, ...values]
    );
    return true;
  } finally {
    conn.release();
  }
}

export async function getUserGeneralSettings(userId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute('SELECT * FROM user_general_settings WHERE user_id = ? LIMIT 1', [userId]);
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function getUserNotificationSettings(userId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute('SELECT * FROM user_notification_settings WHERE user_id = ? LIMIT 1', [userId]);
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function saveAllUserSettings(userId, { general, notifications } = {}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Use the same connection for consistency
    const doGeneral = async () => {
      const fields = ['display_name','avatar_url','country','language','timezone','marketing_opt_in'];
      const normalized = {
        display_name: general?.display_name ?? null,
        avatar_url: general?.avatar_url ?? null,
        country: general?.country ?? null,
        language: general?.language ?? null,
        timezone: general?.timezone ?? null,
        marketing_opt_in: general?.marketing_opt_in ? 1 : 0,
      };
      const values = fields.map(k => normalized[k]);
      await conn.execute(
        `INSERT INTO user_general_settings (user_id, ${fields.join(',')}) VALUES (?, ${fields.map(()=>'?').join(',')})
         ON DUPLICATE KEY UPDATE ${fields.map(f=>`${f}=VALUES(${f})`).join(', ')}`,
        [userId, ...values]
      );
    };

    const doNotifications = async () => {
      const fields = ['email_enabled','push_enabled','sms_enabled','fcm_token','device_platform'];
      const normalized = {
        email_enabled: notifications?.email_enabled ? 1 : 0,
        push_enabled: notifications?.push_enabled ? 1 : 0,
        sms_enabled: notifications?.sms_enabled ? 1 : 0,
        fcm_token: notifications?.fcm_token ?? null,
        device_platform: notifications?.device_platform ?? null,
      };
      const values = fields.map(k => normalized[k]);
      await conn.execute(
        `INSERT INTO user_notification_settings (user_id, ${fields.join(',')}) VALUES (?, ${fields.map(()=>'?').join(',')})
         ON DUPLICATE KEY UPDATE ${fields.map(f=>`${f}=VALUES(${f})`).join(', ')}`,
        [userId, ...values]
      );
    };

    await doGeneral();
    await doNotifications();

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}


