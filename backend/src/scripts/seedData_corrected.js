import pool from '../config/pool.js';

async function seedDatabase() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert sample users
    await conn.execute(`
      INSERT INTO users (name, email, password, role, created_at) VALUES
      ('Admin User', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW()),
      ('John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW()),
      ('Jane Smith', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', NOW())
    `);

    // Insert sample devices
    await conn.execute(`
      INSERT INTO devices (device_id, name, status, first_connected_at, warranty_start, created_at) VALUES
      ('DEV001', 'Smart Wheel 1', 'active', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 5 DAY, NOW()),
      ('DEV002', 'Smart Wheel 2', 'active', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 3 DAY, NOW()),
      ('DEV003', 'Smart Wheel 3', 'inactive', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 10 DAY, NOW()),
      ('DEV004', 'Smart Wheel 4', 'active', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 2 DAY, NOW()),
      ('DEV005', 'Smart Wheel 5', 'maintenance', NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 15 DAY, NOW())
    `);

    // Insert sample device events
    await conn.execute(`
      INSERT INTO device_events (device_id, event_type, data, timestamp) VALUES
      ('DEV001', 'command', '{"type": "start", "value": 100}', NOW() - INTERVAL 1 DAY),
      ('DEV001', 'command', '{"type": "stop", "value": 0}', NOW() - INTERVAL 20 HOUR),
      ('DEV002', 'command', '{"type": "start", "value": 75}', NOW() - INTERVAL 2 DAY),
      ('DEV003', 'command', '{"type": "error", "value": 0}', NOW() - INTERVAL 3 DAY),
      ('DEV004', 'command', '{"type": "start", "value": 90}', NOW() - INTERVAL 1 DAY),
      ('DEV001', 'status', '{"battery": 85, "speed": 25}', NOW() - INTERVAL 5 HOUR),
      ('DEV002', 'status', '{"battery": 92, "speed": 30}', NOW() - INTERVAL 6 HOUR)
    `);

    // Insert sample sessions
    await conn.execute(`
      INSERT INTO sessions (user_id, logged_in_at) VALUES
      (1, NOW() - INTERVAL 1 DAY),
      (2, NOW() - INTERVAL 2 DAY),
      (3, NOW() - INTERVAL 3 DAY),
      (1, NOW() - INTERVAL 4 DAY),
      (2, NOW() - INTERVAL 5 DAY)
    `);

    await conn.commit();
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    await conn.rollback();
    console.error('❌ Error seeding database:', error);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seedDatabase();
