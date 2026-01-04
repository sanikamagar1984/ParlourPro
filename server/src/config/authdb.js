const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool for entire application
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parlour_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'shavu',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test database connection and initialize tables
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database Connected (PostgreSQL)');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log(`📅 Database Time: ${result.rows[0].now}`);
    
    // Check and create tables if they don't exist
    await checkAndCreateTables(client);
    
    client.release();
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1);
  }
};

// Function to check and create tables
const checkAndCreateTables = async (client) => {
  try {
    // Check if users table exists
    const usersCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `);
    
    if (!usersCheck.rows[0].exists) {
      console.log('🔄 Creating users table...');
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          role VARCHAR(20) DEFAULT 'employee',
          reset_token VARCHAR(255),
          reset_token_expiry TIMESTAMP,
          address TEXT,
          date_of_birth DATE,
          gender VARCHAR(20),
          profile_picture TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created users table');
    } else {
      console.log('✅ Users table exists');
    }
    
    // Check other tables
    const tables = ['customers', 'services', 'staff', 'daily_records', 'appointments'];
    
    for (const table of tables) {
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);
      
      if (!tableCheck.rows[0].exists) {
        console.log(`⚠️ ${table} table does not exist - table creation skipped (already created manually)`);
      } else {
        console.log(`✅ ${table} table exists`);
      }
    }
    
  } catch (err) {
    console.error('❌ Table check/create error:', err.message);
  }
};

// Export a single query function for all database operations
module.exports = {
  query: (text, params) => pool.query(text, params),
  authPool: pool,  // Export as authPool
  pool,
  connectDB,
};