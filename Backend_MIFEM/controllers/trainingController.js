const { Course, Lesson, Quiz, QuizAttempt, Certificate, User } = require('../models');
const { paginated } = require('../utils/response');
const { v4: uuidv4 } = require('uuid');

const listCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, difficulty, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;
    else where.status = 'PUBLISHED';

    const { count, rows } = await Course.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Lesson, as: 'lessons', attributes: ['id', 'title', 'sortOrder', 'status', 'duration'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Lesson, as: 'lessons', include: [{ model: Quiz, as: 'quiz' }], order: [['sortOrder', 'ASC']] },
      ],
    });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    return res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    if (req.user.churchId) data.churchId = req.user.churchId;
    const course = await Course.create(data);
    return res.status(201).json({ success: true, data: course, message: 'Course created' });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.update(req.body);
    return res.json({ success: true, data: course, message: 'Course updated' });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    await course.destroy();
    return res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

const listLessons = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, courseId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (courseId) where.courseId = courseId;

    const { count, rows } = await Lesson.findAndCountAll({
      where,
      order: [['sortOrder', 'ASC']],
      offset,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{ model: Quiz, as: 'quiz' }],
    });
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    return res.json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

const createLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.create(req.body);
    return res.status(201).json({ success: true, data: lesson, message: 'Lesson created' });
  } catch (error) {
    next(error);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    await lesson.update(req.body);
    return res.json({ success: true, data: lesson, message: 'Lesson updated' });
  } catch (error) {
    next(error);
  }
};

const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    await lesson.destroy();
    return res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    next(error);
  }
};

const saveQuiz = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const [quiz, created] = await Quiz.findOrCreate({
      where: { lessonId },
      defaults: { lessonId, ...req.body },
    });
    if (!created) await quiz.update(req.body);
    return res.status(created ? 201 : 200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    return res.json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

const submitQuizAttempt = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByPk(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const { answers } = req.body;
    const questions = quiz.questions || [];
    let correctAnswers = 0;
    const gradedAnswers = questions.map((q, idx) => {
      const userAnswer = answers?.[idx];
      const isCorrect = q.correctAnswer !== undefined && userAnswer === q.correctAnswer;
      if (isCorrect) correctAnswers++;
      return { questionId: q.id, userAnswer, isCorrect, correctAnswer: q.correctAnswer };
    });

    const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quizId: quiz.id,
      userId: req.user.id,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      answers: gradedAnswers,
      passed,
      completedAt: new Date(),
    });

    if (passed) {
      const courseId = req.body.courseId;
      if (courseId) {
        const certNumber = `CERT-${uuidv4().slice(0, 8).toUpperCase()}`;
        await Certificate.findOrCreate({
          where: { userId: req.user.id, courseId },
          defaults: {
            userId: req.user.id,
            courseId,
            certificateNumber: certNumber,
            issuedBy: req.user.id,
          },
        });
      }
    }

    return res.status(201).json({ success: true, data: { ...attempt.toJSON(), passed, score } });
  } catch (error) {
    next(error);
  }
};

const listCertificates = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (userId) where.userId = userId;

    const { count, rows } = await Certificate.findAndCountAll({
      where,
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'issuer', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit),
    });
    return paginated(res, rows, count, parseInt(page), parseInt(limit));
  } catch (error) {
    next(error);
  }
};

const getMyProgress = async (req, res, next) => {
  try {
    const courses = await Course.findAll({ where: { status: 'PUBLISHED' }, attributes: ['id', 'title'] });
    const progress = await Promise.all(courses.map(async (course) => {
      const lessons = await Lesson.findAll({ where: { courseId: course.id }, attributes: ['id'] });
      const totalLessons = lessons.length;
      const quizzes = await Quiz.findAll({
        where: { lessonId: lessons.map(l => l.id) },
        attributes: ['id'],
      });
      const attempts = await QuizAttempt.count({
        where: { quizId: quizzes.map(q => q.id), userId: req.user.id, passed: true },
      });
      const cert = await Certificate.findOne({ where: { userId: req.user.id, courseId: course.id } });
      return {
        courseId: course.id,
        courseTitle: course.title,
        totalLessons,
        completedQuizzes: attempts,
        totalQuizzes: quizzes.length,
        completed: !!cert,
      };
    }));
    return res.json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCourses, getCourse, createCourse, updateCourse, deleteCourse,
  listLessons, getLesson, createLesson, updateLesson, deleteLesson,
  saveQuiz, getQuiz, submitQuizAttempt,
  listCertificates, getMyProgress,
};
