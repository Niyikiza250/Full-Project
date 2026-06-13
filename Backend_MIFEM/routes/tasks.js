const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { hierarchyScope } = require('../middleware/hierarchyAccess');
const { listTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'FIELD_ADMINISTRATOR'));
router.use(hierarchyScope);

router.get('/', listTasks);
router.get('/:id', getTask);

router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  validate,
], createTask);

router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
