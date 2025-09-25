import { getContentTypes, createContentType, getContentTypeById, getContentTypeWithFields, addFieldToContentType, updateContentType, deleteContentType, getContentItems, createContentItem, getStaticContent as getStaticContentModel, getAllStaticContent as getAllStaticContentModel, createStaticContent as createStaticContentModel, updateStaticContent as updateStaticContentModel, deleteStaticContent as deleteStaticContentModel, getContentItemById, updateContentItem, deleteContentItem, getCategories, createCategory, updateCategory, deleteCategory, getMediaFiles, createMediaFile, updateMediaFile, deleteMediaFile, setContentItemCategory, getFieldTypes, getTemplates, getContentTypeFields, updateContentTypeField, deleteContentTypeField } from '../models/cmsModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../config/pool.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mp3|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// Content Types Controllers
export async function listContentTypes(_req, res, next) {
    try {
        const contentTypes = await getContentTypes();
        res.json(contentTypes);
    }
    catch (err) {
        next(err);
    }
}
export async function addContentType(req, res, next) {
    try {
        const { name, slug, description, icon } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ error: 'Name and slug are required' });
        }
        const result = await createContentType({ name, slug, description, icon });
        res.status(201).json({ message: 'Content type created', id: result.id });
    }
    catch (err) {
        next(err);
    }
}
export async function editContentType(req, res, next) {
    try {
        const { name, slug, description, icon, is_active } = req.body;
        await updateContentType(req.params.id, { name, slug, description, icon, is_active });
        res.json({ message: 'Content type updated' });
    }
    catch (err) {
        next(err);
    }
}
export async function removeContentType(req, res, next) {
    try {
        await deleteContentType(req.params.id);
        res.json({ message: 'Content type deleted' });
    }
    catch (err) {
        next(err);
    }
}
export async function getContentType(req, res, next) {
    try {
        const contentType = await getContentTypeWithFields(req.params.id);
        if (!contentType) {
            return res.status(404).json({ error: 'Content type not found' });
        }
        res.json(contentType);
    }
    catch (err) {
        next(err);
    }
}
export async function addContentTypeField(req, res, next) {
    try {
        const { content_type_id } = req.params;
        const { field_type_id, name, label, slug, description, is_required, is_unique, field_order, validation_rules, field_config } = req.body;
        if (!field_type_id || !name || !label || !slug) {
            return res.status(400).json({ error: 'Field type, name, label, and slug are required' });
        }
        const result = await addFieldToContentType({
            content_type_id,
            field_type_id,
            name,
            label,
            slug,
            description,
            is_required: is_required || false,
            is_unique: is_unique || false,
            field_order: field_order || 0,
            validation_rules: validation_rules || {},
            field_config: field_config || {}
        });
        res.status(201).json({ message: 'Field added to content type', id: result.id });
    }
    catch (err) {
        next(err);
    }
}
// Content Items Controllers
export async function listContentItems(req, res, next) {
    try {
        const { content_type_id, status, page, limit, search } = req.query;
        const result = await getContentItems({
            content_type_id,
            status,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            search
        });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
export async function addContentItem(req, res, next) {
    try {
        const { content_type_id, title, slug, status, featured_image, excerpt, meta_title, meta_description, fieldValues, category_id } = req.body;
        if (!content_type_id || !title || !slug) {
            return res.status(400).json({ error: 'Content type, title, and slug are required' });
        }
        const result = await createContentItem({
            content_type_id,
            title,
            slug,
            status: status || 'draft',
            featured_image,
            excerpt,
            meta_title,
            meta_description,
            author_id: req.user?.id, // Assuming auth middleware sets req.user
            fieldValues: fieldValues || []
        });
        // Link category if provided
        if (category_id) {
            await setContentItemCategory({
                content_item_id: Number(result.id),
                category_id: Number(category_id)
            });
        }
        res.status(201).json({ message: 'Content item created', id: result.id });
    }
    catch (err) {
        next(err);
    }
}
export async function getContentItem(req, res, next) {
    try {
        const contentItem = await getContentItemById(req.params.id);
        if (!contentItem) {
            return res.status(404).json({ error: 'Content item not found' });
        }
        res.json(contentItem);
    }
    catch (err) {
        next(err);
    }
}
export async function editContentItem(req, res, next) {
    try {
        const { title, slug, status, featured_image, excerpt, meta_title, meta_description, fieldValues, category_id } = req.body;
        await updateContentItem(req.params.id, {
            title,
            slug,
            status,
            featured_image,
            excerpt,
            meta_title,
            meta_description,
            fieldValues: fieldValues || []
        });
        // Update category link if provided
        if (category_id) {
            await setContentItemCategory({
                content_item_id: Number(req.params.id),
                category_id: Number(category_id)
            });
        }
        res.json({ message: 'Content item updated' });
    }
    catch (err) {
        next(err);
    }
}
export async function removeContentItem(req, res, next) {
    try {
        await deleteContentItem(req.params.id);
        res.json({ message: 'Content item deleted' });
    }
    catch (err) {
        next(err);
    }
}
// Categories Controllers
export async function listCategories(_req, res, next) {
    try {
        const categories = await getCategories();
        res.json({ data: categories });
    }
    catch (err) {
        next(err);
    }
}
export async function addCategory(req, res, next) {
    try {
        const { name, slug, description, parent_id, color, icon } = req.body;
        if (!name || !slug) {
            return res.status(400).json({ error: 'Name and slug are required' });
        }
        // Derive slug from name when not provided
        const baseSlug = (slug || name)
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        const existing = await getCategories();
        const taken = new Set((existing || []).map((c) => c.slug));
        if (taken.has(baseSlug)) {
            return res.status(409).json({ error: 'Category already exists' });
        }
        const result = await createCategory({
            name,
            slug: baseSlug,
            description: description ?? null,
            parent_id: parent_id ?? null,
            color: color ?? null,
            icon: icon ?? null
        });
        res.status(201).json({ message: 'Category created', id: result.id });
    }
    catch (err) {
        // Gracefully report duplicate-key errors if they slip through
        if (err?.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Category already exists' });
        }
        next(err);
    }
}
export async function editCategory(req, res, next) {
    try {
        const { name, slug, description, parent_id, color, icon, is_active } = req.body;
        await updateCategory(req.params.id, { name, slug, description, parent_id, color, icon, is_active });
        res.json({ message: 'Category updated' });
    }
    catch (err) {
        next(err);
    }
}
export async function removeCategory(req, res, next) {
    try {
        await deleteCategory(req.params.id);
        res.json({ message: 'Category deleted' });
    }
    catch (err) {
        next(err);
    }
}
// Media Controllers
export async function listMediaFiles(req, res, next) {
    try {
        const { page, limit, mime_type } = req.query;
        const result = await getMediaFiles({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            mime_type
        });
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
export async function uploadMediaFile(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { alt_text, caption } = req.body;
        const file = req.file;
        const result = await createMediaFile({
            filename: file.filename,
            original_name: file.originalname,
            file_path: `/uploads/${file.filename}`,
            file_size: file.size,
            mime_type: file.mimetype,
            alt_text,
            caption,
            uploaded_by: req.user?.id
        });
        res.status(201).json({
            message: 'File uploaded',
            id: result.id,
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            original_name: file.originalname,
            size: file.size,
            mime_type: file.mimetype
        });
    }
    catch (err) {
        next(err);
    }
}
export async function editMediaFile(req, res, next) {
    try {
        const { alt_text, caption } = req.body;
        await updateMediaFile(req.params.id, { alt_text, caption });
        res.json({ message: 'Media file updated' });
    }
    catch (err) {
        next(err);
    }
}
export async function removeMediaFile(req, res, next) {
    try {
        await deleteMediaFile(req.params.id);
        res.json({ message: 'Media file deleted' });
    }
    catch (err) {
        next(err);
    }
}
// Field Types Controllers
export async function listFieldTypes(_req, res, next) {
    try {
        const fieldTypes = await getFieldTypes();
        res.json(fieldTypes);
    }
    catch (err) {
        next(err);
    }
}
// Templates Controllers
export async function listTemplates(_req, res, next) {
    try {
        const templates = await getTemplates();
        res.json(templates);
    }
    catch (err) {
        next(err);
    }
}
// Content Type Fields Controllers
export async function listContentTypeFields(req, res, next) {
    try {
        const fields = await getContentTypeFields(req.params.content_type_id);
        res.json(fields);
    }
    catch (err) {
        next(err);
    }
}
export async function editContentTypeField(req, res, next) {
    try {
        const { name, label, slug, description, is_required, is_unique, field_order, validation_rules, field_config } = req.body;
        await updateContentTypeField(req.params.id, {
            name, label, slug, description, is_required, is_unique, field_order, validation_rules, field_config
        });
        res.json({ message: 'Content type field updated' });
    }
    catch (err) {
        next(err);
    }
}
export async function removeContentTypeField(req, res, next) {
    try {
        await deleteContentTypeField(req.params.id);
        res.json({ message: 'Content type field deleted' });
    }
    catch (err) {
        next(err);
    }
}
// Dynamic Content API - for frontend consumption
export async function getPublicContent(req, res, next) {
    try {
        const { content_type_slug, slug, limit } = req.params;
        // Get content type by slug
        const [contentTypeRows] = await pool.execute('SELECT id FROM content_types WHERE slug = ? AND is_active = TRUE', [content_type_slug]);
        if (!contentTypeRows[0]) {
            return res.status(404).json({ error: 'Content type not found' });
        }
        const contentTypeId = contentTypeRows[0].id;
        if (slug) {
            // Get specific content item
            const contentItem = await getContentItemById(slug);
            if (!contentItem || contentItem.status !== 'published') {
                return res.status(404).json({ error: 'Content not found' });
            }
            res.json(contentItem);
        }
        else {
            // Get list of published content items
            const result = await getContentItems({
                content_type_id: contentTypeId,
                status: 'published',
                limit: parseInt(limit) || 10
            });
            res.json(result);
        }
    }
    catch (err) {
        next(err);
    }
}
// Static Content Controllers
export const getStaticContentController = async (req, res, next) => {
    try {
        const { pageType } = req.params;
        const content = await getStaticContentModel(pageType);
        // Return null data instead of 404 error for better frontend handling
        res.json({
            success: true,
            data: content || null
        });
    }
    catch (err) {
        next(err);
    }
};
export const getAllStaticContentController = async (req, res, next) => {
    try {
        const content = await getAllStaticContentModel();
        res.json({
            success: true,
            data: content
        });
    }
    catch (err) {
        next(err);
    }
};
export const saveStaticContentController = async (req, res, next) => {
    try {
        const { pageType } = req.params;
        const { title, content } = req.body;
        const created_by = req.user?.id || 1; // Default to admin user if no auth
        if (!title || content === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }
        // Check if content already exists
        const existingContent = await getStaticContentModel(pageType);
        if (existingContent) {
            // Update existing content
            const updated = await updateStaticContentModel(pageType, {
                title,
                content: content || '',
                updated_by: created_by
            });
            if (updated) {
                res.json({
                    success: true,
                    message: 'Static content updated successfully',
                    data: { pageType, title, content: content || '' }
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to update static content'
                });
            }
        }
        else {
            // Create new content
            const result = await createStaticContentModel({
                page_type: pageType,
                title,
                content: content || '',
                created_by
            });
            res.status(201).json({
                success: true,
                message: 'Static content created successfully',
                data: { id: result.id, pageType, title, content: content || '' }
            });
        }
    }
    catch (err) {
        next(err);
    }
};
export const updateStaticContentController = async (req, res, next) => {
    try {
        const { pageType } = req.params;
        const { title, content } = req.body;
        const updated_by = req.user?.id || 1; // Default to admin user if no auth
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }
        const updated = await updateStaticContentModel(pageType, {
            title,
            content,
            updated_by
        });
        if (updated) {
            res.json({
                success: true,
                message: 'Static content updated successfully',
                data: { pageType, title, content }
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'Static content not found'
            });
        }
    }
    catch (err) {
        next(err);
    }
};
export const deleteStaticContentController = async (req, res, next) => {
    try {
        const { pageType } = req.params;
        const deleted = await deleteStaticContentModel(pageType);
        if (deleted) {
            res.json({
                success: true,
                message: 'Static content deleted successfully'
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'Static content not found'
            });
        }
    }
    catch (err) {
        next(err);
    }
};
// Public: Get only selected legal/static pages
export const getPublicLegalContent = async (_req, res, next) => {
    try {
        // Support common aliases to match existing DB values
        const pageAliases = {
            privacy_policy: ['privacy_policy'],
            terms_and_conditions: ['terms_and_conditions', 'terms_conditions', 't_and_c'],
            shipping_and_returns: ['shipping_and_returns', 'shipping_returns'],
            payment_terms: ['payment_terms', 'payments', 'payment']
        };
        const results = {};
        for (const key of Object.keys(pageAliases)) {
            const aliases = pageAliases[key];
            let content = null;
            for (const alias of aliases) {
                content = await getStaticContentModel(alias);
                if (content)
                    break;
            }
            results[key] = content || null;
        }
        res.json({ success: true, data: results });
    }
    catch (err) {
        next(err);
    }
};
// Link content item to a category
export const setContentItemCategoryController = async (req, res, next) => {
    try {
        const { id } = req.params; // content item id
        const { categoryId } = req.body;
        if (!id || !categoryId) {
            return res.status(400).json({ success: false, message: 'content_item_id and categoryId are required' });
        }
        await setContentItemCategory({ content_item_id: Number(id), category_id: Number(categoryId) });
        res.json({ success: true, message: 'Category linked successfully' });
    }
    catch (err) {
        next(err);
    }
};
// Public: Get active categories list
export async function getPublicCategories(_req, res, next) {
    try {
        const categories = await getCategories();
        res.json({ success: true, data: categories });
    }
    catch (err) {
        next(err);
    }
}
// Public: Get content items by category
export async function getPublicContentByCategory(req, res, next) {
    try {
        const category_id = Number(req.params.categoryId);
        const search = req.query.search || undefined;
        const status = 'published';
        if (!category_id) {
            return res.status(400).json({ success: false, message: 'categoryId is required' });
        }
        const { getContentItemsByCategory } = await import('../models/cmsModel.js');
        const items = await getContentItemsByCategory({ category_id, status, search });
        res.json({ success: true, data: items });
    }
    catch (err) {
        next(err);
    }
}
