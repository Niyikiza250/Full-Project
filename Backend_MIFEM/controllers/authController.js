const jwt = require('jsonwebtoken');
const { User, Role, OTPVerification, PasswordReset, Volunteer, Member, MemberMinistryRole } = require('../models');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { sendPasswordResetEmail } = require('../utils/email');
const { sequelize } = require('../config/db');

const DEMO_ACCOUNTS = [
  { name: 'Super Admin', email: 'admin@mifem.org', password: process.env.DEMO_ADMIN_PASSWORD || 'Admin@123', roleName: 'SUPER_ADMIN' },
  { name: 'Union Leader', email: 'union@mifem.org', password: process.env.DEMO_USER_PASSWORD || 'Demo@123', roleName: 'UNION_LEADER' },
  { name: 'Field Admin', email: 'fieldadmin@mifem.org', password: process.env.DEMO_USER_PASSWORD || 'Demo@123', roleName: 'FIELD_ADMINISTRATOR' },
  { name: 'Field Leader', email: 'fieldleader@mifem.org', password: process.env.DEMO_USER_PASSWORD || 'Demo@123', roleName: 'FIELD_LEADER' },
  { name: 'District Leader', email: 'districtleader@mifem.org', password: process.env.DEMO_USER_PASSWORD || 'Demo@123', roleName: 'DISTRICT_LEADER' },
  { name: 'Church Leader', email: 'churchleader@mifem.org', password: process.env.DEMO_USER_PASSWORD || 'Demo@123', roleName: 'CHURCH_LEADER' },
  { name: 'Ministry Leader', email: 'ministryleader@mifem.org', password: process.env.DEMO_USER_PASSWORD || 'Demo@123', roleName: 'MINISTRY_LEADER' },
  { name: 'Volunteer', email: 'volunteer@mifem.org', password: process.env.DEMO_USER_PASSWORD || 'Demo@123', roleName: 'VOLUNTEER' },
  { name: 'Member', email: 'member@mifem.org', password: process.env.DEMO_USER_PASSWORD || 'Demo@123', roleName: 'MEMBER' },
];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
};

const calculateAgeGroup = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  if (age >= 13 && age <= 25) return 'YOUTH';
  if (age >= 26 && age <= 35) return 'YOUNG_ADULT';
  if (age >= 36 && age <= 60) return 'ADULT';
  if (age > 60) return 'SENIOR';
  return null;
};

const registerMember = async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();
    const {
      email, password, name, phone,
      firstName, lastName, gender, dateOfBirth, whatsapp,
      village, sector, district,
      emergencyName, emergencyPhone, ministryRoles,
      sabbathClass, baptismDate, imageUrl, churchId,
      fieldId, districtId,
    } = req.body;

    if (!email || !password || !name) {
      if (t) await t.rollback();
      return error(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      if (t) await t.rollback();
      return error(res, 'Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      if (t) await t.rollback();
      return error(res, 'User with this email already exists', 400);
    }

    const memberRole = await Role.findOne({ where: { name: 'MEMBER' } });
    if (!memberRole) {
      if (t) await t.rollback();
      return error(res, 'MEMBER role not found. Contact an administrator.', 500);
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (churchId && !UUID_RE.test(churchId)) {
      if (t) await t.rollback();
      return error(res, 'Invalid church reference. Please select a valid church.', 400);
    }
    if (fieldId && !UUID_RE.test(fieldId)) {
      if (t) await t.rollback();
      return error(res, 'Invalid field reference. Please select a valid mission field.', 400);
    }
    if (districtId && !UUID_RE.test(districtId)) {
      if (t) await t.rollback();
      return error(res, 'Invalid district reference. Please select a valid district.', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      roleId: memberRole.id,
      churchId: churchId || null,
      fieldId: fieldId || null,
      districtId: districtId || null,
      accountStatus: 'ACTIVE',
    }, { transaction: t });

    const nameParts = name.trim().split(/\s+/);
    const computedAgeGroup = calculateAgeGroup(dateOfBirth);

    const member = await Member.create({
      firstName: (firstName || nameParts[0] || name).substring(0, 50),
      lastName: (lastName || nameParts.slice(1).join(' ') || '').substring(0, 50),
      email,
      phone: phone || '',
      whatsapp: whatsapp || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      ageGroup: computedAgeGroup,
      churchId: churchId || null,
      status: 'ACTIVE',
      registrationType: 'MEMBER',
      sabbathClass: sabbathClass || '',
      baptismDate: baptismDate || null,
      imageUrl: imageUrl || '',
      address: (village || sector || district) ? `${village || ''}, ${sector || ''}, ${district || ''}`.trim() : '',
      village: village || null,
      sector: sector || null,
      district: district || null,
      emergencyName: emergencyName || null,
      emergencyPhone: emergencyPhone || null,
      createdBy: user.id,
    }, { transaction: t });

    if (Array.isArray(ministryRoles) && ministryRoles.length > 0) {
      const validRoles = ['CHOIR', 'OUTREACH', 'TEACHING', 'HOSPITALITY', 'DEACON', 'ELDER',
        'SABBATH_SCHOOL_TEACHER', 'PATHFINDER_LEADER', 'ADVENTIST_YOUTH_LEADER',
        'COMMUNITY_SERVICES', 'OTHER'];
      const roleRecords = ministryRoles
        .filter(r => validRoles.includes(r))
        .map(r => ({
          memberId: member.id,
          role: r,
          assignedBy: user.id,
        }));
      if (roleRecords.length > 0) {
        await MemberMinistryRole.bulkCreate(roleRecords, { transaction: t });
      }
    }

    await t.commit();

    const token = generateToken(user.id);

    const role = await Role.findByPk(user.roleId);
    return success(res, {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: role ? role.name : 'MEMBER',
      roleId: user.roleId,
      churchId: user.churchId,
      accountStatus: user.accountStatus,
      token,
    }, 'Registration successful', 201);
  } catch (err) {
    if (t) {
      try { await t.rollback(); } catch (rollbackErr) {
        logger.error(`Rollback error during register member: ${rollbackErr.message}`);
      }
    }
    logger.error(`Register member error: ${err.name}: ${err.message}`);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return error(res, 'Invalid reference. Please check your selections and try again.', 400);
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return error(res, 'A record with this information already exists.', 409);
    }
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message).join(', ');
      return error(res, `Validation error: ${messages}`, 400);
    }
    return error(res, 'Server error during registration. Please try again.', 500);
  }
};

const registerVolunteer = async (req, res) => {
  let t;
  try {
    t = await sequelize.transaction();
    const {
      email, password, name, phone,
      firstName, lastName, gender, dateOfBirth, whatsapp,
      village, sector, district: memberDistrict, churchId,
      provinceCode, provinceName, districtCode, districtName,
      sectorCode, sectorName, cellCode, cellName, villageCode, villageName,
      emergencyName, emergencyPhone, ministryRoles,
      sabbathClass, baptismDate, imageUrl,
    } = req.body;

    if (!email || !password || !name) {
      await t.rollback();
      return error(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      await t.rollback();
      return error(res, 'Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await t.rollback();
      return error(res, 'User with this email already exists', 400);
    }

    const volunteerRole = await Role.findOne({ where: { name: 'VOLUNTEER' } });
    if (!volunteerRole) {
      await t.rollback();
      return error(res, 'VOLUNTEER role not found. Contact an administrator.', 500);
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (churchId && !UUID_RE.test(churchId)) {
      await t.rollback();
      return error(res, 'Invalid church reference. Please select a valid church.', 400);
    }

    if (ministryRoles && !Array.isArray(ministryRoles)) {
      await t.rollback();
      return error(res, 'ministryRoles must be an array', 400);
    }

    if (Array.isArray(ministryRoles) && ministryRoles.length > 0) {
      const validMinistryRoles = ['CHOIR', 'OUTREACH', 'TEACHING', 'HOSPITALITY', 'DEACON', 'ELDER',
        'SABBATH_SCHOOL_TEACHER', 'PATHFINDER_LEADER', 'ADVENTIST_YOUTH_LEADER',
        'COMMUNITY_SERVICES', 'OTHER'];
      const invalid = ministryRoles.filter(r => !validMinistryRoles.includes(r));
      if (invalid.length > 0) {
        await t.rollback();
        return error(res, `Invalid ministry role(s): ${invalid.join(', ')}`, 400);
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      roleId: volunteerRole.id,
      churchId: churchId || null,
      accountStatus: 'ACTIVE',
    }, { transaction: t });

    await Volunteer.create({
      userId: user.id,
      name,
      email,
      phone: phone || '',
      provinceCode: provinceCode || null,
      provinceName: provinceName || null,
      districtCode: districtCode || null,
      districtName: districtName || null,
      sectorCode: sectorCode || null,
      sectorName: sectorName || null,
      cellCode: cellCode || null,
      cellName: cellName || null,
      villageCode: villageCode || null,
      villageName: villageName || null,
      status: 'ACTIVE',
    }, { transaction: t });

    const nameParts = name.trim().split(/\s+/);
    const computedAgeGroup = calculateAgeGroup(dateOfBirth);

    const member = await Member.create({
      firstName: firstName || nameParts[0] || name,
      lastName: lastName || nameParts.slice(1).join(' ') || '',
      email,
      phone: phone || '',
      whatsapp: whatsapp || null,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      ageGroup: computedAgeGroup,
      churchId: churchId || null,
      status: 'ACTIVE',
      registrationType: 'VOLUNTEER',
      sabbathClass: sabbathClass || '',
      baptismDate: baptismDate || null,
      imageUrl: imageUrl || '',
      address: (village || sector || memberDistrict) ? `${village || ''}, ${sector || ''}, ${memberDistrict || ''}`.trim() : '',
      village: village || null,
      sector: sector || null,
      district: memberDistrict || null,
      provinceCode: provinceCode || null,
      provinceName: provinceName || null,
      districtCode: districtCode || null,
      districtName: districtName || null,
      sectorCode: sectorCode || null,
      sectorName: sectorName || null,
      cellCode: cellCode || null,
      cellName: cellName || null,
      villageCode: villageCode || null,
      villageName: villageName || null,
      emergencyName: emergencyName || null,
      emergencyPhone: emergencyPhone || null,
      createdBy: user.id,
    }, { transaction: t });

    if (Array.isArray(ministryRoles) && ministryRoles.length > 0) {
      const validRoles = ['CHOIR', 'OUTREACH', 'TEACHING', 'HOSPITALITY', 'DEACON', 'ELDER',
        'SABBATH_SCHOOL_TEACHER', 'PATHFINDER_LEADER', 'ADVENTIST_YOUTH_LEADER',
        'COMMUNITY_SERVICES', 'OTHER'];
      const roleRecords = ministryRoles
        .filter(r => validRoles.includes(r))
        .map(r => ({
          memberId: member.id,
          role: r,
          assignedBy: user.id,
        }));
      if (roleRecords.length > 0) {
        await MemberMinistryRole.bulkCreate(roleRecords, { transaction: t });
      }
    }

    await t.commit();

    const token = generateToken(user.id);

    return success(res, {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: 'VOLUNTEER',
      roleId: user.roleId,
      churchId: user.churchId,
      accountStatus: user.accountStatus,
      token,
    }, 'Registration successful', 201);
  } catch (err) {
    if (t) {
      try { await t.rollback(); } catch (rollbackErr) {
        logger.error(`Rollback error during register volunteer: ${rollbackErr.message}`);
      }
    }
    logger.error(`Register volunteer error: ${err.name}: ${err.message}`);
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return error(res, 'Invalid reference. Please check your selections and try again.', 400);
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return error(res, 'A record with this information already exists.', 409);
    }
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message).join(', ');
      return error(res, `Validation error: ${messages}`, 400);
    }
    return error(res, 'Server error during registration. Please try again.', 500);
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { email, password, name, phone, roleId, unionId, fieldId, districtId, churchId } = req.body;

    if (!email || !password || !name) {
      return error(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return error(res, 'Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return error(res, 'User with this email already exists', 400);
    }

    if (!roleId) {
      return error(res, 'Role is required', 400);
    }

    const requestedRole = await Role.findByPk(roleId);
    if (!requestedRole) {
      return error(res, 'Invalid role', 400);
    }

    const requesterRole = req.user && req.user.role
      ? (req.user.role.name || req.user.role)
      : '';
    const restrictedRoles = ['SUPER_ADMIN', 'UNION_LEADER'];
    if (requesterRole !== 'SUPER_ADMIN' && restrictedRoles.includes(requestedRole.name)) {
      return error(res, 'Cannot assign the specified role', 403);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      roleId: requestedRole.id,
      unionId: unionId || null,
      fieldId: fieldId || null,
      districtId: districtId || null,
      churchId: churchId || null,
      createdBy: req.user ? req.user.id : null,
      accountStatus: 'ACTIVE',
    });

    const token = generateToken(user.id);

    return success(res, {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.roleId,
      token,
    }, 'Admin registered successfully', 201);
  } catch (err) {
    logger.error(`Register admin error: ${err.message}`);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return error(res, 'A user with this email already exists.', 409);
    }
    return error(res, 'Server error during registration.', 500);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    if (user.accountStatus !== 'ACTIVE') {
      return error(res, 'Account is not active. Please contact an administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    await user.update({ lastLogin: new Date() });

    const token = generateToken(user.id);

    return success(res, {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profilePicture,
      role: user.role ? user.role.name : user.roleId,
      roleId: user.roleId,
      rolePermissions: user.rolePermissions || [],
      accountStatus: user.accountStatus,
      temporaryPasswordStatus: user.temporaryPasswordStatus,
      unionId: user.unionId,
      fieldId: user.fieldId,
      districtId: user.districtId,
      churchId: user.churchId,
      ministryId: user.ministryId,
      lastLogin: user.lastLogin,
      mfaEnabled: user.mfaEnabled,
      token,
    }, 'Login successful');
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    return error(res, 'Server error', 500);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) {
      return error(res, 'User not found', 404);
    }

    return success(res, {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profilePicture,
      location: user.location,
      role: user.role ? user.role.name : user.roleId,
      roleId: user.roleId,
      rolePermissions: user.rolePermissions || [],
      accountStatus: user.accountStatus,
      temporaryPasswordStatus: user.temporaryPasswordStatus,
      unionId: user.unionId,
      fieldId: user.fieldId,
      districtId: user.districtId,
      churchId: user.churchId,
      ministryId: user.ministryId,
      lastLogin: user.lastLogin,
      mfaEnabled: user.mfaEnabled,
      createdBy: user.createdBy,
      createdAt: user.createdAt,
    });
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required', 400);

    const user = await User.findOne({ where: { email } });
    if (!user) return success(res, null, 'If the email exists, a reset link has been sent');

    const token = uuidv4();
    await PasswordReset.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 3600000),
    });

    sendPasswordResetEmail(email, token);

    return success(res, null, 'If the email exists, a reset link has been sent');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return error(res, 'Token and password are required', 400);
    if (password.length < 6) return error(res, 'Password must be at least 6 characters', 400);

    const reset = await PasswordReset.findOne({
      where: {
        token,
        usedAt: null,
        expiresAt: { [require('sequelize').Op.gt]: new Date() },
      },
    });

    if (!reset) return error(res, 'Invalid or expired token', 400);

    const user = await User.findByPk(reset.userId);
    if (!user) return error(res, 'User not found', 404);

    await user.update({ password, temporaryPasswordStatus: false });
    await reset.update({ usedAt: new Date() });

    return success(res, null, 'Password reset successful');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp, type } = req.body;
    if (!userId || !otp) return error(res, 'UserId and OTP are required', 400);

    const verification = await OTPVerification.findOne({
      where: {
        userId,
        otp,
        type: type || 'LOGIN',
        verifiedAt: null,
        expiresAt: { [require('sequelize').Op.gt]: new Date() },
      },
    });

    if (!verification) return error(res, 'Invalid or expired OTP', 400);

    await verification.update({ verifiedAt: new Date() });
    const token = generateToken(userId);

    return success(res, { token }, 'OTP verified successfully');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return error(res, 'Current password and new password are required', 400);
    }

    const user = await User.findByPk(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return error(res, 'Current password is incorrect', 400);

    await user.update({ password: newPassword, temporaryPasswordStatus: false });

    return success(res, null, 'Password changed successfully');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const forceChangePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return error(res, 'Password must be at least 6 characters', 400);
    }
    const user = await User.findByPk(req.user.id);
    if (!user) return error(res, 'User not found', 404);
    if (!user.temporaryPasswordStatus) {
      return error(res, 'Password change not required', 400);
    }
    await user.update({ password: newPassword, temporaryPasswordStatus: false });
    return success(res, null, 'Password changed successfully');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const getAdminAccount = async (req, res) => {
  try {
    const demoEmails = DEMO_ACCOUNTS.map(d => d.email);
    const demoPasswordMap = Object.fromEntries(DEMO_ACCOUNTS.map(d => [d.email, d.password]));
    const users = await User.findAll({
      where: { email: demoEmails },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
      attributes: ['name', 'email', 'roleId'],
    });
    const accounts = users.map(u => ({
      name: u.name,
      email: u.email,
      password: demoPasswordMap[u.email] || 'Demo@123',
      role: u.role ? u.role.name : 'UNKNOWN',
    }));
    return success(res, accounts);
  } catch {
    return success(res, []);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, location, profilePicture } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return error(res, 'User not found', 404);

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    // Sync phone to linked Member record if one exists with the same email
    if (email !== undefined || phone !== undefined) {
      const member = await Member.findOne({ where: { email: user.email } });
      if (member) {
        const memberUpdates = {};
        if (name !== undefined) memberUpdates.firstName = name;
        if (phone !== undefined) memberUpdates.phone = phone;
        if (Object.keys(memberUpdates).length > 0) {
          await member.update(memberUpdates);
        }
      }
    }

    return success(res, {
      id: user.id, name: user.name, email: user.email, phone: user.phone,
      location: user.location, profilePicture: user.profilePicture,
      role: user.roleId, accountStatus: user.accountStatus,
      temporaryPasswordStatus: user.temporaryPasswordStatus,
    }, 'Profile updated successfully');
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

const ensureDemoAccounts = async (req, res) => {
  try {
    const results = [];
    for (const demo of DEMO_ACCOUNTS) {
      const role = await Role.findOne({ where: { name: demo.roleName } });
      if (!role) {
        results.push({ email: demo.email, status: 'SKIPPED', reason: `Role ${demo.roleName} not found` });
        continue;
      }
      const [user, created] = await User.findOrCreate({
        where: { email: demo.email },
        defaults: {
          name: demo.name,
          email: demo.email,
          password: demo.password,
          roleId: role.id,
          accountStatus: 'ACTIVE',
        },
      });
      if (!created) {
        user.name = demo.name;
        user.roleId = role.id;
        user.accountStatus = 'ACTIVE';
        user.password = demo.password;
        user.changed('password', true);
        await user.save();
      }
      results.push({ email: demo.email, status: created ? 'CREATED' : 'RESET' });
    }
    return success(res, results, 'Demo accounts ensured');
  } catch (err) {
    return error(res, 'Failed to ensure demo accounts', 500);
  }
};

module.exports = { registerAdmin, registerMember, registerVolunteer, loginAdmin, getMe, forgotPassword, resetPassword, verifyOTP, changePassword, getAdminAccount, updateProfile, forceChangePassword, ensureDemoAccounts };
