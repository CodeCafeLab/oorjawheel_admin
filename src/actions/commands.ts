
'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { commandSchema } from '@/app/commands/schema';

const CommandFormSchema = commandSchema.omit({ id: true });


export async function addCommand(values: z.infer<typeof CommandFormSchema>) {
  /*
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO commands (type, status, details) VALUES (?, ?, ?)',
      [values.type, values.status, JSON.stringify(values.details)]
    );
    connection.release();
    revalidatePath('/commands');
    return { success: true, message: 'Command added successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to add command.' };
  }
  */
  console.log("Mock addCommand:", values);
  revalidatePath('/commands');
  return { success: true, message: 'Command added successfully (Mock).' };
}

export async function updateCommand(id: string, values: z.infer<typeof CommandFormSchema>) {
  /*
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE commands SET type = ?, status = ?, details = ? WHERE id = ?',
      [values.type, values.status, JSON.stringify(values.details), id]
    );
    connection.release();
    revalidatePath('/commands');
    return { success: true, message: 'Command updated successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to update command.' };
  }
  */
  console.log("Mock updateCommand:", id, values);
  revalidatePath('/commands');
  return { success: true, message: 'Command updated successfully (Mock).' };
}

export async function deleteCommand(id: string) {
  /*
  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM commands WHERE id = ?', [id]);
    connection.release();
    revalidatePath('/commands');
    return { success: true, message: 'Command deleted successfully.' };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, message: 'Failed to delete command.' };
  }
  */
  console.log("Mock deleteCommand:", id);
  revalidatePath('/commands');
  return { success: true, message: 'Command deleted successfully (Mock).' };
}
