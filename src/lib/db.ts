import mysql from 'mysql2/promise';

// This is a placeholder for the database connection.
// In a real application, you would initialize this with your database configuration.
// For example, using environment variables.

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'oorja_admin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
