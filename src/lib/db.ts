import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Add these options to handle larger result sets
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    // Increase max packet size for large queries
    maxPacketSize: 16777216, // 16MB
});

export default pool;
