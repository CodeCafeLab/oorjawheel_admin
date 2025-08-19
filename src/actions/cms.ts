
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
