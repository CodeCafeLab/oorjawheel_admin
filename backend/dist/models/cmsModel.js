import pool from '../config/pool.js';
// Content Types
export async function getContentTypes() {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(`
      SELECT ct.*, 
        COUNT(ci.id) as content_count,
        COUNT(ctf.id) as field_count
      FROM content_types ct
      LEFT JOIN content_items ci ON ct.id = ci.content_type_id AND ci.status = 'published'
      LEFT JOIN content_type_fields ctf ON ct.id = ctf.content_type_id
      WHERE ct.is_active = TRUE
      GROUP BY ct.id
      ORDER BY ct.name
    `);
        return rows;
    }
    finally {
        conn.release();
    }
}
export async function createContentType({ name, slug, description, icon }) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute('INSERT INTO content_types (name, slug, description, icon) VALUES (?, ?, ?, ?)', [name, slug, description, icon]);
        return { id: result.insertId };
    }
    finally {
        conn.release();
    }
}
export async function getContentTypeById(id) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT * FROM content_types WHERE id = ? AND is_active = TRUE', [id]);
        return rows[0] || null;
    }
    finally {
        conn.release();
    }
}
export async function getContentTypeWithFields(id) {
    const conn = await pool.getConnection();
    try {
        const [contentType] = await conn.execute('SELECT * FROM content_types WHERE id = ? AND is_active = TRUE', [id]);
        if (!contentType[0])
            return null;
        const [fields] = await conn.execute(`
      SELECT ctf.*, ft.name as field_type_name, ft.component, ft.validation_rules as default_validation
      FROM content_type_fields ctf
      JOIN field_types ft ON ctf.field_type_id = ft.id
      WHERE ctf.content_type_id = ?
      ORDER BY ctf.field_order, ctf.id
    `, [id]);
        return {
            ...contentType[0],
            fields
        };
    }
    finally {
        conn.release();
    }
}
// Content Type Fields
export async function addFieldToContentType({ content_type_id, field_type_id, name, label, slug, description, is_required, is_unique, field_order, validation_rules, field_config }) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute(`
      INSERT INTO content_type_fields 
      (content_type_id, field_type_id, name, label, slug, description, is_required, is_unique, field_order, validation_rules, field_config)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [content_type_id, field_type_id, name, label, slug, description, is_required, is_unique, field_order, JSON.stringify(validation_rules), JSON.stringify(field_config)]);
        return { id: result.insertId };
    }
    finally {
        conn.release();
    }
}
// Content Items
export async function getContentItems({ content_type_id, status, page = 1, limit = 20, search }) {
    const conn = await pool.getConnection();
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        if (content_type_id) {
            whereClause += ' AND ci.content_type_id = ?';
            params.push(content_type_id);
        }
        if (status) {
            whereClause += ' AND ci.status = ?';
            params.push(status);
        }
        if (search) {
            whereClause += ' AND (ci.title LIKE ? OR ci.excerpt LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        const offset = (page - 1) * limit;
        const [rows] = await conn.execute(`
      SELECT ci.*, ct.name as content_type_name, ct.slug as content_type_slug,
        COUNT(*) OVER() as total_count
      FROM content_items ci
      JOIN content_types ct ON ci.content_type_id = ct.id
      ${whereClause}
      ORDER BY ci.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
        return {
            items: rows,
            total: rows[0]?.total_count || 0,
            page,
            limit,
            totalPages: Math.ceil((rows[0]?.total_count || 0) / limit)
        };
    }
    finally {
        conn.release();
    }
}
// Get content items by category
export async function getContentItemsByCategory({ category_id, status = 'published', search }) {
    const conn = await pool.getConnection();
    try {
        // Build filters
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (category_id) {
            whereClause += ' AND cc.category_id = ?';
            params.push(Number(category_id));
        }
        // content_items table supports status
        const ciStatusClause = status ? ' AND ci.status = ?' : '';
        const ciStatusParams = status ? [status] : [];
        if (search) {
            whereClause += ' AND (ci.title LIKE ? OR ci.excerpt LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        // Query from content_items (normalized fields)
        const [contentItems] = await conn.execute(`SELECT 
         ci.id,
         ci.title,
         ci.excerpt AS description,
         NULL AS command,
         ct.name AS content_type_name,
         ct.slug AS content_type_slug,
         'content_item' AS source,
         ci.created_at
       FROM content_items ci
       JOIN content_types ct ON ci.content_type_id = ct.id
       JOIN content_categories cc ON cc.content_item_id = ci.id
       ${whereClause}${ciStatusClause}
       ORDER BY ci.created_at DESC`, [...params, ...ciStatusParams]);
        // Query from pages (your data seems to be stored here). We reuse category link table.
        let pagesWhere = 'WHERE 1=1';
        const pagesParams = [];
        if (category_id) {
            pagesWhere += ' AND cc.category_id = ?';
            pagesParams.push(Number(category_id));
        }
        if (search) {
            pagesWhere += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            pagesParams.push(`%${search}%`, `%${search}%`);
        }
        const [pages] = await conn.execute(`SELECT 
         p.id,
         p.title,
         p.description,
         p.command,
         NULL AS content_type_name,
         NULL AS content_type_slug,
         'page' AS source,
         p.created_at
       FROM pages p
       JOIN content_categories cc ON cc.content_item_id = p.id
       ${pagesWhere}
       ORDER BY p.created_at DESC`, pagesParams);
        // Merge results with pages first (to match your current data usage)
        return [...pages, ...contentItems];
    }
    finally {
        conn.release();
    }
}
export async function createContentItem({ content_type_id, title, slug, status, featured_image, excerpt, meta_title, meta_description, author_id, fieldValues }) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        // Create content item
        const [result] = await conn.execute(`
      INSERT INTO content_items 
      (content_type_id, title, slug, status, featured_image, excerpt, meta_title, meta_description, author_id, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [content_type_id, title, slug, status, featured_image, excerpt, meta_title, meta_description, author_id, status === 'published' ? new Date() : null]);
        const contentItemId = result.insertId;
        // Insert field values
        if (fieldValues && fieldValues.length > 0) {
            for (const fieldValue of fieldValues) {
                await conn.execute(`
          INSERT INTO content_field_values 
          (content_item_id, content_type_field_id, value_text, value_number, value_date, value_boolean, value_json)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
                    contentItemId,
                    fieldValue.content_type_field_id,
                    fieldValue.value_text || null,
                    fieldValue.value_number || null,
                    fieldValue.value_date || null,
                    fieldValue.value_boolean || null,
                    fieldValue.value_json ? JSON.stringify(fieldValue.value_json) : null
                ]);
            }
        }
        await conn.commit();
        return { id: contentItemId };
    }
    catch (error) {
        await conn.rollback();
        throw error;
    }
    finally {
        conn.release();
    }
}
export async function getContentItemById(id) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(`
      SELECT ci.*, ct.name as content_type_name, ct.slug as content_type_slug
      FROM content_items ci
      JOIN content_types ct ON ci.content_type_id = ct.id
      WHERE ci.id = ?
    `, [id]);
        if (!rows[0])
            return null;
        // Get field values
        const [fieldValues] = await conn.execute(`
      SELECT cfv.*, ctf.name as field_name, ctf.label as field_label, ctf.slug as field_slug,
        ft.name as field_type_name, ft.component
      FROM content_field_values cfv
      JOIN content_type_fields ctf ON cfv.content_type_field_id = ctf.id
      JOIN field_types ft ON ctf.field_type_id = ft.id
      WHERE cfv.content_item_id = ?
      ORDER BY ctf.field_order
    `, [id]);
        return {
            ...rows[0],
            fieldValues
        };
    }
    finally {
        conn.release();
    }
}
export async function updateContentItem(id, { title, slug, status, featured_image, excerpt, meta_title, meta_description, fieldValues }) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        // Update content item
        await conn.execute(`
      UPDATE content_items 
      SET title = ?, slug = ?, status = ?, featured_image = ?, excerpt = ?, 
          meta_title = ?, meta_description = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, slug, status, featured_image, excerpt, meta_title, meta_description,
            status === 'published' ? new Date() : null, id]);
        // Update field values
        if (fieldValues && fieldValues.length > 0) {
            // Delete existing field values
            await conn.execute('DELETE FROM content_field_values WHERE content_item_id = ?', [id]);
            // Insert new field values
            for (const fieldValue of fieldValues) {
                await conn.execute(`
          INSERT INTO content_field_values 
          (content_item_id, content_type_field_id, value_text, value_number, value_date, value_boolean, value_json)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
                    id,
                    fieldValue.content_type_field_id,
                    fieldValue.value_text || null,
                    fieldValue.value_number || null,
                    fieldValue.value_date || null,
                    fieldValue.value_boolean || null,
                    fieldValue.value_json ? JSON.stringify(fieldValue.value_json) : null
                ]);
            }
        }
        await conn.commit();
        return true;
    }
    catch (error) {
        await conn.rollback();
        throw error;
    }
    finally {
        conn.release();
    }
}
export async function deleteContentItem(id) {
    const conn = await pool.getConnection();
    try {
        await conn.execute('DELETE FROM content_items WHERE id = ?', [id]);
        return true;
    }
    finally {
        conn.release();
    }
}
// Categories
export async function getCategories() {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(`
      SELECT c.*, 
        COUNT(cc.content_item_id) as content_count,
        parent.name as parent_name
      FROM categories c
      LEFT JOIN content_categories cc ON c.id = cc.category_id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.name
    `);
        return rows;
    }
    finally {
        conn.release();
    }
}
export async function createCategory({ name, slug, description, parent_id, color, icon }) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute('INSERT INTO categories (name, slug, description, parent_id, color, icon) VALUES (?, ?, ?, ?, ?, ?)', [name, slug, description, parent_id, color, icon]);
        return { id: result.insertId };
    }
    finally {
        conn.release();
    }
}
// Link a content item to a single category (replace existing link)
export async function setContentItemCategory({ content_item_id, category_id }) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await conn.execute('DELETE FROM content_categories WHERE content_item_id = ?', [content_item_id]);
        await conn.execute('INSERT INTO content_categories (content_item_id, category_id) VALUES (?, ?)', [content_item_id, category_id]);
        await conn.commit();
        return true;
    }
    catch (err) {
        await conn.rollback();
        throw err;
    }
    finally {
        conn.release();
    }
}
// Media Files
export async function getMediaFiles({ page = 1, limit = 20, mime_type }) {
    const conn = await pool.getConnection();
    try {
        let whereClause = 'WHERE 1=1';
        let params = [];
        if (mime_type) {
            whereClause += ' AND mime_type LIKE ?';
            params.push(`${mime_type}%`);
        }
        const offset = (page - 1) * limit;
        const [rows] = await conn.execute(`
      SELECT *, COUNT(*) OVER() as total_count
      FROM media_files
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
        return {
            items: rows,
            total: rows[0]?.total_count || 0,
            page,
            limit,
            totalPages: Math.ceil((rows[0]?.total_count || 0) / limit)
        };
    }
    finally {
        conn.release();
    }
}
export async function createMediaFile({ filename, original_name, file_path, file_size, mime_type, alt_text, caption, uploaded_by }) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute('INSERT INTO media_files (filename, original_name, file_path, file_size, mime_type, alt_text, caption, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [filename, original_name, file_path, file_size, mime_type, alt_text, caption, uploaded_by]);
        return { id: result.insertId };
    }
    finally {
        conn.release();
    }
}
// Field Types
export async function getFieldTypes() {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT * FROM field_types WHERE is_active = TRUE ORDER BY name');
        return rows;
    }
    finally {
        conn.release();
    }
}
// Templates
export async function getTemplates() {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT * FROM templates WHERE is_active = TRUE ORDER BY name');
        return rows;
    }
    finally {
        conn.release();
    }
}
// Additional CRUD operations
// Content Types - Update and Delete
export async function updateContentType(id, { name, slug, description, icon, is_active }) {
    const conn = await pool.getConnection();
    try {
        await conn.execute('UPDATE content_types SET name = ?, slug = ?, description = ?, icon = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, slug, description, icon, is_active, id]);
        return true;
    }
    finally {
        conn.release();
    }
}
export async function deleteContentType(id) {
    const conn = await pool.getConnection();
    try {
        await conn.execute('UPDATE content_types SET is_active = FALSE WHERE id = ?', [id]);
        return true;
    }
    finally {
        conn.release();
    }
}
// Categories - Update and Delete
export async function updateCategory(id, { name, slug, description, parent_id, color, icon, is_active }) {
    const conn = await pool.getConnection();
    try {
        await conn.execute('UPDATE categories SET name = ?, slug = ?, description = ?, parent_id = ?, color = ?, icon = ?, is_active = ? WHERE id = ?', [name, slug, description, parent_id, color, icon, is_active, id]);
        return true;
    }
    finally {
        conn.release();
    }
}
export async function deleteCategory(id) {
    const conn = await pool.getConnection();
    try {
        await conn.execute('UPDATE categories SET is_active = FALSE WHERE id = ?', [id]);
        return true;
    }
    finally {
        conn.release();
    }
}
// Media Files - Update and Delete
export async function updateMediaFile(id, { alt_text, caption }) {
    const conn = await pool.getConnection();
    try {
        await conn.execute('UPDATE media_files SET alt_text = ?, caption = ? WHERE id = ?', [alt_text, caption, id]);
        return true;
    }
    finally {
        conn.release();
    }
}
export async function deleteMediaFile(id) {
    const conn = await pool.getConnection();
    try {
        await conn.execute('DELETE FROM media_files WHERE id = ?', [id]);
        return true;
    }
    finally {
        conn.release();
    }
}
// Content Type Fields - CRUD operations
export async function getContentTypeFields(contentTypeId) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute(`
      SELECT ctf.*, ft.name as field_type_name, ft.component
      FROM content_type_fields ctf
      JOIN field_types ft ON ctf.field_type_id = ft.id
      WHERE ctf.content_type_id = ?
      ORDER BY ctf.field_order, ctf.id
    `, [contentTypeId]);
        return rows;
    }
    finally {
        conn.release();
    }
}
export async function updateContentTypeField(id, { name, label, slug, description, is_required, is_unique, field_order, validation_rules, field_config }) {
    const conn = await pool.getConnection();
    try {
        await conn.execute(`
      UPDATE content_type_fields 
      SET name = ?, label = ?, slug = ?, description = ?, is_required = ?, is_unique = ?, field_order = ?, validation_rules = ?, field_config = ?
      WHERE id = ?
    `, [name, label, slug, description, is_required, is_unique, field_order, JSON.stringify(validation_rules), JSON.stringify(field_config), id]);
        return true;
    }
    finally {
        conn.release();
    }
}
export async function deleteContentTypeField(id) {
    const conn = await pool.getConnection();
    try {
        await conn.execute('DELETE FROM content_type_fields WHERE id = ?', [id]);
        return true;
    }
    finally {
        conn.release();
    }
}
// Static Content CRUD operations
export async function getStaticContent(pageType) {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT * FROM static_content WHERE page_type = ? AND is_active = TRUE', [pageType]);
        return rows[0] || null;
    }
    finally {
        conn.release();
    }
}
export async function getAllStaticContent() {
    const conn = await pool.getConnection();
    try {
        const [rows] = await conn.execute('SELECT * FROM static_content WHERE is_active = TRUE ORDER BY page_type');
        return rows;
    }
    finally {
        conn.release();
    }
}
export async function createStaticContent({ page_type, title, content, created_by }) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute('INSERT INTO static_content (page_type, title, content, created_by) VALUES (?, ?, ?, ?)', [page_type, title, content, created_by]);
        return { id: result.insertId };
    }
    finally {
        conn.release();
    }
}
export async function updateStaticContent(pageType, { title, content, updated_by }) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute('UPDATE static_content SET title = ?, content = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE page_type = ?', [title, content, updated_by, pageType]);
        return result.affectedRows > 0;
    }
    finally {
        conn.release();
    }
}
export async function deleteStaticContent(pageType) {
    const conn = await pool.getConnection();
    try {
        const [result] = await conn.execute('UPDATE static_content SET is_active = FALSE WHERE page_type = ?', [pageType]);
        return result.affectedRows > 0;
    }
    finally {
        conn.release();
    }
}
