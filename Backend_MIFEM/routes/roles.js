const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { listRoles, getRole, createRole, updateRole, deleteRole, listPermissions } = require('../controllers/roleController');

router.use(protect);

router.get('/', listRoles);
router.get('/permissions/all', listPermissions);
router.get('/:id', getRole);

router.post('/', authorize('SUPER_ADMIN'), [
  body('name').notEmpty().withMessage('Name is required'),
  validate,
], createRole);

router.put('/:id', authorize('SUPER_ADMIN'), updateRole);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteRole);

module.exports = router;
