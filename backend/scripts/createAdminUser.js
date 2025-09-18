import bcrypt from 'bcryptjs';
import pool from '../src/config/pool.js';

async function createAdminUser() {
  const email = 'gaurav@gmail.com';
  const password = 'gaurav@1';
  const role = 'super_admin';
  
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Get a connection from the pool
    const conn = await pool.getConnection();
    
    try {
      // Check if user already exists
      const [existingUser] = await conn.execute(
        'SELECT id FROM admins WHERE email = ?',
        [email]
      );
      
      if (existingUser.length > 0) {
        console.log('Admin user already exists with email:', email);
        return;
      }
      
      // Insert new admin user
      const [result] = await conn.execute(
        'INSERT INTO admins (email, password_hash, role, created_at) VALUES (?, ?, ?, NOW())',
        [email, passwordHash, role]
      );
      
      console.log('Admin user created successfully!');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Role:', role);
      
    } finally {
      // Always release the connection back to the pool
      conn.release();
    }
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the connection pool when done
    await pool.end();
    process.exit();
  }
}

// Run the function
createAdminUser();
