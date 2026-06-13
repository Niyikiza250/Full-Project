const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  listCourses, getCourse, createCourse, updateCourse, deleteCourse,
  listLessons, getLesson, createLesson, updateLesson, deleteLesson,
  saveQuiz, getQuiz, submitQuizAttempt,
  listCertificates, getMyProgress,
} = require('../controllers/trainingController');

const router = express.Router();
router.use(protect);

router.get('/courses', listCourses);
router.get('/courses/:id', getCourse);
router.post('/courses', [body('title').notEmpty(), validate], createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

router.get('/lessons', listLessons);
router.get('/lessons/:id', getLesson);
router.post('/lessons', [body('title').notEmpty(), body('courseId').notEmpty(), validate], createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);

router.put('/lessons/:lessonId/quiz', saveQuiz);
router.get('/quizzes/:id', getQuiz);
router.post('/quizzes/:quizId/attempt', [body('answers').isArray(), validate], submitQuizAttempt);

router.get('/certificates', listCertificates);
router.get('/progress/mine', getMyProgress);

module.exports = router;
