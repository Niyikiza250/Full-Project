const jwt = require('jsonwebtoken');
const { User, Role, LoginSession, OTPVerification, PasswordReset, Volunteer, Member } = require('../models');
const { success, error } = require('../utils/response');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const { sendPasswordResetEmail } = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
};

const registerMember = async (req, res) => {
  try {
    const { email, password, name, phone, fieldId, districtId, churchId } = req.body;

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

    const memberRole = await Role.findOne({ where: { name: 'MEMBER' } });
    if (!memberRole) {
      return error(res, 'MEMBER role not found. Contact an administrator.', 500);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      roleId: memberRole.id,
      fieldId,
      districtId,
      churchId,
      accountStatus: 'ACTIVE',
    });

    // Also create a linked Member record with the same phone
    const nameParts = name.trim().split(/\s+/);
    await Member.create({
      firstName: nameParts[0] || name,
      lastName: nameParts.slice(1).join(' ') || name,
      email,
      phone,
      churchId,
      status: 'ACTIVE',
      createdBy: user.id,
    });

    return success(res, user, 'Registration successful', 201);
  } catch (err) {
    logger.error(`Register member error: ${err.message}`);
    return error(res, 'Server error', 500, err.message);
  }
};

const registerVolunteer = async (req, res) => {
  try {
    const { email, password, name, phone, provinceCode, provinceName, districtCode, districtName, sectorCode, sectorName, cellCode, cellName, villageCode, villageName } = req.body;

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

    const volunteerRole = await Role.findOne({ where: { name: 'VOLUNTEER' } });
    if (!volunteerRole) {
      return error(res, 'VOLUNTEER role not found. Contact an administrator.', 500);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      roleId: volunteerRole.id,
      accountStatus: 'ACTIVE',
    });

    await Volunteer.create({
      userId: user.id,
      name,
      email,
      phone,
      password,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      sectorCode,
      sectorName,
      cellCode,
      cellName,
      villageCode,
      villageName,
      status: 'ACTIVE',
    });

    return success(res, user, 'Registration successful', 201);
  } catch (err) {
    logger.error(`Register volunteer error: ${err.message}`);
    return error(res, 'Server error', 500, err.message);
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

    const user = await User.create({
      name,
      email,
      password,
      phone,
      roleId,
      unionId,
      fieldId,
      districtId,
      churchId,
      createdBy: req.user ? req.user.id : null,
      accountStatus: 'ACTIVE',
    });

    const token = generateToken(user.id);

    return success(res, {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.roleId,
      token,
    }, 'Admin registered successfully', 201);
  } catch (err) {
    logger.error(`Register error: ${err.message}`);
    return error(res, 'Server error', 500, err.message);
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
    return error(res, 'Server error', 500, err.message);
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
    return error(res, 'Server error', 500, err.message);
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
    return error(res, 'Server error', 500, err.message);
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
    return error(res, 'Server error', 500, err.message);
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
    return error(res, 'Server error', 500, err.message);
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
    return error(res, 'Server error', 500, err.message);
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
    return error(res, 'Server error', 500, err.message);
  }
};

const getAdminAccount = async (req, res) => {
  try {
    const demoEmails = [
      'admin@mifem.org',
      'union@mifem.org',
      'fieldadmin@mifem.org',
      'fieldleader@mifem.org',
      'districtleader@mifem.org',
      'churchleader@mifem.org',
      'ministryleader@mifem.org',
      'volunteer@mifem.org',
      'member@mifem.org',
    ];
    const users = await User.findAll({
      where: { email: demoEmails },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
      attributes: ['name', 'email', 'password', 'roleId'],
    });
    const accounts = users.map(u => ({
      name: u.name,
      email: u.email,
      password: u.password,
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
    return error(res, 'Server error', 500, err.message);
  }
};

module.exports = { registerAdmin, registerMember, registerVolunteer, loginAdmin, getMe, forgotPassword, resetPassword, verifyOTP, changePassword, getAdminAccount, updateProfile, forceChangePassword };
