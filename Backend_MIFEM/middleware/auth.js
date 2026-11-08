const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
        include: ['role'],
      });

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (req.user.accountStatus !== 'ACTIVE') {
        return res.status(403).json({ success: false, message: 'Account is not active' });
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
      }

      logger.error(`Authentication lookup failed: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Unable to verify user account' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const userRoleName = req.user.role.name || req.user.role;
    if (!roles.includes(userRoleName)) {
      return res.status(403).json({
        success: false,
        message: `Role ${userRoleName} not authorized. Required: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
