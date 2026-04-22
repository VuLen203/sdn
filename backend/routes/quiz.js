const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// ════════════════════════════════════════════════════════════════
//  QUIZ CRUD ROUTES
// ════════════════════════════════════════════════════════════════

// GET /quizzes – List all quizzes (public)
router.get('/', quizController.getAllQuizzes);

// GET /quizzes/:id – Get single quiz (public)
router.get('/:id', quizController.getQuizById);

// GET /quizzes/:id/populate – Get quiz with populated questions (public)
router.get('/:id/populate', quizController.getQuizPopulated);

// POST /quizzes – Create quiz (requires auth)
router.post('/', authMiddleware, quizController.createQuiz);

// PUT /quizzes/:id – Update quiz title/description (author only)
router.put('/:id', authMiddleware, quizController.updateQuiz);

// DELETE /quizzes/:id – Delete quiz (author only) + cascade delete questions
router.delete('/:id', authMiddleware, quizController.deleteQuiz);

// POST /quizzes/:quizId/question – Add a single question (author)
router.post('/:quizId/question', authMiddleware, quizController.addQuestionToQuiz);

// POST /quizzes/:quizId/questions – Add multiple questions (author)
router.post('/:quizId/questions', authMiddleware, quizController.addMultipleQuestionsToQuiz);

module.exports = router;
