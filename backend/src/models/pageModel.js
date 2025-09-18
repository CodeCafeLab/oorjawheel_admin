import pool from '../config/pool.js';

export async function getPages() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT * FROM pages ORDER BY `order` ASC'
    );
    return rows;
  } finally {
    conn.release();
  }
}

export async function createPage({ title, order = 0, is_published = 1 }) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      'INSERT INTO pages (title, `order`, is_published) VALUES (?, ?, ?)',
      [title, order, is_published]
    );
    return { id: result.insertId };
  } finally {
    conn.release();
  }
}

export async function getPageById(id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      'SELECT * FROM pages WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

export async function updatePage(id, { title, order = 0, is_published = 1 }) {
  const conn = await pool.getConnection();
  try {
    await conn.execute(
      'UPDATE pages SET title = ?, `order` = ?, is_published = ? WHERE id = ?',
      [title, order, is_published, id]
    );
    return true;
  } finally {
    conn.release();
  }
}

export async function deletePage(id) {
  const conn = await pool.getConnection();
  try {
    await conn.execute('DELETE FROM pages WHERE id = ?', [id]);
    return true;
  } finally {
    conn.release();
  }
}
