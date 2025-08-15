
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { pageSchema } from '@/app/cms/schema';

// Types for form data
const PageFormSchema = pageSchema.omit({ id: true, image: true });
const CategoryFormSchema = z.object({
  title: z.string().min(1, "Category title is required."),
});


// --- Page Actions ---

export async function addPage(values: z.infer<typeof PageFormSchema>) {
  
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO pages (category, title, command, description, image) VALUES (?, ?, ?, ?, ?)',
      [values.category, values.title, values.command, values.description, 'https://placehold.co/100x100.png']
    );
    connection.release();
    revalidatePath('/cms');
    return { success: true, message: 'Content added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add content.' };
  }
}

export async function updatePage(id: string, values: z.infer<typeof PageFormSchema>) {
  
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE pages SET category = ?, title = ?, command = ?, description = ? WHERE id = ?',
      [values.category, values.title, values.command, values.description, id]
    );
    connection.release();
    revalidatePath('/cms');
    return { success: true, message: 'Content updated successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to update content.' };
  }
}

export async function deletePage(id: string) {
  
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM pages WHERE id = ?', [id]);
    connection.release();
    revalidatePath('/cms');
    return { success: true, message: 'Content deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to delete content.' };
  }
}


// --- Category Actions ---

export async function addCategory(values: { title: string }) {
    
    try {
      const connection = await pool.getConnection();
      // This assumes a `categories` table or similar. The schema screenshot doesn't show one, so this might need adjustment.
      // For now, let's assume a table `cms_categories`.
      // Check if category exists
      const [existing] = await connection.execute('SELECT * FROM cms_categories WHERE title = ?', [values.title]);
      if ((existing as any[]).length > 0) {
        connection.release();
        return { success: false, message: 'Category with this title already exists.' };
      }
      
      await connection.execute('INSERT INTO cms_categories (title) VALUES (?)', [values.title]);
      connection.release();
      revalidatePath('/cms');
      return { success: true, message: 'Category added successfully.' };
    } catch (error) {
      console.error('Database Error:', error);
      return { success: false, message: 'Failed to add category.' };
    }
  }
