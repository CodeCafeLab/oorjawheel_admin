
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { contentItemSchema, ContentItem, categorySchema, Category, contentTypeSchema, ContentType, fieldTypeSchema, FieldType, templateSchema, Template } from '@/app/cms/schema';
import { api } from '@/lib/api-client';

// --- Content Types ---
export async function getContentTypes(): Promise<ContentType[]> {
  try {
    const { data } = await api.get('/cms/content-types');
    return z.array(contentTypeSchema).parse(data);
  } catch (error) {
    console.error('Failed to fetch content types:', error);
    return [];
  }
}

export async function addContentType(values: { name: string; slug: string; description?: string; icon?: string }) {
  try {
    const response = await api.post('/cms/content-types', values);
    console.log('Content type creation response:', response.data);
    revalidatePath('/cms');
    return { success: true, message: 'Content type created successfully.' };
  } catch (error: any) {
    console.error('Failed to add content type:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    const errorMessage = error.response?.data?.error || error.message || 'Failed to create content type.';
    return { success: false, message: errorMessage };
  }
}

export async function updateContentType(id: string, values: { name: string; slug: string; description?: string; icon?: string; is_active?: boolean }) {
  try {
    await api.put(`/cms/content-types/${id}`, values);
    revalidatePath('/cms');
    return { success: true, message: 'Content type updated successfully.' };
  } catch (error: any) {
    console.error('Failed to update content type:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Failed to update content type.';
    return { success: false, message: errorMessage };
  }
}

export async function deleteContentType(id: string) {
  try {
    await api.delete(`/cms/content-types/${id}`);
    revalidatePath('/cms');
    return { success: true, message: 'Content type deleted successfully.' };
  } catch (error: any) {
    console.error('Failed to delete content type:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Failed to delete content type.';
    return { success: false, message: errorMessage };
  }
}

// --- Content Items ---
export async function getContentItems(contentTypeId?: string): Promise<ContentItem[]> {
  try {
    const params = contentTypeId ? `?content_type_id=${contentTypeId}` : '';
    const { data } = await api.get(`/cms/content${params}`);
    
    // Transform backend data to match frontend schema
    const items = data.items?.map((item: any) => ({
      id: item.id?.toString() ?? String(item.id),
      title: item.title,
      category: item.category || 'General',
      command: item.command || 'N/A',
      description: item.excerpt || item.description || '',
      image: item.featured_image || `https://placehold.co/100x100.png?text=${item.title?.charAt(0) ?? 'C'}`,
      status: item.status || 'draft',
      contentTypeId: item.content_type_id?.toString(),
      slug: item.slug,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [];
    
    return z.array(contentItemSchema).parse(items);
  } catch (error) {
    console.error('Failed to fetch content items:', error);
    return [];
  }
}

export async function addContentItem(values: {
  contentTypeId: string;
  title: string;
  slug: string;
  category?: string;
  command?: string;
  description?: string;
  status?: string;
  featuredImage?: string;
}) {
  try {
    const payload = {
      content_type_id: values.contentTypeId,
      title: values.title,
      slug: values.slug,
      status: values.status || 'draft',
      featured_image: values.featuredImage,
      excerpt: values.description,
      fieldValues: [
        {
          content_type_field_id: 1, // Assuming category field
          value_text: values.category
        },
        {
          content_type_field_id: 2, // Assuming command field
          value_text: values.command
        }
      ]
    };
    
    await api.post('/cms/content', payload);
    revalidatePath('/cms');
    return { success: true, message: 'Content item created successfully.' };
  } catch (error) {
    console.error('Failed to add content item:', error);
    return { success: false, message: 'Failed to create content item.' };
  }
}

export async function updateContentItem(id: string, values: {
  title: string;
  slug: string;
  category?: string;
  command?: string;
  description?: string;
  status?: string;
  featuredImage?: string;
}) {
  try {
    const payload = {
      title: values.title,
      slug: values.slug,
      status: values.status || 'draft',
      featured_image: values.featuredImage,
      excerpt: values.description,
      fieldValues: [
        {
          content_type_field_id: 1,
          value_text: values.category
        },
        {
          content_type_field_id: 2,
          value_text: values.command
        }
      ]
    };
    
    await api.put(`/cms/content/${id}`, payload);
    revalidatePath('/cms');
    return { success: true, message: 'Content item updated successfully.' };
  } catch (error) {
    console.error('Failed to update content item:', error);
    return { success: false, message: 'Failed to update content item.' };
  }
}

export async function deleteContentItem(id: string) {
  try {
    await api.delete(`/cms/content/${id}`);
    revalidatePath('/cms');
    return { success: true, message: 'Content item deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete content item:', error);
    return { success: false, message: 'Failed to delete content item.' };
  }
}

// --- Categories ---
export async function getCategories(): Promise<string[]> {
  try {
    const { data } = await api.get('/cms/categories');
    const categories = z.array(categorySchema).parse(data);
    return categories.map(cat => cat.name);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Fallback to default categories
    return ['Special Modes', 'Ambiance', 'Wellness', 'General'];
  }
}

export async function getCategoriesDetailed(): Promise<Category[]> {
  try {
    const { data } = await api.get('/cms/categories');
    return z.array(categorySchema).parse(data);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [
      { id: '1', name: 'Special Modes', slug: 'special-modes' },
      { id: '2', name: 'Ambiance', slug: 'ambiance' },
      { id: '3', name: 'Wellness', slug: 'wellness' },
      { id: '4', name: 'General', slug: 'general' }
    ];
  }
}

export async function addCategory(values: { title: string; name?: string; slug?: string; description?: string; color?: string; icon?: string }) {
  try {
    const name = values.name || values.title;
    const slug = values.slug || name.toLowerCase().replace(/\s+/g, '-');
    await api.post('/cms/categories', { name, slug, description: values.description, color: values.color, icon: values.icon });
    revalidatePath('/cms');
    return { success: true, message: 'Category created successfully.' };
  } catch (error) {
    console.error('Failed to add category:', error);
    return { success: false, message: 'Failed to create category.' };
  }
}

export async function updateCategory(id: string, values: { name: string; slug?: string; description?: string; color?: string; icon?: string; is_active?: boolean }) {
  try {
    const slug = values.slug || values.name.toLowerCase().replace(/\s+/g, '-');
    await api.put(`/cms/categories/${id}`, { ...values, slug });
    revalidatePath('/cms');
    return { success: true, message: 'Category updated successfully.' };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, message: 'Failed to update category.' };
  }
}

export async function deleteCategory(id: string) {
  try {
    await api.delete(`/cms/categories/${id}`);
    revalidatePath('/cms');
    return { success: true, message: 'Category deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete category:', error);
    return { success: false, message: 'Failed to delete category.' };
  }
}

// --- Media ---
export async function uploadMedia(file: File, altText?: string, caption?: string) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);
    if (caption) formData.append('caption', caption);
    
    const { data } = await api.post('/cms/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    revalidatePath('/cms');
    return { success: true, data, message: 'File uploaded successfully.' };
  } catch (error) {
    console.error('Failed to upload media:', error);
    return { success: false, message: 'Failed to upload file.' };
  }
}

export async function updateMedia(id: string, values: { alt_text?: string; caption?: string }) {
  try {
    await api.put(`/cms/media/${id}`, values);
    revalidatePath('/cms');
    return { success: true, message: 'Media file updated successfully.' };
  } catch (error) {
    console.error('Failed to update media:', error);
    return { success: false, message: 'Failed to update media file.' };
  }
}

export async function deleteMedia(id: string) {
  try {
    await api.delete(`/cms/media/${id}`);
    revalidatePath('/cms');
    return { success: true, message: 'Media file deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete media:', error);
    return { success: false, message: 'Failed to delete media file.' };
  }
}

export async function getMediaFiles(page = 1, limit = 20) {
  try {
    const { data } = await api.get(`/cms/media?page=${page}&limit=${limit}`);
    // Transform data to include proper URLs
    const transformedData = {
      ...data,
      items: data.items?.map((item: any) => ({
        ...item,
        url: item.file_path?.startsWith('http') ? item.file_path : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${item.file_path}`,
        size: item.file_size,
        mime_type: item.mime_type,
        original_name: item.original_name
      })) || []
    };
    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Failed to fetch media files:', error);
    return { success: false, data: { items: [], total: 0 } };
  }
}

// --- Static Pages ---
export async function getStaticPage(type: 'privacy' | 'terms' | 'shipping' | 'payment') {
  try {
    const { data } = await api.get(`/cms/public/static-pages/${type}`);
    return { success: true, data };
  } catch (error) {
    console.error(`Failed to fetch ${type} page:`, error);
    return { success: false, data: null };
  }
}

export async function updateStaticPage(type: 'privacy' | 'terms' | 'shipping' | 'payment', content: string) {
  try {
    await api.put(`/cms/content/static-${type}`, { 
      title: type.charAt(0).toUpperCase() + type.slice(1),
      excerpt: content,
      status: 'published'
    });
    revalidatePath('/cms');
    return { success: true, message: `${type} page updated successfully.` };
  } catch (error) {
    console.error(`Failed to update ${type} page:`, error);
    return { success: false, message: `Failed to update ${type} page.` };
  }
}

// --- Field Types ---
export async function getFieldTypes(): Promise<FieldType[]> {
  try {
    const { data } = await api.get('/cms/field-types');
    return z.array(fieldTypeSchema).parse(data);
  } catch (error) {
    console.error('Failed to fetch field types:', error);
    return [];
  }
}

// --- Templates ---
export async function getTemplates(): Promise<Template[]> {
  try {
    const { data } = await api.get('/cms/templates');
    return z.array(templateSchema).parse(data);
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return [];
  }
}

// Content Type Fields Management
export async function getContentTypeFields(contentTypeId: string) {
  try {
    const { data } = await api.get(`/cms/content-types/${contentTypeId}/fields`);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch content type fields:', error);
    return { success: false, data: [] };
  }
}

export async function addContentTypeField(contentTypeId: string, values: {
  field_type_id: string;
  name: string;
  label: string;
  slug: string;
  description?: string;
  is_required?: boolean;
  is_unique?: boolean;
  field_order?: number;
  validation_rules?: any;
  field_config?: any;
}) {
  try {
    await api.post(`/cms/content-types/${contentTypeId}/fields`, values);
    revalidatePath('/cms');
    return { success: true, message: 'Field added successfully.' };
  } catch (error) {
    console.error('Failed to add field:', error);
    return { success: false, message: 'Failed to add field.' };
  }
}

export async function updateContentTypeField(id: string, values: {
  name?: string;
  label?: string;
  slug?: string;
  description?: string;
  is_required?: boolean;
  is_unique?: boolean;
  field_order?: number;
  validation_rules?: any;
  field_config?: any;
}) {
  try {
    await api.put(`/cms/content-type-fields/${id}`, values);
    revalidatePath('/cms');
    return { success: true, message: 'Field updated successfully.' };
  } catch (error) {
    console.error('Failed to update field:', error);
    return { success: false, message: 'Failed to update field.' };
  }
}

export async function deleteContentTypeField(id: string) {
  try {
    await api.delete(`/cms/content-type-fields/${id}`);
    revalidatePath('/cms');
    return { success: true, message: 'Field deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete field:', error);
    return { success: false, message: 'Failed to delete field.' };
  }
}

// Legacy compatibility - keeping old function names
export const getPages = getContentItems;
export const addPage = async (values: { category?: string; title: string; command?: string; description?: string; image?: string }) => {
  // Convert legacy format to new format
  const slug = values.title.toLowerCase().replace(/\s+/g, '-');
  return addContentItem({
    contentTypeId: '1', // Default content type
    title: values.title,
    slug,
    category: values.category,
    command: values.command,
    description: values.description,
    featuredImage: values.image,
    status: 'published'
  });
};
export const updatePage = async (id: string, values: { category?: string; title: string; command?: string; description?: string; image?: string }) => {
  const slug = values.title.toLowerCase().replace(/\s+/g, '-');
  return updateContentItem(id, {
    title: values.title,
    slug,
    category: values.category,
    command: values.command,
    description: values.description,
    featuredImage: values.image,
    status: 'published'
  });
};
export const deletePage = deleteContentItem;
