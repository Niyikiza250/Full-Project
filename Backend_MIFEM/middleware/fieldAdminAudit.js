const { AuditLog } = require('../models');

const fieldAdminAudit = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      if (res.statusCode < 400 && req.user) {
        const roleName = req.user.role ? (req.user.role.name || req.user.role) : '';
        if (roleName === 'FIELD_ADMINISTRATOR' || roleName === 'SUPER_ADMIN') {
          try {
            await AuditLog.create({
              actor: req.user.id,
              action: action || `${req.method}_${req.originalUrl}`,
              target: req.params.id || null,
              targetType: 'FieldAdminAction',
              metadata: {
                method: req.method,
                path: req.originalUrl,
                fieldId: req.user.fieldId,
                body: req.method !== 'GET' ? { ...req.body, password: undefined } : undefined,
              },
              ipAddress: req.ip || req.connection?.remoteAddress,
            });
          } catch (err) {
            console.error('Audit log error:', err.message);
          }
        }
      }
      return originalJson(body);
    };

    next();
  };
};

const logAudit = async ({ actor, action, target, targetType, metadata, ipAddress }) => {
  try {
    await AuditLog.create({ actor, action, target, targetType, metadata, ipAddress });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { fieldAdminAudit, logAudit };
