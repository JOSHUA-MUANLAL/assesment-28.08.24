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

try {
 client.connect();
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
  
  client.query(createTableQuery);
  console.log('Table "d" created successfully');
} catch (err) {
  console.error('Database setup error:', err);
} 

module.exports = { client };
