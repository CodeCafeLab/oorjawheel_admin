
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { pageSchema, Page } from '@/app/cms/schema';
import { api } from '@/lib/api-client';


export async function getPages(): Promise<Page[]> {
  try {
    const { data } = await api.get('/pages');
    const pages = (data as any[]).map((row) => ({
      id: row.id?.toString?.() ?? String(row.id),
      title: row.title,
      category: 'General',
      command: 'N/A',
      description: `Page with order ${row.order}`,
      image: `https://placehold.co/100x100.png?text=${row.title?.charAt(0) ?? 'P'}`,
    }));
    return z.array(pageSchema).parse(pages);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return [];
  }
}

export async function getCategories(): Promise<string[]> {
    return ['Special Modes', 'Ambiance', 'Wellness', 'General'];
}


// Types for form data based on `pages` table
const PageFormSchema = pageSchema.omit({ id: true, image: true });

// --- Page Actions ---

export async function addPage(values: z.infer<typeof PageFormSchema>) {
  try {
    await api.post('/pages', { title: values.title, order: 0, is_published: 1 });
    revalidatePath('/cms');
    return { success: true, message: 'Page added successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to add page.' };
  }
}

export async function updatePage(id: string, values: z.infer<typeof PageFormSchema>) {
  try {
    await api.put(`/pages/${id}`, { title: values.title, order: 0, is_published: 1 });
    revalidatePath('/cms');
    return { success: true, message: 'Page updated successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to update page.' };
  }
}

export async function deletePage(id: string) {
  try {
    await api.delete(`/pages/${id}`);
    revalidatePath('/cms');
    return { success: true, message: 'Page deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to delete page.' };
  }
}

export async function addCategory(values: { title: string }) {
    console.log("Adding category:", values.title);
    revalidatePath('/cms');
    return { success: true, message: 'Category added successfully (Mock).' };
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
    const { data } = await api.get(`/cms/static-content/${pageType}`);
    return data.data || null;
  } catch (error) {
    console.error('Failed to fetch static content:', error);
    return null;
  }
}

export async function getAllStaticContent(): Promise<StaticContent[]> {
  try {
    const { data } = await api.get('/cms/static-content');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch all static content:', error);
    return [];
  }
}

export async function saveStaticContent(pageType: StaticContentType, title: string, content: string) {
  try {
    const { data } = await api.post(`/cms/static-content/${pageType}`, { title, content });
    revalidatePath('/cms');
    return { success: true, message: data.message || 'Content saved successfully.' };
  } catch (error) {
    console.error('Failed to save static content:', error);
    return { success: false, message: 'Failed to save content.' };
  }
}

export async function updateStaticContent(pageType: StaticContentType, title: string, content: string) {
  try {
    const { data } = await api.put(`/cms/static-content/${pageType}`, { title, content });
    revalidatePath('/cms');
    return { success: true, message: data.message || 'Content updated successfully.' };
  } catch (error) {
    console.error('Failed to update static content:', error);
    return { success: false, message: 'Failed to update content.' };
  }
}

export async function deleteStaticContent(pageType: StaticContentType) {
  try {
    const { data } = await api.delete(`/cms/static-content/${pageType}`);
    revalidatePath('/cms');
    return { success: true, message: data.message || 'Content deleted successfully.' };
  } catch (error) {
    console.error('Failed to delete static content:', error);
    return { success: false, message: 'Failed to delete content.' };
  }
}