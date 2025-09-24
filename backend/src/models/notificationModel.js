import pool from '../config/pool.js';

// Get all notifications with pagination and filtering
export async function getNotifications({ 
  page = 1, 
  limit = 20, 
  status, 
  type, 
  user_id, 
  search 
} = {}) {
  try {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        n.*,
        u.fullName as user_name,
        u.email as user_email,
        creator.fullName as created_by_name,
        updater.fullName as updated_by_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN users creator ON n.created_by = creator.id
      LEFT JOIN users updater ON n.updated_by = updater.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND n.status = ?';
      params.push(status);
    }
    
    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }
    
    if (user_id) {
      query += ' AND n.user_id = ?';
      params.push(user_id);
    }
    
    if (search) {
      query += ' AND (n.title LIKE ? OR n.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY n.created_at DESC';
    
    // Get total count
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;
    
    // Get paginated results (LIMIT/OFFSET must be interpolated as numbers for MySQL)
    const safeLimit = Number(limit) || 20;
    const safeOffset = Number(offset) || 0;
    query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    
    const [rows] = await pool.execute(query, params);
    
    // Convert dates to ISO strings for proper frontend handling
    const processedRows = rows.map(row => ({
      ...row,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      scheduled_at: row.scheduled_at ? new Date(row.scheduled_at).toISOString() : null,
      sent_at: row.sent_at ? new Date(row.sent_at).toISOString() : null,
    }));
    
    return {
      data: processedRows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

// Get notification by ID
export async function getNotificationById(id) {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        n.*,
        u.fullName as user_name,
        u.email as user_email,
        creator.fullName as created_by_name,
        updater.fullName as updated_by_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN users creator ON n.created_by = creator.id
      LEFT JOIN users updater ON n.updated_by = updater.id
      WHERE n.id = ?
    `, [id]);
    
    const notification = rows[0] || null;
    
    if (notification) {
      // Convert dates to ISO strings for proper frontend handling
      return {
        ...notification,
        created_at: notification.created_at ? new Date(notification.created_at).toISOString() : null,
        updated_at: notification.updated_at ? new Date(notification.updated_at).toISOString() : null,
        scheduled_at: notification.scheduled_at ? new Date(notification.scheduled_at).toISOString() : null,
        sent_at: notification.sent_at ? new Date(notification.sent_at).toISOString() : null,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching notification by ID:', error);
    throw error;
  }
}

// Create new notification
export async function createNotification({
  title,
  description,
  user_id,
  image_url,
  type = 'info',
  status = 'draft',
  scheduled_at,
  created_by
}) {
  try {
    const [result] = await pool.execute(`
      INSERT INTO notifications (
        title, description, user_id, image_url, type, status, scheduled_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, user_id, image_url, type, status, scheduled_at, created_by]);
    
    return { id: result.insertId };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Update notification
export async function updateNotification(id, {
  title,
  description,
  user_id,
  image_url,
  type,
  status,
  scheduled_at,
  updated_by
}) {
  try {
    const fields = [];
    const values = [];
    
    if (title !== undefined) {
      fields.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
    if (user_id !== undefined) {
      fields.push('user_id = ?');
      values.push(user_id);
    }
    if (image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(image_url);
    }
    if (type !== undefined) {
      fields.push('type = ?');
      values.push(type);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (scheduled_at !== undefined) {
      fields.push('scheduled_at = ?');
      values.push(scheduled_at);
    }
    if (updated_by !== undefined) {
      fields.push('updated_by = ?');
      values.push(updated_by);
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    
    const [result] = await pool.execute(`
      UPDATE notifications 
      SET ${fields.join(', ')}
      WHERE id = ?
    `, values);
    
    return { affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
}

// Delete notification
export async function deleteNotification(id) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );
    
    return { affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// Get all users for dropdown
export async function getUsersForDropdown() {
  try {
    const [rows] = await pool.execute(`
      SELECT id, fullName, email, status
      FROM users 
      WHERE status = 'active'
      ORDER BY fullName ASC
    `);
    
    return rows;
  } catch (error) {
    console.error('Error fetching users for dropdown:', error);
    throw error;
  }
}

// Get notification statistics
export async function getNotificationStats() {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN type = 'info' THEN 1 ELSE 0 END) as info,
        SUM(CASE WHEN type = 'alert' THEN 1 ELSE 0 END) as alert,
        SUM(CASE WHEN type = 'promotion' THEN 1 ELSE 0 END) as promotion,
        SUM(CASE WHEN type = 'warning' THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN type = 'success' THEN 1 ELSE 0 END) as success
      FROM notifications
    `);
    
    return rows[0];
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
}

// Mark notification as sent
export async function markNotificationAsSent(id) {
  try {
    const [result] = await pool.execute(`
      UPDATE notifications 
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
    
    return { affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    throw error;
  }
}

// Get scheduled notifications that need to be sent
export async function getScheduledNotifications() {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM notifications 
      WHERE status = 'scheduled' 
      AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
    `);
    
    return rows;
  } catch (error) {
    console.error('Error fetching scheduled notifications:', error);
    throw error;
  }
}
