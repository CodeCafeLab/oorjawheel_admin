import { Router } from 'express';
import { listContentTypes, addContentType, editContentType, removeContentType, getContentType, addContentTypeField, listContentTypeFields, editContentTypeField, removeContentTypeField, listContentItems, addContentItem, getContentItem, editContentItem, removeContentItem, listCategories, addCategory, editCategory, removeCategory, listMediaFiles, uploadMediaFile, editMediaFile, removeMediaFile, listFieldTypes, listTemplates, getPublicContent, upload, getStaticContentController, getAllStaticContentController, getPublicLegalContent, getPublicCategories, getPublicContentByCategory, saveStaticContentController, updateStaticContentController, deleteStaticContentController, setContentItemCategoryController } from '../controllers/cmsController.js';
const router = Router();
// Content Types Routes
router.get('/content-types', listContentTypes);
router.post('/content-types', addContentType);
router.get('/content-types/:id', getContentType);
router.put('/content-types/:id', editContentType);
router.delete('/content-types/:id', removeContentType);
// Content Type Fields Routes
router.get('/content-types/:content_type_id/fields', listContentTypeFields);
router.post('/content-types/:content_type_id/fields', addContentTypeField);
router.put('/content-type-fields/:id', editContentTypeField);
router.delete('/content-type-fields/:id', removeContentTypeField);
// Content Items Routes
router.get('/content', listContentItems);
router.post('/content', addContentItem);
router.get('/content/:id', getContentItem);
router.put('/content/:id', editContentItem);
router.delete('/content/:id', removeContentItem);
// Categories Routes
router.get('/categories', listCategories);
router.post('/categories', addCategory);
router.put('/categories/:id', editCategory);
router.delete('/categories/:id', removeCategory);
// Media Routes
router.get('/media', listMediaFiles);
router.post('/media/upload', upload.single('file'), uploadMediaFile);
router.put('/media/:id', editMediaFile);
router.delete('/media/:id', removeMediaFile);
// Field Types and Templates Routes
router.get('/field-types', listFieldTypes);
router.get('/templates', listTemplates);
// Public legal/static bundle (place before generic public routes)
router.get('/public/legal', getPublicLegalContent);
router.get('/public/categories', getPublicCategories);
router.get('/public/categories/:categoryId/content', getPublicContentByCategory);
// Public API Routes
router.get('/public/:content_type_slug', getPublicContent);
router.get('/public/:content_type_slug/:slug', getPublicContent);
// Static Content Routes
router.get('/static-content', getAllStaticContentController);
router.get('/static-content/:pageType', getStaticContentController);
router.post('/static-content/:pageType', saveStaticContentController);
router.put('/static-content/:pageType', updateStaticContentController);
router.delete('/static-content/:pageType', deleteStaticContentController);
// Link content item to category
router.post('/content/:id/categories', setContentItemCategoryController);
export default router;
