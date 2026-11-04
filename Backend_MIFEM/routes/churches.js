const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { hierarchyScope } = require('../middleware/hierarchyAccess');
const {
  listUnions, getUnion, createUnion, updateUnion, deleteUnion,
  listFields, getField, createField, updateField, deleteField,
  listDistricts, getDistrict, createDistrict, updateDistrict, deleteDistrict,
  listChurches, getChurch, createChurch, updateChurch, deleteChurch,
  listNearbyChurches,
  listMinistries, createMinistry, updateMinistry, deleteMinistry,
  assignMinistryMember, assignMinistryLeader, removeMinistryMember,
} = require('../controllers/churchController');

const STRUCTURE_MANAGE_ROLES = ['SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR'];

// Unions (protected) — must be before /:id
router.get('/unions', protect, listUnions);
router.get('/unions/:id', protect, getUnion);

// Public read endpoints (for registration)
router.get('/fields', listFields);
router.get('/fields/:id', getField);
router.get('/districts', listDistricts);
router.get('/districts/:id', getDistrict);

// Nearby churches (public) — must be before /:id
router.get('/nearby', listNearbyChurches);

// Ministries (protected) — must be before /:id
router.get('/ministries', protect, listMinistries);
router.post('/ministries', protect, authorize(...STRUCTURE_MANAGE_ROLES), [body('name').notEmpty(), validate], createMinistry);
router.put('/ministries/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), updateMinistry);
router.delete('/ministries/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), deleteMinistry);

// Churches (public read)
router.get('/', listChurches);
router.get('/:id', getChurch);
router.post('/unions', protect, authorize(...STRUCTURE_MANAGE_ROLES), [body('name').notEmpty(), validate], createUnion);
router.put('/unions/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), updateUnion);
router.delete('/unions/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), deleteUnion);

// Fields (protected write, public read already above)
router.post('/fields', protect, authorize(...STRUCTURE_MANAGE_ROLES), [body('name').notEmpty(), body('unionId').notEmpty(), validate], createField);
router.put('/fields/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), updateField);
router.delete('/fields/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), deleteField);

// Districts (protected write, public read already above)
router.post('/districts', protect, authorize(...STRUCTURE_MANAGE_ROLES), [body('name').notEmpty(), body('fieldId').notEmpty(), validate], createDistrict);
router.put('/districts/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), updateDistrict);
router.delete('/districts/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), deleteDistrict);

// Churches (protected write, public read already above)
router.post('/', protect, authorize(...STRUCTURE_MANAGE_ROLES), [body('name').notEmpty(), body('districtId').notEmpty(), validate], createChurch);
router.put('/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), updateChurch);
router.delete('/:id', protect, authorize(...STRUCTURE_MANAGE_ROLES), deleteChurch);

// Ministry assignments (Field Admin+)
router.post('/ministries/:id/assign', protect, authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'), hierarchyScope, assignMinistryMember);
router.post('/ministries/:id/assign-leader', protect, authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'), hierarchyScope, assignMinistryLeader);
router.post('/ministries/:id/remove', protect, authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'), hierarchyScope, removeMinistryMember);

module.exports = router;
