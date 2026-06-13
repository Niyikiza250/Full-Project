const { Op } = require('sequelize');
const { Union, Field, District, Church, Ministry, User, Role, AuditLog } = require('../models');
const { success, error, paginated } = require('../utils/response');
const logger = require('../utils/logger');

// === UNIONS ===
const listUnions = async (req, res) => {
  try {
    const unions = await Union.findAll({ order: [['name', 'ASC']] });
    return success(res, unions);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getUnion = async (req, res) => {
  try {
    const union = await Union.findByPk(req.params.id, {
      include: [{ model: Field, as: 'fields' }],
    });
    if (!union) return error(res, 'Union not found', 404);
    return success(res, union);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createUnion = async (req, res) => {
  try {
    const { name, code, address } = req.body;
    if (!name) return error(res, 'Name is required', 400);

    const union = await Union.create({ name, code, address, createdBy: req.user.id });
    return success(res, union, 'Union created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateUnion = async (req, res) => {
  try {
    const union = await Union.findByPk(req.params.id);
    if (!union) return error(res, 'Union not found', 404);
    const unionAllowedFields = ['name', 'code', 'address'];
    const unionUpdates = {};
    for (const field of unionAllowedFields) {
      if (req.body[field] !== undefined) unionUpdates[field] = req.body[field];
    }
    await union.update(unionUpdates);
    return success(res, union, 'Union updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteUnion = async (req, res) => {
  try {
    const union = await Union.findByPk(req.params.id);
    if (!union) return error(res, 'Union not found', 404);
    const fieldCount = await Field.count({ where: { unionId: union.id } });
    if (fieldCount > 0) return error(res, 'Cannot delete union with associated fields', 400);
    await union.destroy();
    return success(res, null, 'Union deleted');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// === FIELDS ===
const listFields = async (req, res) => {
  try {
    const where = {};
    if (req.query.unionId) where.unionId = req.query.unionId;
    if (req.query.search) {
      where.name = { [Op.iLike]: `%${req.query.search}%` };
    }
    if (req.query.status) where.status = req.query.status;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const { rows, count } = await Field.findAndCountAll({
      where,
      include: [
        { model: Union, as: 'union', attributes: ['id', 'name'] },
        { model: District, as: 'districts', attributes: ['id', 'name'] },
      ],
      order: [['name', 'ASC']],
      offset,
      limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getField = async (req, res) => {
  try {
    const field = await Field.findByPk(req.params.id, {
      include: [
        { model: Union, as: 'union' },
        { model: District, as: 'districts' },
      ],
    });
    if (!field) return error(res, 'Field not found', 404);
    return success(res, field);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createField = async (req, res) => {
  try {
    const { name, code, unionId } = req.body;
    if (!name || !unionId) return error(res, 'Name and unionId are required', 400);

    const field = await Field.create({ name, code, unionId, createdBy: req.user.id });
    return success(res, field, 'Field created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateField = async (req, res) => {
  try {
    const field = await Field.findByPk(req.params.id);
    if (!field) return error(res, 'Field not found', 404);
    const fieldAllowedFields = ['name', 'code', 'unionId'];
    const fieldUpdates = {};
    for (const f of fieldAllowedFields) {
      if (req.body[f] !== undefined) fieldUpdates[f] = req.body[f];
    }
    await field.update(fieldUpdates);
    return success(res, field, 'Field updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteField = async (req, res) => {
  try {
    const field = await Field.findByPk(req.params.id);
    if (!field) return error(res, 'Field not found', 404);

    const districtCount = await District.count({ where: { fieldId: field.id } });
    if (districtCount > 0) return error(res, 'Cannot delete field with associated districts', 400);

    await field.destroy();
    return success(res, null, 'Field deleted');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// === DISTRICTS ===
const listDistricts = async (req, res) => {
  try {
    const where = {};
    if (req.query.fieldId) where.fieldId = req.query.fieldId;
    if (req.query.search) {
      where.name = { [Op.iLike]: `%${req.query.search}%` };
    }
    if (req.query.status) where.status = req.query.status;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const { rows, count } = await District.findAndCountAll({
      where,
      include: [
        { model: Field, as: 'field', attributes: ['id', 'name'] },
        { model: Church, as: 'churches', attributes: ['id', 'name'] },
      ],
      order: [['name', 'ASC']],
      offset,
      limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getDistrict = async (req, res) => {
  try {
    const district = await District.findByPk(req.params.id, {
      include: [
        { model: Field, as: 'field' },
        { model: Church, as: 'churches' },
      ],
    });
    if (!district) return error(res, 'District not found', 404);
    return success(res, district);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createDistrict = async (req, res) => {
  try {
    const { name, fieldId } = req.body;
    if (!name || !fieldId) return error(res, 'Name and fieldId are required', 400);

    const district = await District.create({ name, fieldId, createdBy: req.user.id });
    return success(res, district, 'District created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateDistrict = async (req, res) => {
  try {
    const district = await District.findByPk(req.params.id);
    if (!district) return error(res, 'District not found', 404);
    const districtAllowedFields = ['name', 'fieldId'];
    const districtUpdates = {};
    for (const f of districtAllowedFields) {
      if (req.body[f] !== undefined) districtUpdates[f] = req.body[f];
    }
    await district.update(districtUpdates);
    return success(res, district, 'District updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteDistrict = async (req, res) => {
  try {
    const district = await District.findByPk(req.params.id);
    if (!district) return error(res, 'District not found', 404);

    const churchCount = await Church.count({ where: { districtId: district.id } });
    if (churchCount > 0) return error(res, 'Cannot delete district with associated churches', 400);

    await district.destroy();
    return success(res, null, 'District deleted');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// === CHURCHES ===
const listChurches = async (req, res) => {
  try {
    const where = {};
    if (req.query.districtId) where.districtId = req.query.districtId;
    if (req.query.fieldId) {
      const districts = await District.findAll({ where: { fieldId: req.query.fieldId }, attributes: ['id'] });
      where.districtId = districts.map(d => d.id);
    }
    if (req.query.search) {
      where.name = { [Op.iLike]: `%${req.query.search}%` };
    }
    if (req.query.status) {
      where.status = req.query.status;
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const { rows, count } = await Church.findAndCountAll({
      where,
      include: [
        { model: District, as: 'district', attributes: ['id', 'name'] },
        { model: Field, as: 'field', attributes: ['id', 'name'] },
      ],
      order: [['name', 'ASC']],
      offset,
      limit,
    });
    return paginated(res, rows, count, page, limit);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const listNearbyChurches = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    if (!lat || !lng) {
      return error(res, 'Latitude and longitude are required', 400);
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxDist = parseFloat(radius);

    const churches = await Church.findAll({
      where: {
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
        status: 'ACTIVE',
      },
      include: [
        { model: District, as: 'district', attributes: ['id', 'name'] },
        { model: Field, as: 'field', attributes: ['id', 'name'] },
      ],
    });

    const earthRadius = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;

    const nearby = churches
      .map((c) => {
        const dLat = toRad(c.latitude - userLat);
        const dLng = toRad(c.longitude - userLng);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(userLat)) * Math.cos(toRad(c.latitude)) * Math.sin(dLng / 2) ** 2;
        const distance = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { ...c.toJSON(), distance: Math.round(distance * 100) / 100 };
      })
      .filter((c) => c.distance <= maxDist)
      .sort((a, b) => a.distance - b.distance);

    return success(res, nearby, 'Nearby churches retrieved');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getChurch = async (req, res) => {
  try {
    const church = await Church.findByPk(req.params.id, {
      include: [
        { model: District, as: 'district' },
        { model: Ministry, as: 'ministries' },
      ],
    });
    if (!church) return error(res, 'Church not found', 404);
    return success(res, church);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createChurch = async (req, res) => {
  try {
    const { name, districtId, zoneName, address } = req.body;
    if (!name || !districtId) return error(res, 'Name and districtId are required', 400);

    const church = await Church.create({ name, districtId, zoneName, address, createdBy: req.user.id });
    return success(res, church, 'Church created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateChurch = async (req, res) => {
  try {
    const church = await Church.findByPk(req.params.id);
    if (!church) return error(res, 'Church not found', 404);
    const churchAllowedFields = ['name', 'districtId', 'zoneName', 'address'];
    const churchUpdates = {};
    for (const f of churchAllowedFields) {
      if (req.body[f] !== undefined) churchUpdates[f] = req.body[f];
    }
    await church.update(churchUpdates);
    return success(res, church, 'Church updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteChurch = async (req, res) => {
  try {
    const church = await Church.findByPk(req.params.id);
    if (!church) return error(res, 'Church not found', 404);
    await church.destroy();
    return success(res, null, 'Church deleted');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// === MINISTRIES ===
const listMinistries = async (req, res) => {
  try {
    const where = {};
    if (req.query.churchId) where.churchId = req.query.churchId;

    const ministries = await Ministry.findAll({
      where,
      order: [['name', 'ASC']],
    });
    return success(res, ministries);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createMinistry = async (req, res) => {
  try {
    const { name, description, churchId } = req.body;
    if (!name) return error(res, 'Name is required', 400);

    const ministry = await Ministry.create({ name, description, churchId, createdBy: req.user.id });
    return success(res, ministry, 'Ministry created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateMinistry = async (req, res) => {
  try {
    const ministry = await Ministry.findByPk(req.params.id);
    if (!ministry) return error(res, 'Ministry not found', 404);
    const ministryAllowedFields = ['name', 'description', 'churchId'];
    const ministryUpdates = {};
    for (const f of ministryAllowedFields) {
      if (req.body[f] !== undefined) ministryUpdates[f] = req.body[f];
    }
    await ministry.update(ministryUpdates);
    return success(res, ministry, 'Ministry updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteMinistry = async (req, res) => {
  try {
    const ministry = await Ministry.findByPk(req.params.id);
    if (!ministry) return error(res, 'Ministry not found', 404);
    await ministry.destroy();
    return success(res, null, 'Ministry deleted');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

// === MINISTRY MEMBER ASSIGNMENT ===
const assignMinistryMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const { id } = req.params;

    const ministry = await Ministry.findByPk(id);
    if (!ministry) return error(res, 'Ministry not found', 404);

    const user = await User.findByPk(userId);
    if (!user) return error(res, 'User not found', 404);

    await user.update({
      ministryId: id,
      assignedBy: req.user.id,
      assignedRole: role || null,
      roleAssignedAt: new Date(),
    });

    await AuditLog.create({
      actor: req.user.id,
      action: 'MINISTRY_MEMBER_ASSIGNED',
      target: user.id,
      targetType: 'User',
      metadata: { ministryId: id, ministryName: ministry.name, role: role || null },
    });

    const result = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }],
    });

    return success(res, result, 'User assigned to ministry');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const assignMinistryLeader = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    const ministry = await Ministry.findByPk(id);
    if (!ministry) return error(res, 'Ministry not found', 404);

    const user = await User.findByPk(userId);
    if (!user) return error(res, 'User not found', 404);

    await ministry.update({ leaderId: userId });

    await user.update({
      ministryId: id,
      assignedBy: req.user.id,
      assignedRole: 'MINISTRY_LEADER',
      roleAssignedAt: new Date(),
    });

    await AuditLog.create({
      actor: req.user.id,
      action: 'MINISTRY_LEADER_ASSIGNED',
      target: ministry.id,
      targetType: 'Ministry',
      metadata: { ministryName: ministry.name, leaderId: userId },
    });

    return success(res, ministry, 'Ministry leader assigned');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const removeMinistryMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    const ministry = await Ministry.findByPk(id);
    if (!ministry) return error(res, 'Ministry not found', 404);

    const user = await User.findByPk(userId);
    if (!user) return error(res, 'User not found', 404);

    await user.update({
      ministryId: null,
      assignedBy: req.user.id,
      assignedRole: null,
      roleAssignedAt: null,
    });

    if (ministry.leaderId === userId) {
      await ministry.update({ leaderId: null });
    }

    await AuditLog.create({
      actor: req.user.id,
      action: 'MINISTRY_MEMBER_REMOVED',
      target: user.id,
      targetType: 'User',
      metadata: { ministryId: id, ministryName: ministry.name },
    });

    return success(res, null, 'User removed from ministry');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = {
  listUnions, getUnion, createUnion, updateUnion, deleteUnion,
  listFields, getField, createField, updateField, deleteField,
  listDistricts, getDistrict, createDistrict, updateDistrict, deleteDistrict,
  listChurches, getChurch, createChurch, updateChurch, deleteChurch,
  listNearbyChurches,
  listMinistries, createMinistry, updateMinistry, deleteMinistry,
  assignMinistryMember, assignMinistryLeader, removeMinistryMember,
};
