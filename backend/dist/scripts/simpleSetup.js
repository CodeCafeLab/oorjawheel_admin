import pool from '../config/pool.js';
async function simpleSetup() {
    const conn = await pool.getConnection();
    try {
        console.log('🔄 Setting up basic data...');
        // Check existing tables
        const [tables] = await conn.query('SHOW TABLES');
        console.log('Existing tables:', tables);
        // Insert minimal data for testing
        try {
            // Try to insert into devices table
            await conn.execute(`
        INSERT INTO devices (device_id, name, status, created_at) VALUES
        ('DEV001', 'Smart Wheel 1', 'active', NOW()),
        ('DEV002', 'Smart Wheel 2', 'inactive', NOW()),
        ('DEV003', 'Smart Wheel 3', 'maintenance', NOW())
      `);
            console.log('✅ Devices inserted');
        }
        catch (e) {
            console.log('⚠️  Devices table might not exist or have different structure:', e.message);
        }
        try {
            // Try to insert into users table
            await conn.execute(`
        INSERT INTO users (username, email, password, role) VALUES
        ('admin', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
        ('user1', 'user1@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
      `);
            console.log('✅ Users inserted');
        }
        catch (e) {
            console.log('⚠️  Users table might not exist or have different structure:', e.message);
        }
        try {
            // Try to insert into device_events table
            await conn.execute(`
        INSERT INTO device_events (device_id, event_type, data, timestamp) VALUES
        ('DEV001', 'command', '{"type": "start"}', NOW() - INTERVAL 1 DAY),
        ('DEV001', 'status', '{"battery": 85}', NOW() - INTERVAL 2 HOUR),
        ('DEV002', 'error', '{"message": "Connection lost"}', NOW() - INTERVAL 3 HOUR)
      `);
            console.log('✅ Device events inserted');
        }
        catch (e) {
            console.log('⚠️  Device events table might not exist or have different structure:', e.message);
        }
        console.log('✅ Basic setup completed!');
        // Show current data
        const [deviceCount] = await conn.query('SELECT COUNT(*) as count FROM devices');
        const [userCount] = await conn.query('SELECT COUNT(*) as count FROM users');
        const [eventCount] = await conn.query('SELECT COUNT(*) as count FROM device_events');
        console.log('📊 Current data:');
        console.log(`- Devices: ${deviceCount[0].count}`);
        console.log(`- Users: ${userCount[0].count}`);
        console.log(`- Events: ${eventCount[0].count}`);
    }
    catch (error) {
        console.error('❌ Error in simple setup:', error);
    }
    finally {
        conn.release();
        process.exit(0);
    }
}
simpleSetup();
