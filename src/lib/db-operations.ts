import pool from './db';
import { z } from 'zod';

// Generic CRUD operations
export class DatabaseOperations<T> {
  constructor(
    private tableName: string,
    private schema: z.ZodSchema<T>,
    private idColumn: string = 'id'
  ) {}

  async getAll(): Promise<T[]> {
    try {
      const [rows] = await pool.execute(`SELECT * FROM ${this.tableName}`);
      return this.schema.array().parse(rows);
    } catch (error) {
      console.error(`Error fetching from ${this.tableName}:`, error);
      throw error;
    }
  }

  async getById(id: string | number): Promise<T | null> {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = ?`,
        [id]
      );
      const items = rows as T[];
      return items.length > 0 ? this.schema.parse(items[0]) : null;
    } catch (error) {
      console.error(`Error fetching from ${this.tableName} by id:`, error);
      throw error;
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    try {
      const keys = Object.keys(data);
      const placeholders = keys.map(() => '?').join(', ');
      const values = Object.values(data);
      
      const [result] = await pool.execute(
        `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      const insertId = (result as any).insertId;
      return await this.getById(insertId) as T;
    } catch (error) {
      console.error(`Error creating in ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    try {
      const keys = Object.keys(data);
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];
      
      await pool.execute(
        `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.idColumn} = ?`,
        values
      );
      
      return await this.getById(id) as T;
    } catch (error) {
      console.error(`Error updating in ${this.tableName}:`, error);
      throw error;
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      const [result] = await pool.execute(
        `DELETE FROM ${this.tableName} WHERE ${this.idColumn} = ?`,
        [id]
      );
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting from ${this.tableName}:`, error);
      throw error;
    }
  }

  async search(filters: Record<string, any>): Promise<T[]> {
    try {
      const whereClause = Object.keys(filters)
        .map(key => `${key} LIKE ?`)
        .join(' AND ');
      const values = Object.values(filters).map(val => `%${val}%`);
      
      const [rows] = await pool.execute(
        `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
        values
      );
      
      return this.schema.array().parse(rows);
    } catch (error) {
      console.error(`Error searching in ${this.tableName}:`, error);
      throw error;
    }
  }
}
