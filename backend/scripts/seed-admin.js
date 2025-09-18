const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seedAdmin() {
  const email = 'admin@oorja.com';
  const password = 'Admin@123'; // Strong password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if admin already exists
    const checkQuery = 'SELECT * FROM admins WHERE email = $1';
    const checkResult = await pool.query(checkQuery, [email]);

    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Insert new admin
    const insertQuery = `
      INSERT INTO admins (email, password_hash, role) 
      VALUES ($1, $2, 'super_admin')
      RETURNING id, email, role, created_at
    `;

    const result = await pool.query(insertQuery, [email, hashedPassword]);
    console.log('Admin user created successfully:');
    console.log({
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      created_at: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await pool.end();
  }
}

seedAdmin();
