const { Member, MemberProfile, MemberActivity, MemberChangeRequest, MemberMinistryRole, Church, District, Field, Union } = require('../models');
const { success, error, paginated } = require('../utils/response');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { rwandaLocation } = require('@devrw/rwanda-location');
const { sequelize } = require('../config/db');

const listMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { search, role, status, gender, churchId, fieldId, sabbathClass, church, zone, field } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (churchId) where.churchId = churchId;
    if (sabbathClass) where.sabbathClass = sabbathClass;

    const include = [
      {
        model: Church, as: 'church',
        attributes: ['id', 'name', 'zoneName', 'fieldId'],
        ...(zone ? { where: { zoneName: { [Op.iLike]: zone } } } : {}),
        ...(church ? { where: { name: { [Op.iLike]: `%${church}%` } } } : {}),
        required: !!(zone || church || field),
        include: [
          { model: District, as: 'district', attributes: ['id', 'name'] },
          {
            model: Field, as: 'field',
            attributes: ['id', 'name'],
            ...(field ? { where: { name: { [Op.iLike]: `%${field}%` } } } : {}),
            required: !!field,
            include: [
              { model: Union, as: 'union', attributes: ['id', 'name'] },
            ],
          },
        ],
      },
      {
        model: MemberMinistryRole, as: 'ministryRoles',
        attributes: ['role', 'assignedAt'],
      },
    ];

    const { rows, count } = await Member.findAndCountAll({
      where,
      include,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    return paginated(res, rows, count, page, limit);
  } catch (err) {
    logger.error(`List members error: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const getMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [
        { model: Church, as: 'church' },
        { model: MemberProfile, as: 'profile' },
        { model: MemberActivity, as: 'activities', order: [['date', 'DESC']] },
        { model: MemberMinistryRole, as: 'ministryRoles', attributes: ['role', 'assignedAt'] },
      ],
    });
    if (!member) return error(res, 'Member not found', 404);
    return success(res, member);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const createMember = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      firstName, lastName, email, phone, whatsapp, gender, dateOfBirth, ageGroup,
      baptismDate, address, village, sector, district,
      status, sabbathClass, churchId, registrationType, role,
      emergencyName, emergencyPhone, ministryRoles,
      provinceCode, provinceName, districtCode, districtName,
      sectorCode, sectorName, cellCode, cellName, villageCode, villageName,
    } = req.body;

    if (!firstName || !lastName) {
      await t.rollback();
      return error(res, 'First name and last name are required', 400);
    }
    if (!phone) {
      await t.rollback();
      return error(res, 'Phone number is required', 400);
    }
    if (!churchId) {
      await t.rollback();
      return error(res, 'Church is required', 400);
    }
    if (!emergencyName || !emergencyPhone) {
      await t.rollback();
      return error(res, 'Emergency contact name and phone are required', 400);
    }

    if (registrationType === 'VOLUNTEER') {
      if (!provinceCode || !districtCode || !sectorCode || !cellCode || !villageCode) {
        await t.rollback();
        return error(res, 'Complete location information is required for volunteers.', 400);
      }

      const province = rwandaLocation.getProvinceByCode(provinceCode);
      if (!province) { await t.rollback(); return error(res, 'Invalid province', 400); }

      const districts = rwandaLocation.getDistricts(provinceCode);
      if (!districts?.find(d => d.code === districtCode)) { await t.rollback(); return error(res, 'District does not belong to Province or is invalid', 400); }

      const sectors = rwandaLocation.getSectors(districtCode);
      if (!sectors?.find(s => s.code === sectorCode)) { await t.rollback(); return error(res, 'Sector does not belong to District or is invalid', 400); }

      const cells = rwandaLocation.getCells(sectorCode);
      if (!cells?.find(c => c.code === cellCode)) { await t.rollback(); return error(res, 'Cell does not belong to Sector or is invalid', 400); }

      const villages = rwandaLocation.getVillages(cellCode);
      if (!villages?.find(v => v.code === villageCode)) { await t.rollback(); return error(res, 'Village does not belong to Cell or is invalid', 400); }
    }

    // Auto-calculate age group if not provided
    let computedAgeGroup = ageGroup || null;
    if (!computedAgeGroup && dateOfBirth) {
      const birth = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (age >= 13 && age <= 25) computedAgeGroup = 'YOUTH';
      else if (age >= 26 && age <= 35) computedAgeGroup = 'YOUNG_ADULT';
      else if (age >= 36 && age <= 60) computedAgeGroup = 'ADULT';
      else if (age > 60) computedAgeGroup = 'SENIOR';
    }

    const member = await Member.create({
      firstName, lastName, email, phone, whatsapp, gender, dateOfBirth,
      ageGroup: computedAgeGroup, baptismDate,
      address, village, sector, district,
      status: status || 'ACTIVE', sabbathClass, churchId,
      role: role || 'MEMBER',
      registrationType: registrationType || 'MEMBER',
      emergencyName, emergencyPhone,
      provinceCode, provinceName, districtCode, districtName,
      sectorCode, sectorName, cellCode, cellName, villageCode, villageName,
      createdBy: req.user.id,
    }, { transaction: t });

    // Create ministry roles
    if (Array.isArray(ministryRoles) && ministryRoles.length > 0) {
      const validRoles = ['CHOIR', 'OUTREACH', 'TEACHING', 'HOSPITALITY', 'DEACON', 'ELDER',
        'SABBATH_SCHOOL_TEACHER', 'PATHFINDER_LEADER', 'ADVENTIST_YOUTH_LEADER',
        'COMMUNITY_SERVICES', 'OTHER'];
      const roleRecords = ministryRoles
        .filter(r => validRoles.includes(r))
        .map(r => ({
          memberId: member.id,
          role: r,
          assignedBy: req.user.id,
        }));
      if (roleRecords.length > 0) {
        await MemberMinistryRole.bulkCreate(roleRecords, { transaction: t });
      }
    }

    await t.commit();

    // Fetch complete member with associations
    const fullMember = await Member.findByPk(member.id, {
      include: [
        { model: Church, as: 'church' },
        { model: MemberMinistryRole, as: 'ministryRoles', attributes: ['role', 'assignedAt'] },
      ],
    });

    return success(res, fullMember, 'Member created successfully', 201);
  } catch (err) {
    await t.rollback();
    logger.error(`Create member error: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const updateMember = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) { await t.rollback(); return error(res, 'Member not found', 404); }

    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'whatsapp', 'gender', 'dateOfBirth',
      'ageGroup', 'baptismDate', 'address', 'village', 'sector', 'district',
      'status', 'sabbathClass', 'churchId', 'imageUrl', 'role',
      'emergencyName', 'emergencyPhone',
      'provinceCode', 'provinceName', 'districtCode', 'districtName',
      'sectorCode', 'sectorName', 'cellCode', 'cellName', 'villageCode', 'villageName',
      'registrationType',
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    updates.updatedBy = req.user.id;

    // Auto-calculate age group if dateOfBirth changed
    if (updates.dateOfBirth && !updates.ageGroup) {
      const birth = new Date(updates.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (age >= 13 && age <= 25) updates.ageGroup = 'YOUTH';
      else if (age >= 26 && age <= 35) updates.ageGroup = 'YOUNG_ADULT';
      else if (age >= 36 && age <= 60) updates.ageGroup = 'ADULT';
      else if (age > 60) updates.ageGroup = 'SENIOR';
    }

    await member.update(updates, { transaction: t });

    // Update ministry roles if provided
    if (Array.isArray(req.body.ministryRoles)) {
      await MemberMinistryRole.destroy({ where: { memberId: member.id }, transaction: t });
      const validRoles = ['CHOIR', 'OUTREACH', 'TEACHING', 'HOSPITALITY', 'DEACON', 'ELDER',
        'SABBATH_SCHOOL_TEACHER', 'PATHFINDER_LEADER', 'ADVENTIST_YOUTH_LEADER',
        'COMMUNITY_SERVICES', 'OTHER'];
      const roleRecords = req.body.ministryRoles
        .filter(r => validRoles.includes(r))
        .map(r => ({
          memberId: member.id,
          role: r,
          assignedBy: req.user.id,
        }));
      if (roleRecords.length > 0) {
        await MemberMinistryRole.bulkCreate(roleRecords, { transaction: t });
      }
    }

    await t.commit();

    const updatedMember = await Member.findByPk(member.id, {
      include: [
        { model: Church, as: 'church' },
        { model: MemberMinistryRole, as: 'ministryRoles', attributes: ['role', 'assignedAt'] },
      ],
    });

    return success(res, updatedMember, 'Member updated');
  } catch (err) {
    await t.rollback();
    logger.error(`Update member error: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return error(res, 'Member not found', 404);

    await member.destroy();
    return success(res, null, 'Member deleted');
  } catch (err) {
    return error(res, 'Server error', 500);
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
    return error(res, 'Server error', 500);
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
    return error(res, 'Server error', 500);
  }
};

const listChangeRequests = async (req, res) => {
  try {
    const requests = await MemberChangeRequest.findAll({
      include: [
        { model: Member, as: 'member', attributes: ['id', 'firstName', 'lastName'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return success(res, requests);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const approveChangeRequest = async (req, res) => {
  try {
    const request = await MemberChangeRequest.findByPk(req.params.id);
    if (!request) return error(res, 'Request not found', 404);

    if (request.type === 'CREATE' && request.status === 'PENDING') {
      await Member.create({ ...request.changes, createdBy: req.user.id });
    } else if (request.type === 'UPDATE' && request.status === 'PENDING') {
      await Member.update(request.changes, { where: { id: request.memberId } });
    }

    await request.update({ status: 'APPROVED', reviewedBy: req.user.id, reviewedAt: new Date() });
    return success(res, request, 'Request approved');
  } catch (err) {
    return error(res, 'Server error', 500);
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
    return error(res, 'Server error', 500);
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
    return error(res, 'Server error', 500);
  }
};

module.exports = {
  listMembers, getMember, createMember, updateMember, deleteMember,
  getMemberActivities, createMemberActivity,
  listChangeRequests, approveChangeRequest, rejectChangeRequest, createChangeRequest,
};
