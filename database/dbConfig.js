const knex = require('knex');

const knexConfig = require('../knexfile.js');
const myEnv = process.env.DB_ENV || 'development';

module.exports = knex(knexConfig[myEnv]);
