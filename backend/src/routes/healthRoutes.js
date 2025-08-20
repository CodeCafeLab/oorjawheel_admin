import { Router } from 'express';
import pool from '../config/pool.js';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Test database connection
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API status endpoint
router.get('/status', async (req, res) => {
  try {
    const endpoints = [
      { name: 'analytics', url: '/api/analytics', method: 'GET' },
      { name: 'devices', url: '/api/devices', method: 'GET' },
      { name: 'users', url: '/api/users', method: 'GET' },
      { name: 'pages', url: '/api/pages', method: 'GET' },
      { name: 'sections', url: '/api/sections', method: 'GET' },
      { name: 'elements', url: '/api/elements', method: 'GET' },
      { name: 'device-masters', url: '/api/device-masters', method: 'GET' },
      { name: 'device-events', url: '/api/device-events', method: 'GET' }
    ];

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          // Test each endpoint
          const conn = await pool.getConnection();
          let query;
          
          switch (endpoint.name) {
            case 'analytics':
              query = 'SELECT COUNT(*) as count FROM devices';
              break;
            case 'devices':
              query = 'SELECT COUNT(*) as count FROM devices';
              break;
            case 'users':
              query = 'SELECT COUNT(*) as count FROM users';
              break;
            case 'pages':
              query = 'SELECT COUNT(*) as count FROM pages';
              break;
            case 'sections':
              query = 'SELECT COUNT(*) as count FROM sections';
              break;
            case 'elements':
              query = 'SELECT COUNT(*) as count FROM elements';
              break;
            case 'device-masters':
              query = 'SELECT COUNT(*) as count FROM device_masters';
              break;
            case 'device-events':
              query = 'SELECT COUNT(*) as count FROM device_events';
              break;
            default:
              query = 'SELECT 1';
          }
          
          const [rows] = await conn.query(query);
          conn.release();
          
          return {
            ...endpoint,
            status: 'available',
            dataCount: rows[0]?.count || 0
          };
        } catch (error) {
          return {
            ...endpoint,
            status: 'error',
            error: error.message
          };
        }
      })
    );

    res.json({
      status: 'success',
      endpoints: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
