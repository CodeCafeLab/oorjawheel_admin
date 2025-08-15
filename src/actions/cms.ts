
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { pageSchema, Page } from '@/app/cms/schema';


export async function getPages(): Promise<Page[]> {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT id, title, `order`, is_published FROM pages ORDER BY `order` ASC');
        connection.release();
        
        const pages = (rows as any[]).map(row => ({
            id: row.id.toString(),
            title: row.title,
            category: 'General', // Mock category as it's not in the `pages` table
            command: 'N/A', // Mock command
            description: `Page with order ${row.order}`, // Mock description
            image: `https://placehold.co/100x100.png?text=${row.title.charAt(0)}`,
        }));
        return z.array(pageSchema).parse(pages);
    } catch (error) {
        console.error("Failed to fetch pages:", error);
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
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO pages (title, `order`, is_published) VALUES (?, ?, ?)',
      [values.title, 0, 1] // Mocking order and is_published
    );
    connection.release();
    revalidatePath('/cms');
    return { success: true, message: 'Page added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add page.' };
  }
}

export async function updatePage(id: string, values: z.infer<typeof PageFormSchema>) {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE pages SET title = ? WHERE id = ?',
      [values.title, id]
    );
    connection.release();
    revalidatePath('/cms');
    return { success: true, message: 'Page updated successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to update page.' };
  }
}

export async function deletePage(id: string) {
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM pages WHERE id = ?', [id]);
    connection.release();
    revalidatePath('/cms');
    return { success: true, message: 'Page deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to delete page.' };
  }
}

export async function addCategory(values: { title: string }) {
    console.log("Adding category:", values.title);
    revalidatePath('/cms');
    return { success: true, message: 'Category added successfully (Mock).' };
}
