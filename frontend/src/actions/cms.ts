
'use client';

import { z } from 'zod';
import { pageSchema, Page } from '@/app/cms/schema';


export async function getPages(): Promise<Page[]> {
  try {
    const { fetchData } = await import('@/lib/api-utils');
    const data = await fetchData('/pages');
    const pages = (data as any[]).map((row) => ({
      id: row.id?.toString?.() ?? String(row.id),
      title: row.title,
      category: row.category_name ?? 'Uncategorized',
      command: row.command ?? 'N/A',
      description: row.description ?? '',
      image: `https://placehold.co/100x100.png?text=${row.title?.charAt(0) ?? 'P'}`,
    }));
    return z.array(pageSchema).parse(pages);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return [];
  }
}

export type Category = { id: number; name: string };

export async function getCategories(): Promise<Category[]> {
  try {
    const { fetchData } = await import('@/lib/api-utils');
    const data = await fetchData('/cms/categories') as { data: any[] };
    const rows = data?.data ?? [];
    return rows.map((r: any) => ({ id: Number(r.id), name: String(r.name) }));
  } catch (e) {
    return [];
  }
}


// Types for form data based on `pages` table (category is handled separately)
const PageFormSchema = pageSchema.omit({ id: true, image: true, category: true });

// --- Page Actions ---

export async function addPage(values: z.infer<typeof PageFormSchema> & { category_id?: number }) {
  try {
    const { postData } = await import('@/lib/api-utils');
    await postData('/pages', { title: values.title, order: 0, is_published: 1, command: values.command, description: values.description, category_id: values.category_id });
    return { success: true, message: 'Page added successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to add page.' };
  }
}

export async function updatePage(id: string, values: z.infer<typeof PageFormSchema> & { category_id?: number }) {
  try {
    const { updateData } = await import('@/lib/api-utils');
    await updateData(`/pages/${id}`, { title: values.title, order: 0, is_published: 1, command: values.command, description: values.description, category_id: values.category_id });
    return { success: true, message: 'Page updated successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to update page.' };
  }
}

export async function deletePage(id: string) {
  try {
    const { deleteData } = await import('@/lib/api-utils');
    await deleteData(`/pages/${id}`);
    return { success: true, message: 'Page deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to delete page.' };
  }
}

export async function addCategory(values: { title: string }) {
  try {
    const payload = { name: values.title, slug: values.title.toLowerCase().replace(/\s+/g,'-') };
    const { postData } = await import('@/lib/api-utils');
    await postData('/cms/categories', payload);
    return { success: true, message: 'Category added successfully.' };
  } catch (e) {
    return { success: false, message: 'Failed to add category.' };
  }
}

export async function linkContentToCategory(contentItemId: number, categoryId: number) {
  const { postData } = await import('@/lib/api-utils');
  await postData(`/cms/content/${contentItemId}/categories`, { categoryId });
}

// Static Content Actions
export type StaticContentType = 'privacy_policy' | 'terms_conditions' | 'shipping_returns' | 'payment_terms';

export interface StaticContent {
  id: number;
  page_type: StaticContentType;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export async function getStaticContent(pageType: StaticContentType): Promise<StaticContent | null> {
  try {
    const { fetchData } = await import('@/lib/api-utils');
    const data = await fetchData(`/cms/static-content/${pageType}`) as { data: StaticContent | null };
    return data.data || null;
  } catch (error) {
    console.error('Failed to fetch static content:', error);
    return null;
  }
}

export async function getAllStaticContent(): Promise<StaticContent[]> {
  try {
    const { fetchData } = await import('@/lib/api-utils');
    const data = await fetchData('/cms/static-content') as { data: StaticContent[] };
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch all static content:', error);
    return [];
  }
}

export async function saveStaticContent(pageType: StaticContentType, title: string, content: string) {
  try {
    const { postData } = await import('@/lib/api-utils');
    const data = await postData(`/cms/static-content/${pageType}`, { title, content }) as { message?: string };
    return { success: true, message: data.message || 'Content saved successfully.' };
  } catch (error) {
    console.error('Failed to save static content:', error);
    return { success: false, message: 'Failed to save content.' };
  }
}

export async function updateStaticContent(pageType: StaticContentType, title: string, content: string) {
  try {
    const { updateData } = await import('@/lib/api-utils');
    const data = await updateData(`/cms/static-content/${pageType}`, { title, content }) as { message?: string };
    return { success: true, message: data.message || 'Content updated successfully.' };
  } catch (error) {
    console.error('Failed to update static content:', error);
    return { success: false, message: 'Failed to update content.' };
  }
}

export async function deleteStaticContent(pageType: StaticContentType) {
  try {
    const { deleteData } = await import('@/lib/api-utils');
    const data = await deleteData(`/cms/static-content/${pageType}`) as { message?: string };
    return { success: true, message: data.message || 'Content deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete static content:', error);
    return { success: false, message: 'Failed to delete content.' };
  }
}