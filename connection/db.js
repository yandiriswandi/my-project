const { Pool } = require('pg');

const dbPool = new Pool({
  database: 'project2',
  port: '5432',
  user: 'postgres',
  password: 'rinamuyandiku02',
});

module.exports = dbPool;
