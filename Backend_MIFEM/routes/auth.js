const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerAdmin, registerMember, registerVolunteer, loginAdmin, getMe, forgotPassword, resetPassword, verifyOTP, changePassword, getAdminAccount, updateProfile, forceChangePassword } = require('../controllers/authController');

router.post('/register', protect, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  validate,
], registerAdmin);

router.post('/register/member', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  validate,
], registerMember);

router.post('/register/volunteer', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  validate,
], registerVolunteer);

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
], loginAdmin);

router.get('/me', protect, getMe);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email required'),
  validate,
], forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
], resetPassword);

router.post('/verify-otp', [
  body('userId').notEmpty().withMessage('UserId is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid OTP required'),
  validate,
], verifyOTP);

router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate,
], changePassword);

router.put('/force-change-password', protect, [
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate,
], forceChangePassword);

router.put('/profile', protect, updateProfile);

router.get('/admin-account', getAdminAccount);

module.exports = router;
