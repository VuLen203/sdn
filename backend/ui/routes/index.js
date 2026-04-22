const express = require('express');
const router = express.Router();
const { createApiClient } = require('../lib/apiClient');
const requireLogin = require('../middleware/requireLogin');

const quizRoutes = require('./quiz');
const questionRoutes = require('./question');

router.get('/', (req, res) => {
  return res.render('home', { user: req.session?.user || null });
});

router.get('/login', (req, res) => {
  return res.render('auth/login.ejs', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const api = createApiClient();

    const response = await api.post('/auth/login', { username, password });

    req.session.token = response.data.token;
    req.session.user = response.data.user;

    return res.redirect('/ui/quizzes');
  } catch (err) {
    const msg = err?.response?.data?.message || 'Login failed';
    return res.status(400).render('auth/login.ejs', { error: msg });
  }
});

router.get('/register', (req, res) => {
  return res.render('auth/register.ejs', { error: null });
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    const role = isAdmin === 'on' ? 'admin' : 'user';

    const api = createApiClient();
    await api.post('/auth/register', { username, password, role });

    return res.redirect('/login');
  } catch (err) {
    const msg = err?.response?.data?.message || 'Register failed';
    return res.status(400).render('auth/register.ejs', { error: msg });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/ui');
  });
});

router.use('/quizzes', requireLogin, quizRoutes);
router.use('/questions', requireLogin, questionRoutes);

module.exports = router;
