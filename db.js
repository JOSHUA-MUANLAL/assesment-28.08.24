const { Client } = require('pg');
require('dotenv').config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const client = new Client({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function connectAndCreateTable() {
  try {
    await client.connect();
    console.log('Connected to the database');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS d (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        address VARCHAR(255),
        latitude FLOAT,
        longitude FLOAT
      );
    `;
    
    await client.query(createTableQuery);
    console.log('Table "d" created successfully');
  } catch (err) {
    console.error('Database setup error:', err);
  } finally {
    // Close the connection to the database
   
    console.log('Database connection closed');
  }
}

// Initialize the database connection and setup
connectAndCreateTable();

module.exports = { client };
