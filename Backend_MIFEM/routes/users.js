const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { listUsers, getUser, createUser, updateUser, deleteUser, bulkImportUsers } = require('../controllers/userController');

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'));

router.get('/', listUsers);
router.get('/:id', getUser);

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('roleId').notEmpty().withMessage('Role is required'),
  validate,
], createUser);

router.post('/bulk-import', [
  body('users').isArray({ min: 1 }).withMessage('Users array is required'),
  validate,
], bulkImportUsers);

router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
