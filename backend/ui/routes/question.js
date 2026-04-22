const express = require('express');
const router = express.Router();

const { createApiClient } = require('../lib/apiClient');
const requireAdmin = require('../middleware/requireAdmin');

function getApi(req) {
  return createApiClient(req.session?.token);
}

// GET /questions - list all questions across quizzes
router.get('/', async (req, res) => {
  try {
    const api = getApi(req);
    const response = await api.get('/questions');

    return res.render('questions/list.ejs', {
      questions: response.data,
      user: req.session?.user || null,
      error: null,
    });
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to load questions';
    return res.status(500).render('questions/list.ejs', {
      questions: [],
      user: req.session?.user || null,
      error: msg,
    });
  }
});

// GET /questions/create - choose quiz + add one or many questions
router.get('/create', requireAdmin, async (req, res) => {
  try {
    const api = getApi(req);
    const quizzes = await api.get('/quizzes');
    return res.render('questions/create.ejs', {
      quizId: null,
      quizzes: quizzes.data,
      user: req.session?.user || null,
      error: null,
    });
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to load quizzes';
    return res.status(500).send(msg);
  }
});

// POST /questions/bulk - add many questions to selected quiz
router.post('/bulk', requireAdmin, async (req, res) => {
  try {
    const quizId = req.body.quizId;
    if (!quizId) {
      return res.status(400).send('quizId is required');
    }

    let questions = req.body.questions;
    if (questions && !Array.isArray(questions)) {
      questions = [questions];
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).send('Please add at least one question');
    }

    const normalized = questions.map((q) => {
      const questionText = String(q?.questionText || '').trim();
      const optsRaw = q?.options;
      const options = Array.isArray(optsRaw)
        ? optsRaw.map((o) => String(o || '').trim()).filter(Boolean)
        : [];
      const idx = Number(q?.correctIndex);
      const correctAnswer =
        Number.isInteger(idx) && idx >= 0 && idx < options.length
          ? options[idx]
          : '';
      return { questionText, options, correctAnswer };
    });

    const api = getApi(req);
    await api.post(`/quizzes/${quizId}/questions/bulk`, { questions: normalized });
    return res.redirect(`/quizzes/${quizId}`);
  } catch (err) {
    const msg = err?.response?.data?.message || 'Add questions failed';
    return res.status(400).send(msg);
  }
});

// GET /questions/:id - detail
router.get('/:id', async (req, res) => {
  try {
    const api = getApi(req);
    const response = await api.get(`/questions/${req.params.id}`);

    return res.render('questions/details.ejs', {
      data: response.data,
      user: req.session?.user || null,
      error: null,
    });
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to load question';
    return res.status(500).render('questions/details.ejs', {
      data: null,
      user: req.session?.user || null,
      error: msg,
    });
  }
});

// GET /questions/:id/edit
router.get('/:id/edit', requireAdmin, async (req, res) => {
  try {
    const api = getApi(req);
    const response = await api.get(`/questions/${req.params.id}`);
    return res.render('questions/edit.ejs', {
      data: response.data,
      user: req.session?.user || null,
      error: null,
    });
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to load question';
    return res.status(500).send(msg);
  }
});

// PUT /questions/:id
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { questionText, options, correctIndex } = req.body;

    const normalizedOptions = Array.isArray(options)
      ? options.map((o) => String(o || '').trim()).filter(Boolean)
      : [];

    const idx = Number(correctIndex);
    const correctAnswer =
      Number.isInteger(idx) && idx >= 0 && idx < normalizedOptions.length
        ? normalizedOptions[idx]
        : '';

    const api = getApi(req);
    const payload = { questionText, options: normalizedOptions };
    if (correctAnswer) payload.correctAnswer = correctAnswer;
    await api.put(`/questions/${req.params.id}`, payload);

    return res.redirect(`/questions/${req.params.id}`);
  } catch (err) {
    const msg = err?.response?.data?.message || 'Update question failed';
    return res.status(400).send(msg);
  }
});

// DELETE /questions/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const api = getApi(req);
    await api.delete(`/questions/${req.params.id}`);
    return res.redirect('/questions');
  } catch (err) {
    const msg = err?.response?.data?.message || 'Delete question failed';
    return res.status(400).send(msg);
  }
});

module.exports = router;
