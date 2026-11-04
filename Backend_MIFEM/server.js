const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { initializeDatabase } = require('./services/databaseInit');
const logger = require('./utils/logger');

const app = express();

// Respect reverse-proxy headers so rate limiting and client IPs are correct
app.set('trust proxy', 1);

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS - Support multiple origins (comma-separated)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
// Apply the general limiter to API traffic only (uploads/static stay unlimited)
app.use('/api', generalLimiter);

// Body parsing (10MB limit to prevent DoS attacks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/members', require('./routes/members'));
app.use('/api/events', require('./routes/events'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/achievement', require('./routes/achievement'));
app.use('/api/hero-slides', require('./routes/heroSlides'));
app.use('/api/system-settings', require('./routes/systemSettings'));
app.use('/api/churches', require('./routes/churches'));
app.use('/api/blue-cards', require('./routes/blueCards'));
app.use('/api/communication', require('./routes/communication'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/communication/bulletins', require('./routes/bulletin'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/health', require('./routes/health'));
app.use('/api/locations', require('./routes/locations'));

// New Modules
app.use('/api/prayer', require('./routes/prayer'));
app.use('/api/training', require('./routes/training'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/communication/groups', require('./routes/groupMessages'));
app.use('/api/communication/forums', require('./routes/forums'));
app.use('/api/volunteers/hours', require('./routes/serviceHours'));
app.use('/api/volunteers/recognitions', require('./routes/recognitions'));
app.use('/api/volunteers/availability', require('./routes/availability'));
app.use('/api/tasks', require('./routes/tasks'));

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MIFEM Backend API is running',
    version: '2.0.0',
    docs: '/api/health',
  });
});

// New Modules
app.use('/api/groups', require('./routes/groups'));
app.use('/api/special-needs', require('./routes/specialNeeds'));
app.use('/api/privacy', require('./routes/privacy'));

// Error handler
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    logger.info('MIFEM Backend v2.0.0');
    logger.info('======================');
    logger.info('Starting server initialization...');

    await initializeDatabase();

    // Seeding is enabled by default in development only.
    // In production set SEED_ON_STARTUP=true to opt in.
    const shouldSeed =
      process.env.NODE_ENV !== 'production' || process.env.SEED_ON_STARTUP === 'true';

    if (shouldSeed) {
      // Seed church structure data
      const { seedSdaData } = require('./seeders/sdaData');
      await seedSdaData();

      // Seed roles, permissions, and demo users
      const { seed } = require('./seeders');
      await seed();
    } else {
      logger.info('Startup seeding skipped (production). Set SEED_ON_STARTUP=true to enable.');
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API: http://localhost:${PORT}/api`);
      logger.info(`Health: http://localhost:${PORT}/api/health`);
      logger.info('======================');
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

start();
