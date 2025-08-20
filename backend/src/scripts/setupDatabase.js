import pool from '../config/pool.js';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Setting up database schema...');
    
    // Read and execute schema
    const schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await conn.execute(statement);
      }
    }
    
    console.log('✅ Database schema created successfully!');

    // Insert sample data
    console.log('🔄 Seeding database with sample data...');
    
    // Insert users
    await conn.execute(`
      INSERT INTO users (name, email, password, role) VALUES
      ('Admin User', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
      ('John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
      ('Jane Smith', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
    `);

    // Insert devices
    await conn.execute(`
      INSERT INTO devices (device_id, name, status, first_connected_at, warranty_start) VALUES
      ('DEV001', 'Smart Wheel 1', 'active', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 5 DAY),
      ('DEV002', 'Smart Wheel 2', 'active', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 3 DAY),
      ('DEV003', 'Smart Wheel 3', 'inactive', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 10 DAY),
      ('DEV004', 'Smart Wheel 4', 'active', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 2 DAY),
      ('DEV005', 'Smart Wheel 5', 'maintenance', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 15 DAY)
    `);

    // Insert device events
    await conn.execute(`
      INSERT INTO device_events (device_id, event_type, data) VALUES
      ('DEV001', 'command', '{"type": "start", "value": 100}'),
      ('DEV001', 'command', '{"type": "stop", "value": 0}'),
      ('DEV002', 'command', '{"type": "start", "value": 75}'),
      ('DEV003', 'command', '{"type": "error", "value": 0}'),
      ('DEV004', 'command', '{"type": "start", "value": 90}'),
      ('DEV001', 'status', '{"battery": 85, "speed": 25}'),
      ('DEV002', 'status', '{"battery": 92, "speed": 30}')
    `);

    // Insert pages
    await conn.execute(`
      INSERT INTO pages (name, slug, content, status) VALUES
      ('Home', 'home', '{"title": "Welcome to Oorja Wheel", "description": "Smart wheel management system"}', 'published'),
      ('About', 'about', '{"title": "About Us", "description": "Learn more about Oorja Wheel"}', 'published'),
      ('Contact', 'contact', '{"title": "Contact Us", "description": "Get in touch with our team"}', 'draft')
    `);

    // Insert sections
    await conn.execute(`
      INSERT INTO sections (page_id, name, order_index, content) VALUES
      (1, 'Hero Section', 1, '{"type": "hero", "title": "Welcome", "subtitle": "Smart Wheel Management"}'),
      (1, 'Features', 2, '{"type": "features", "items": ["Real-time monitoring", "Analytics dashboard", "Device management"]}'),
      (2, 'About Content', 1, '{"type": "text", "content": "Oorja Wheel provides cutting-edge smart wheel solutions..."}')
    `);

    // Insert elements
    await conn.execute(`
      INSERT INTO elements (section_id, type, content, order_index) VALUES
      (1, 'heading', '{"text": "Welcome to Oorja Wheel", "level": 1}', 1),
      (1, 'paragraph', '{"text": "Manage your smart wheels with ease"}', 2),
      (2, 'feature', '{"title": "Real-time Monitoring", "description": "Monitor your devices in real-time"}', 1),
      (2, 'feature', '{"title": "Analytics Dashboard", "description": "Get insights from your data"}', 2)
    `);

    // Insert device masters
    await conn.execute(`
      INSERT INTO device_masters (model, manufacturer, specifications) VALUES
      ('OW-1000', 'Oorja Tech', '{"battery": "5000mAh", "range": "50km", "speed": "25km/h"}'),
      ('OW-2000', 'Oorja Tech', '{"battery": "7500mAh", "range": "75km", "speed": "30km/h"}')
    `);

    // Insert sessions
    await conn.execute(`
      INSERT INTO sessions (user_id) VALUES
      (1), (2), (3), (1), (2)
    `);

    console.log('✅ Database seeded successfully!');
    console.log('🎉 All GET APIs are now ready to serve data!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    conn.release();
    process.exit(0);
  }
}

setupDatabase();
