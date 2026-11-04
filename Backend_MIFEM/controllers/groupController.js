const { SmallGroup, GroupMember, Member, Church } = require('../models');
const { paginated } = require('../utils/response');

const listGroups = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, churchId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (churchId) where.churchId = churchId;
    if (!req.user.role || req.user.role.name !== 'SUPER_ADMIN') {
      if (req.user.churchId) where.churchId = req.user.churchId;
    }

    const { count, rows } = await SmallGroup.findAndCountAll({
      where,
      include: [
        { model: Church, as: 'church', attributes: ['id', 'name'] },
        { model: GroupMember, as: 'members', attributes: ['id', 'memberId', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const getGroup = async (req, res, next) => {
  try {
    const group = await SmallGroup.findByPk(req.params.id, {
      include: [
        { model: Church, as: 'church', attributes: ['id', 'name'] },
        { model: GroupMember, as: 'members', include: [{ model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName'] }] },
      ],
    });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    return res.json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    if (req.user.churchId) data.churchId = req.user.churchId;
    const group = await SmallGroup.create(data);
    return res.status(201).json({ success: true, data: group, message: 'Group created' });
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const group = await SmallGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    await group.update(req.body);
    return res.json({ success: true, data: group, message: 'Group updated' });
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const group = await SmallGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    await group.destroy();
    return res.json({ success: true, message: 'Group deleted' });
  } catch (error) {
    next(error);
  }
};

const addGroupMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = await SmallGroup.findByPk(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const member = await Member.findByPk(req.body.memberId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const existing = await GroupMember.findOne({ where: { groupId, memberId: req.body.memberId } });
    if (existing) return res.status(400).json({ success: false, message: 'Member already in group' });

    const groupMember = await GroupMember.create({ ...req.body, groupId });
    return res.status(201).json({ success: true, data: groupMember, message: 'Member added to group' });
  } catch (error) {
    next(error);
  }
};

const removeGroupMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const groupMember = await GroupMember.findOne({ where: { groupId, memberId } });
    if (!groupMember) return res.status(404).json({ success: false, message: 'Group member not found' });
    await groupMember.destroy();
    return res.json({ success: true, message: 'Member removed from group' });
  } catch (error) {
    next(error);
  }
};

const listGroupMembers = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await GroupMember.findAndCountAll({
      where: { groupId },
      include: [
        { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
      ],
      order: [['joinedAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listGroups, getGroup, createGroup, updateGroup, deleteGroup,
  addGroupMember, removeGroupMember, listGroupMembers,
};
