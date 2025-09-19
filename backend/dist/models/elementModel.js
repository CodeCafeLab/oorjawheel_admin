import pool from '../config/pool.js';
export async function getElements(sectionId) {
    const conn = await pool.getConnection();
    try {
        let query = 'SELECT * FROM elements';
        const params = [];
        if (sectionId) {
            query += ' WHERE section_id = ?';
            params.push(sectionId);
        }
        const [rows] = await conn.execute(query, params);
        return rows;
    }
    finally {
        conn.release();
    }
}
export async function createElement({ section_id, type, label, payload = {} }) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute(`INSERT INTO elements (section_id, type, label, payload) 
       VALUES (?, ?, ?, ?)`, [section_id, type, label, JSON.stringify(payload)]);
        return { id: result.insertId };
    }
    finally {
        conn.release();
    }
}
export async function getElementById(id) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT * FROM elements WHERE id = ?', [id]);
        return rows[0] || null;
    }
    finally {
        conn.release();
    }
}
export async function updateElement(id, { section_id, type, label, payload = {} }) {
    const conn = await pool.getConnection();
    try {
        await conn.execute(`UPDATE elements 
       SET section_id = ?, type = ?, label = ?, payload = ? 
       WHERE id = ?`, [section_id, type, label, JSON.stringify(payload), id]);
        return true;
    }
    finally {
        conn.release();
    }
}
export async function deleteElement(id) {
    const conn = await pool.getConnection();
    try {
        await conn.execute('DELETE FROM elements WHERE id = ?', [id]);
        return true;
    }
    finally {
        conn.release();
    }
}
