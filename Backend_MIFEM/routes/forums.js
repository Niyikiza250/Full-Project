const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  listForums, getForum, createForum, updateForum, deleteForum,
  listPosts, createPost, updatePost, deletePost,
} = require('../controllers/forumController');

const router = express.Router();
router.use(protect);

router.get('/', listForums);
router.get('/:id', getForum);
router.post('/', [body('title').notEmpty(), validate], createForum);
router.put('/:id', updateForum);
router.delete('/:id', deleteForum);

router.get('/:forumId/posts', listPosts);
router.post('/:forumId/posts', [body('body').notEmpty(), validate], createPost);
router.put('/:forumId/posts/:postId', updatePost);
router.delete('/:forumId/posts/:postId', deletePost);

module.exports = router;
