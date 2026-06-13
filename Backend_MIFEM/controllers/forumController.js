const { DiscussionForum, ForumPost, User, Church, Ministry } = require('../models');
const { paginated } = require('../utils/response');

const listForums = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, churchId } = req.query;
    const offset = (page - 1) * limit;
    const where = { status: 'ACTIVE' };
    if (category) where.category = category;
    if (churchId) where.churchId = churchId;

    const { count, rows } = await DiscussionForum.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: ForumPost, as: 'posts', attributes: ['id'], separate: true },
      ],
      order: [['lastActivityAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const getForum = async (req, res, next) => {
  try {
    const forum = await DiscussionForum.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Church, as: 'church', attributes: ['id', 'name'] },
      ],
    });
    if (!forum) return res.status(404).json({ success: false, message: 'Forum not found' });
    return res.json({ success: true, data: forum });
  } catch (error) {
    next(error);
  }
};

const createForum = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    if (req.user.churchId) data.churchId = req.user.churchId;
    const forum = await DiscussionForum.create(data);
    return res.status(201).json({ success: true, data: forum, message: 'Forum created' });
  } catch (error) {
    next(error);
  }
};

const updateForum = async (req, res, next) => {
  try {
    const forum = await DiscussionForum.findByPk(req.params.id);
    if (!forum) return res.status(404).json({ success: false, message: 'Forum not found' });
    await forum.update(req.body);
    return res.json({ success: true, data: forum, message: 'Forum updated' });
  } catch (error) {
    next(error);
  }
};

const deleteForum = async (req, res, next) => {
  try {
    const forum = await DiscussionForum.findByPk(req.params.id);
    if (!forum) return res.status(404).json({ success: false, message: 'Forum not found' });
    await forum.destroy();
    return res.json({ success: true, message: 'Forum deleted' });
  } catch (error) {
    next(error);
  }
};

const listPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const where = { forumId: req.params.forumId, parentId: null };

    const { count, rows } = await ForumPost.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'profilePicture'] },
        { model: ForumPost, as: 'parent' },
      ],
      order: [['isPinned', 'DESC'], ['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    const postsWithReplies = await Promise.all(rows.map(async (post) => {
      const replies = await ForumPost.findAll({
        where: { parentId: post.id },
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'profilePicture'] }],
        order: [['createdAt', 'ASC']],
      });
      return { ...post.toJSON(), replies };
    }));

    return paginated(res, postsWithReplies, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const post = await ForumPost.create({
      forumId: req.params.forumId,
      parentId: req.body.parentId || null,
      userId: req.user.id,
      authorName: req.user.name,
      body: req.body.body,
    });
    await DiscussionForum.update({ lastActivityAt: new Date() }, { where: { id: req.params.forumId } });
    return res.status(201).json({ success: true, data: post, message: 'Post created' });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findByPk(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.update({ body: req.body.body });
    return res.json({ success: true, data: post, message: 'Post updated' });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findByPk(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    await ForumPost.destroy({ where: { parentId: post.id } });
    await post.destroy();
    return res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listForums, getForum, createForum, updateForum, deleteForum, listPosts, createPost, updatePost, deletePost };
