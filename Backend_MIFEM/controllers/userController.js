const { User, Role, AuditLog, AdminActivityLog } = require('../models');
const { success, error, paginated } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { search, role, status, fieldId, churchId } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) where.roleId = role;
    if (status) where.accountStatus = status;
    if (fieldId) where.fieldId = fieldId;
    if (churchId) where.churchId = churchId;

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name', 'hierarchy'] }],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    logger.error(`List users error: ${err.message}`);
    return error(res, 'Server error', 500, err.message);
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }],
    });
    if (!user) return error(res, 'User not found', 404);
    return success(res, user);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const RESTRICTED_ROLES = ['SUPER_ADMIN', 'UNION_LEADER'];

const resolveRoleId = async (roleOrId) => {
  if (!roleOrId) return null;
  const role = await Role.findByPk(roleOrId);
  if (role) return role.id;
  const roleByName = await Role.findOne({ where: { name: roleOrId } });
  return roleByName ? roleByName.id : null;
};

const checkRoleAssignmentAllowed = async (req, targetRoleId) => {
  const userRoleName = req.user.role ? (req.user.role.name || req.user.role) : '';
  if (userRoleName !== 'FIELD_ADMINISTRATOR') return true;
  const targetRole = await Role.findByPk(targetRoleId);
  if (!targetRole) return true;
  if (RESTRICTED_ROLES.includes(targetRole.name)) {
    return false;
  }
  return true;
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, roleId, role: roleName, unionId, fieldId, districtId, churchId, ministryId, accountStatus } = req.body;
    const resolvedRoleId = await resolveRoleId(roleId || roleName);

    if (!name || !email || !password || !resolvedRoleId) {
      return error(res, 'Name, email, password, and role are required', 400);
    }

    const allowed = await checkRoleAssignmentAllowed(req, resolvedRoleId);
    if (!allowed) return error(res, 'Cannot assign the specified role. You do not have permission for this role assignment.', 403);

    const existing = await User.findOne({ where: { email } });
    if (existing) return error(res, 'Email already in use', 400);

    const user = await User.create({
      name, email, password, phone, roleId: resolvedRoleId,
      unionId, fieldId, districtId, churchId, ministryId,
      accountStatus: accountStatus || 'ACTIVE',
      createdBy: req.user.id,
    });

    await AdminActivityLog.create({
      userId: req.user.id,
      description: `Created user ${name} (${email})`,
    });

    const result = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }],
    });

    return success(res, result, 'User created successfully', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    const allowedFields = ['name', 'email', 'phone', 'password', 'unionId', 'fieldId', 'districtId', 'churchId', 'ministryId', 'accountStatus', 'profilePicture', 'location', 'rolePermissions', 'mfaEnabled', 'temporaryPasswordStatus'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.body.roleId || req.body.role) {
      const resolved = await resolveRoleId(req.body.roleId || req.body.role);
      if (resolved) {
        const allowed = await checkRoleAssignmentAllowed(req, resolved);
        if (!allowed) return error(res, 'Cannot assign the specified role. You do not have permission for this role assignment.', 403);
        updates.roleId = resolved;
      }
    }

    await user.update(updates);

    await AdminActivityLog.create({
      userId: req.user.id,
      description: `Updated user ${user.name}`,
      metadata: { changes: Object.keys(updates) },
    });

    const result = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }],
    });

    return success(res, result, 'User updated successfully');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    await user.destroy();

    await AdminActivityLog.create({
      userId: req.user.id,
      description: `Deleted user ${user.name} (${user.email})`,
    });

    return success(res, null, 'User deleted successfully');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const bulkImportUsers = async (req, res) => {
  try {
    const { users } = req.body;
    if (!users || !Array.isArray(users) || users.length === 0) {
      return error(res, 'Users array is required', 400);
    }

    const results = { created: 0, failed: 0, errors: [] };

    for (const userData of users) {
      try {
        const existing = await User.findOne({ where: { email: userData.email } });
        if (existing) {
          results.failed++;
          results.errors.push({ email: userData.email, reason: 'Already exists' });
          continue;
        }

        await User.create({
          ...userData,
          password: userData.password || 'default123',
          createdBy: req.user.id,
        });
        results.created++;
      } catch (e) {
        results.failed++;
        results.errors.push({ email: userData.email, reason: e.message });
      }
    }

    await AdminActivityLog.create({
      userId: req.user.id,
      description: `Bulk imported ${results.created} users (${results.failed} failed)`,
    });

    return success(res, results, `Imported ${results.created} users`);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, bulkImportUsers };
