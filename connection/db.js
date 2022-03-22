const { Pool } = require('pg');

const dbPool = new Pool({
  // database: 'project2',
  // port: '5432',
  // user: 'postgres',
  // password: 'rinamuyandiku02',
  Host : 'ec2-3-222-204-187.compute-1.amazonaws.com',
  Database : 'dcl67u9b4n7gpf',
  User : 'nsnvhmdkzkydmb',
  Port : '5432',
  Password : '0fb7a7e966d5e4cbb293333dfa72786883f11f7c51d01af7523219fbe7ddb57a',
  // URI : postgres://nsnvhmdkzkydmb:0fb7a7e966d5e4cbb293333dfa72786883f11f7c51d01af7523219fbe7ddb57a@ec2-3-222-204-187.compute-1.amazonaws.com:5432/dcl67u9b4n7gpf
  // Heroku : CLI heroku pg:psql postgresql-aerodynamic-18275 --app my-project02
});

module.exports = dbPool;
