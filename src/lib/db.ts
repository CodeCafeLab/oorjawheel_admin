import mysql from 'mysql2/promise';

// This is a placeholder for the database connection.
// In a real application, you would initialize this with your database configuration.
// For example, using environment variables.

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL || 'mysql://root:@127.0.0.1/oorja_admin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
