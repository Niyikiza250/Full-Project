const { Role, Permission, User } = require('../models');
const { success, error } = require('../utils/response');

const listRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ order: [['hierarchy', 'ASC']] });
    return success(res, roles);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const getRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return error(res, 'Role not found', 404);
    return success(res, role);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const createRole = async (req, res) => {
  try {
    const { name, description, hierarchy } = req.body;
    if (!name) return error(res, 'Role name is required', 400);

    const existing = await Role.findOne({ where: { name } });
    if (existing) return error(res, 'Role already exists', 400);

    const role = await Role.create({ name, description, hierarchy: hierarchy || 0 });
    return success(res, role, 'Role created', 201);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return error(res, 'Role not found', 404);

    const allowedFields = ['name', 'description', 'hierarchy'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    await role.update(updates);
    return success(res, role, 'Role updated');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return error(res, 'Role not found', 404);

    const userCount = await User.count({ where: { roleId: role.id } });
    if (userCount > 0) return error(res, 'Cannot delete role with assigned users', 400);

    await role.destroy();
    return success(res, null, 'Role deleted');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const listPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({ order: [['group', 'ASC'], ['name', 'ASC']] });
    return success(res, permissions);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

module.exports = { listRoles, getRole, createRole, updateRole, deleteRole, listPermissions };
