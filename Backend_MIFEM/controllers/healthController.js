const { sequelize } = require('../config/db');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');

const healthCheck = async (req, res) => {
  try {
    let dbStatus = 'disconnected';
    let tableCount = 0;
    let tables = [];

    try {
      await sequelize.authenticate();
      dbStatus = 'connected';

      const result = await sequelize.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
        { type: sequelize.QueryTypes.SELECT }
      );
      tables = result.map(r => r.table_name);
      tableCount = tables.length;
    } catch (dbErr) {
      dbStatus = `error: ${dbErr.message}`;
    }

    return success(res, {
      database: dbStatus,
      database_name: process.env.DB_NAME || 'mifem_db',
      tables_created: tables,
      total_tables: tableCount,
      uptime: process.uptime(),
      node_version: process.version,
      environment: process.env.NODE_ENV || 'development',
    }, 'Health check successful');
  } catch (err) {
    logger.error(`Health check error: ${err.message}`);
    return error(res, 'Health check failed', 500);
  }
};

const databaseHealth = async (req, res) => {
  try {
    await sequelize.authenticate();

    const tableResult = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const tables = tableResult.map(r => r.table_name);

    return success(res, {
      database: 'connected',
      database_name: process.env.DB_NAME || 'mifem_db',
      tables_created: tables,
      total_tables: tables.length,
    });
  } catch (err) {
    return success(res, {
      database: 'disconnected',
      error: err.message,
    });
  }
};

module.exports = { healthCheck, databaseHealth };
