
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { pageSchema } from '@/app/cms/schema';

// Types for form data based on `pages` table
const PageFormSchema = pageSchema.omit({ id: true, image: true });

// --- Page Actions ---

export async function addPage(values: z.infer<typeof PageFormSchema>) {
  try {
    const connection = await pool.getConnection();
    // Assuming 'command' maps to a field or is stored in a related table. For now, let's keep it simple.
    // The 'pages' table provided has title, order, is_published. Let's adapt.
    // Let's assume a simplified mapping for now.
    // title is in the table. `is_published` can be a toggle. `order` can be managed.
    // Let's map description to a new field or ignore it for now if not in schema.
    // The UI uses category, title, command, description. The table has title, order, is_published.
    // This requires a bigger schema change discussion.
    // Sticking to a simplified version that works with the provided `pages` table.
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

// Category actions would need a `categories` table.
// The provided schema doesn't have one, so these will fail or need mocks.
export async function addCategory(values: { title: string }) {
    // This is a mock since there is no categories table
    console.log("Adding category:", values.title);
    revalidatePath('/cms');
    return { success: true, message: 'Category added successfully (Mock).' };
}
