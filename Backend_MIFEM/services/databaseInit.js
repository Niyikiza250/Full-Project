const { sequelize } = require('../config/db');
const logger = require('../utils/logger');
const { createDatabaseIfNotExists } = require('../database/init');

const initializeDatabase = async () => {
  logger.info('=== Database Initialization Started ===');

  logger.info('Step 1: Verifying PostgreSQL server...');
  await createDatabaseIfNotExists();
  logger.info('Step 2: Database verified/created');

  logger.info('Step 3: Connecting Sequelize...');
  await sequelize.authenticate();
  logger.info('Step 4: PostgreSQL connected successfully');

  logger.info('Step 5: Loading models...');
  const models = require('../models');
  logger.info(`Step 6: ${Object.keys(models).length} models registered`);

  logger.info('Step 7: Creating associations...');
  require('../models').setupAssociations();
  logger.info('Step 8: Associations created');

  logger.info('Step 9: Synchronizing models with database...');

  try {
    if (process.env.NODE_ENV === 'production') {
      await sequelize.sync();
      logger.info('Step 10: Tables synced (production mode)');
    } else {
      await castMemberIntegerColumns();
      await sequelize.sync({ alter: true });
      logger.info('Step 10: Tables synced with alter (development mode)');
    }
  } catch (syncErr) {
    logger.warn(`Sync warning (non-critical): ${syncErr.message}`);
    logger.info('Attempting fallback sync without alter...');
    try {
      await sequelize.sync();
      logger.info('Step 10: Tables synced (fallback mode)');
    } catch (fallbackErr) {
      logger.warn(`Fallback sync also failed: ${fallbackErr.message}`);
      logger.info('Step 10: Continuing with existing tables...');
    }
  }

  const tableCount = await getTableCount();
  logger.info(`Step 11: ${tableCount} tables ready`);

  logger.info('=== Database Initialization Complete ===');

  return { tableCount };
};

const castMemberIntegerColumns = async () => {
  const columns = [
    { table: 'Members', column: 'province_code' },
    { table: 'Members', column: 'district_code' },
    { table: 'Members', column: 'cell_code' },
    { table: 'Members', column: 'village_code' },
  ];

  for (const { table, column } of columns) {
    try {
      const [rows] = await sequelize.query(
        `SELECT data_type FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`
      );
      if (rows.length === 0) continue;

      const currentType = rows[0].data_type;
      if (currentType === 'integer' || currentType === 'bigint') continue;

      logger.info(`Casting ${table}.${column} from ${currentType} to integer`);
      await sequelize.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE INTEGER USING "${column}"::integer`
      );
    } catch (err) {
      logger.warn(`Could not cast ${table}.${column}: ${err.message}`);
    }
  }
};

const getTableCount = async () => {
  try {
    const result = await sequelize.query(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return parseInt(result[0]?.count || 0, 10);
  } catch {
    return 0;
  }
};

module.exports = { initializeDatabase };
