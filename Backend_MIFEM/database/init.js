const { Pool } = require('pg');
const logger = require('../utils/logger');

const parseDatabaseUrl = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required. Set it in your .env file (e.g., postgres://user:password@host:5432/mifem_db)');
  }
  const url = process.env.DATABASE_URL;
  const pattern = /^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
  const match = url.match(pattern);
  if (!match) {
    throw new Error('DATABASE_URL is not a valid PostgreSQL connection string. Expected format: postgres://user:password@host:port/database');
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
