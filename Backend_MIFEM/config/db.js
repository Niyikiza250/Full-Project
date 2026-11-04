const { Sequelize } = require('sequelize');

const resolveDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
  if (DB_HOST && DB_NAME) {
    const user = encodeURIComponent(DB_USER || 'postgres');
    const password = DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : '';
    return `postgresql://${user}${password}@${DB_HOST}:${DB_PORT || 5432}/${DB_NAME}`;
  }

  throw new Error('DATABASE_URL (or DB_HOST/DB_NAME) environment variable is required.');
};

const sequelize = new Sequelize(resolveDatabaseUrl(), {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');
  } catch (error) {
    console.error(`PostgreSQL Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
