const { Pool } = require('pg');
const logger = require('../utils/logger');

const parseDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || 'postgres://postgres:12345@127.0.0.1:5432/mifem_db';
  const pattern = /^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = url.match(pattern);
  if (!match) {
    return {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'mifem_db',
    };
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5],
  };
};

const createDatabaseIfNotExists = async () => {
  const config = parseDatabaseUrl();
  const dbName = config.database;

  const pool = new Pool({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    database: 'postgres',
  });

  try {
    const result = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      await pool.query(`CREATE DATABASE "${dbName}"`);
      logger.info(`Database "${dbName}" created successfully`);
    } else {
      logger.info(`Database "${dbName}" already exists`);
    }
  } catch (err) {
    logger.error(`Database creation error: ${err.message}`);
    throw err;
  } finally {
    await pool.end();
  }
};

module.exports = { createDatabaseIfNotExists };
