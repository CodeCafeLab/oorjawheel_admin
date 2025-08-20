import pool from '../config/pool.js';

export async function getSections(pageId) {
  const conn = await pool.getConnection();
  try {
    let query = 'SELECT * FROM sections';
    const params = [];
    if (pageId) {
      query += ' WHERE page_id = ?';
      params.push(pageId);
    }
    query += ' ORDER BY `order` ASC';
    const [rows] = await conn.execute(query, params);
    return rows;
  } finally {
    conn.release();
  }
}

export async function createSection({ page_id, title, order = 0 }) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      'INSERT INTO sections (page_id, title, `order`) VALUES (?, ?, ?)',
      [page_id, title, order]
    );
    return { id: result.insertId };
  } finally {
    conn.release();
  }
}

export async function getSectionById(id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT * FROM sections WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function updateSection(id, { page_id, title, order = 0 }) {
  const conn = await pool.getConnection();
  try {
    await conn.execute(
      'UPDATE sections SET page_id = ?, title = ?, `order` = ? WHERE id = ?',
      [page_id, title, order, id]
    );
    return true;
  } finally {
    conn.release();
  }
}

export async function deleteSection(id) {
  const conn = await pool.getConnection();
  try {
    await conn.execute('DELETE FROM sections WHERE id = ?', [id]);
    return true;
  } finally {
    conn.release();
  }
}
