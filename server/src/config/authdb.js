const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool for Authentication
const authPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parlour_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'shavu',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test authentication database connection
const connectAuthDB = async () => {
  try {
    const client = await authPool.connect();
    console.log('✅ Authentication Database Connected (PostgreSQL)');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log(`📅 Database Time: ${result.rows[0].now}`);
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Users table exists');
    } else {
      console.log('⚠️ Users table does not exist - creating...');
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          role VARCHAR(20) DEFAULT 'customer',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created users table');
    }
    
    client.release();
  } catch (err) {
    console.error('❌ Authentication Database Error:', err.message);
    process.exit(1);
  }
};

module.exports = { authPool, connectAuthDB };