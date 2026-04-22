const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// GET /questions (public) - list all questions
router.get('/', questionController.getAllQuestions);

// GET /questions/:id (public)
router.get('/:id', questionController.getQuestionById);

// POST /questions (requires auth for author field)
router.post('/', authMiddleware, questionController.createQuestion);

// PUT /questions/:id (author only)
router.put('/:id', authMiddleware, questionController.updateQuestion);

// DELETE /questions/:id (author only)
router.delete('/:id', authMiddleware, questionController.deleteQuestion);

module.exports = router;
