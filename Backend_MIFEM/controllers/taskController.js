const { Task, User, AuditLog } = require('../models');
const { success, error, paginated } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const listTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { status, priority, assignedTo, fieldId, churchId, ministryId, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;
    if (fieldId) where.fieldId = fieldId;
    if (churchId) where.churchId = churchId;
    if (ministryId) where.ministryId = ministryId;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    if (req.hierarchyScope && req.hierarchyScope.level !== 'ALL') {
      if (req.hierarchyScope.ids.fieldId) where.fieldId = req.hierarchyScope.ids.fieldId;
      if (req.hierarchyScope.ids.churchId) where.churchId = req.hierarchyScope.ids.churchId;
      if (req.hierarchyScope.ids.ministryId) where.ministryId = req.hierarchyScope.ids.ministryId;
    }

    const { rows, count } = await Task.findAndCountAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assigner', attributes: ['id', 'name', 'email'] },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    logger.error(`List tasks error: ${err.message}`);
    return error(res, 'Server error', 500, err.message);
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assigner', attributes: ['id', 'name', 'email'] },
      ],
    });
    if (!task) return error(res, 'Task not found', 404);
    return success(res, task);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, fieldId, churchId, ministryId, priority, dueDate } = req.body;
    if (!title) return error(res, 'Title is required', 400);

    const task = await Task.create({
      title, description, assignedTo, assignedBy: req.user.id,
      fieldId, churchId, ministryId, priority: priority || 'MEDIUM', dueDate,
    });

    await AuditLog.create({
      actor: req.user.id,
      action: 'TASK_CREATED',
      target: task.id,
      targetType: 'Task',
      metadata: { title, assignedTo, fieldId },
    });

    return success(res, task, 'Task created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return error(res, 'Task not found', 404);

    const allowedFields = ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate', 'fieldId', 'churchId', 'ministryId'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (req.body.status === 'COMPLETED') {
      updates.completedAt = new Date();
    }

    await task.update(updates);

    await AuditLog.create({
      actor: req.user.id,
      action: 'TASK_UPDATED',
      target: task.id,
      targetType: 'Task',
      metadata: { changes: Object.keys(updates) },
    });

    return success(res, task, 'Task updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return error(res, 'Task not found', 404);
    await task.destroy();

    await AuditLog.create({
      actor: req.user.id,
      action: 'TASK_DELETED',
      target: task.id,
      targetType: 'Task',
    });

    return success(res, null, 'Task deleted');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
