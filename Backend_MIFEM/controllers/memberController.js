const { Member, MemberProfile, MemberActivity, MemberChangeRequest, Church } = require('../models');
const { success, error, paginated } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { rwandaLocation } = require('@devrw/rwanda-location');

const listMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { search, status, gender, churchId, fieldId, sabbathClass } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (churchId) where.churchId = churchId;
    if (sabbathClass) where.sabbathClass = sabbathClass;

    const { rows, count } = await Member.findAndCountAll({
      where,
      include: [{ model: Church, as: 'church', attributes: ['id', 'name', 'districtId'] }],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    logger.error(`List members error: ${err.message}`);
    return error(res, 'Server error', 500, err.message);
  }
};

const getMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        { model: Church, as: 'church' },
        { model: MemberProfile, as: 'profile' },
        { model: MemberActivity, as: 'activities', order: [['date', 'DESC']] },
      ],
    });
    if (!member) return error(res, 'Member not found', 404);
    return success(res, member);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createMember = async (req, res) => {
  try {
    const { 
      firstName, lastName, email, phone, gender, dateOfBirth, baptismDate, address, status, sabbathClass, churchId,
      provinceCode, provinceName, districtCode, districtName, sectorCode, sectorName, cellCode, cellName, villageCode, villageName,
      registrationType
    } = req.body;

    if (!firstName || !lastName) {
      return error(res, 'First name and last name are required', 400);
    }

    if (registrationType === 'VOLUNTEER') {
      if (!provinceCode || !districtCode || !sectorCode || !cellCode || !villageCode) {
        return error(res, 'Complete location information is required.', 400);
      }

      const province = rwandaLocation.getProvinceByCode(provinceCode);
      if (!province) return error(res, 'Invalid province', 400);

      const districts = rwandaLocation.getDistricts(provinceCode);
      if (!districts?.find(d => d.code === districtCode)) return error(res, 'District does not belong to Province or is invalid', 400);

      const sectors = rwandaLocation.getSectors(districtCode);
      if (!sectors?.find(s => s.code === sectorCode)) return error(res, 'Sector does not belong to District or is invalid', 400);

      const cells = rwandaLocation.getCells(sectorCode);
      if (!cells?.find(c => c.code === cellCode)) return error(res, 'Cell does not belong to Sector or is invalid', 400);

      const villages = rwandaLocation.getVillages(cellCode);
      if (!villages?.find(v => v.code === villageCode)) return error(res, 'Village does not belong to Cell or is invalid', 400);
    }

    const member = await Member.create({
      firstName, lastName, email, phone, gender, dateOfBirth, baptismDate,
      address, status: status || 'ACTIVE', sabbathClass, churchId,
      provinceCode, provinceName, districtCode, districtName, sectorCode, sectorName, cellCode, cellName, villageCode, villageName,
      registrationType: registrationType || 'MEMBER',
      createdBy: req.user.id,
    });

    return success(res, member, 'Member created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return error(res, 'Member not found', 404);

    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth', 'baptismDate', 'address', 'status', 'sabbathClass', 'churchId', 'imageUrl', 'provinceCode', 'provinceName', 'districtCode', 'districtName', 'sectorCode', 'sectorName', 'cellCode', 'cellName', 'villageCode', 'villageName', 'registrationType'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    updates.updatedBy = req.user.id;

    await member.update(updates);
    return success(res, member, 'Member updated');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return error(res, 'Member not found', 404);

    await member.destroy();
    return success(res, null, 'Member deleted');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const getMemberActivities = async (req, res) => {
  try {
    const activities = await MemberActivity.findAll({
      where: { memberId: req.params.id },
      order: [['date', 'DESC']],
    });
    return success(res, activities);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createMemberActivity = async (req, res) => {
  try {
    const { type, description, date } = req.body;
    if (!type) return error(res, 'Activity type is required', 400);

    const activity = await MemberActivity.create({
      memberId: req.params.id,
      type, description, date,
      performedBy: req.user.id,
    });

    return success(res, activity, 'Activity created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const listChangeRequests = async (req, res) => {
  try {
    const requests = await MemberChangeRequest.findAll({
      order: [['createdAt', 'DESC']],
    });
    return success(res, requests);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const approveChangeRequest = async (req, res) => {
  try {
    const request = await MemberChangeRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    if (request.type === 'CREATE' && request.status === 'PENDING') {
      const changes = request.changes;
      await Member.create({ ...changes, createdBy: req.user.id });
    } else if (request.type === 'UPDATE' && request.status === 'PENDING') {
      await Member.update(request.changes, { where: { id: request.memberId } });
    }

    await request.update({ status: 'APPROVED', reviewedBy: req.user.id, reviewedAt: new Date() });
    return success(res, request, 'Request approved');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const rejectChangeRequest = async (req, res) => {
  try {
    const request = await MemberChangeRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found', 404);
    if (request.status !== 'PENDING') return error(res, 'Request already processed', 400);

    const { reason } = req.body;
    await request.update({
      status: 'REJECTED',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      rejectionReason: reason || '',
    });

    return success(res, request, 'Request rejected');
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

const createChangeRequest = async (req, res) => {
  try {
    const { memberId, type, changes } = req.body;
    if (!type || !changes) return error(res, 'Type and changes are required', 400);

    const request = await MemberChangeRequest.create({
      memberId: memberId || null,
      type,
      changes,
      submittedBy: req.user.id,
      submittedByRole: req.user.role || '',
      status: 'PENDING',
    });

    return success(res, request, 'Change request created', 201);
  } catch (err) {
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { listMembers, getMember, createMember, updateMember, deleteMember, getMemberActivities, createMemberActivity, listChangeRequests, approveChangeRequest, rejectChangeRequest, createChangeRequest };
