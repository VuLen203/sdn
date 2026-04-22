const express = require('express');
const router = express.Router();

const { createApiClient } = require('../lib/apiClient');
const requireAdmin = require('../middleware/requireAdmin');

function getApi(req) {
  return createApiClient(req.session?.token);
}

// GET /quizzes - list quizzes
router.get('/', async (req, res) => {
  try {
    const api = getApi(req);
    const response = await api.get('/quizzes');

    return res.render('quiz/list.ejs', {
      quizzes: response.data,
      user: req.session?.user || null,
      error: null,
    });
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to load quizzes';
    return res.status(500).render('quiz/list.ejs', {
      quizzes: [],
      user: req.session?.user || null,
      error: msg,
    });
  }
});

// GET /quizzes/create
router.get('/create', requireAdmin, (req, res) => {
  return res.render('quiz/create.ejs', { user: req.session?.user || null, error: null });
});

// POST /quizzes
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;
    const api = getApi(req);
    await api.post('/quizzes', { title, description });
    return res.redirect('/quizzes');
  } catch (err) {
    const msg = err?.response?.data?.message || 'Create quiz failed';
    return res.status(400).render('quiz/create.ejs', { user: req.session?.user || null, error: msg });
  }
});

// GET /quizzes/:id - detail
router.get('/:id', async (req, res) => {
  try {
    const api = getApi(req);
    const response = await api.get(`/quizzes/${req.params.id}`);

    return res.render('quiz/details.ejs', {
      quiz: response.data,
      user: req.session?.user || null,
      error: null,
    });
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to load quiz';
    return res.status(500).render('quiz/details.ejs', {
      quiz: null,
      user: req.session?.user || null,
      error: msg,
    });
  }
});

// GET /quizzes/:id/questions/create - bulk add questions UI
router.get('/:id/questions/create', requireAdmin, async (req, res) => {
  return res.render('questions/create.ejs', {
    quizId: req.params.id,
    user: req.session?.user || null,
    error: null,
  });
});

// POST /quizzes/:id/questions - bulk add questions
router.post('/:id/questions', requireAdmin, async (req, res) => {
  try {
    const quizId = req.params.id;
    const api = getApi(req);

    let questions = req.body.questions;
    // When only 1 question exists, it might be an object rather than array
    if (questions && !Array.isArray(questions)) {
      questions = [questions];
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).render('questions/create.ejs', {
        quizId,
        user: req.session?.user || null,
        error: 'Please add at least one question',
      });
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

    await api.post(`/quizzes/${quizId}/questions/bulk`, { questions: normalized });
    return res.redirect(`/quizzes/${quizId}`);
  } catch (err) {
    const msg = err?.response?.data?.message || 'Add questions failed';
    return res.status(400).render('questions/create.ejs', {
      quizId: req.params.id,
      user: req.session?.user || null,
      error: msg,
    });
  }
});

// GET /quizzes/:id/edit
router.get('/:id/edit', requireAdmin, async (req, res) => {
  try {
    const api = getApi(req);
    const response = await api.get(`/quizzes/${req.params.id}`);
    return res.render('quiz/edit.ejs', {
      quiz: response.data,
      user: req.session?.user || null,
      error: null,
    });
  } catch (err) {
    const msg = err?.response?.data?.message || 'Failed to load quiz';
    return res.status(500).send(msg);
  }
});

// PUT /quizzes/:id
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, description } = req.body;
    const api = getApi(req);
    await api.put(`/quizzes/${req.params.id}`, { title, description });
    return res.redirect(`/quizzes/${req.params.id}`);
  } catch (err) {
    const msg = err?.response?.data?.message || 'Update quiz failed';
    return res.status(400).send(msg);
  }
});

// DELETE /quizzes/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const api = getApi(req);
    await api.delete(`/quizzes/${req.params.id}`);
    return res.redirect('/quizzes');
  } catch (err) {
    const msg = err?.response?.data?.message || 'Delete quiz failed';
    return res.status(400).send(msg);
  }
});

module.exports = router;
