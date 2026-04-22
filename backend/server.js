const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const session = require('express-session');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const quizRoutes = require('./routes/quiz');
const questionRoutes = require('./routes/question');

const uiIndexRoutes = require('./ui/routes/index');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
  }),
);

// Static assets for server-rendered UI
app.use('/public', express.static(path.join(__dirname, 'ui', 'public')));

// View engines: Handlebars (main) + EJS (for quiz/question pages)
app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'ui', 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'ui', 'views', 'partials'),
  }),
);
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'ui', 'views'));
app.set('view engine', 'hbs');

// Make session user available to templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
// Server-rendered UI is kept under /ui so it doesn't shadow REST API routes.
app.use('/ui', uiIndexRoutes);

// New REST API (matches Postman spec)
app.use('/users', userRoutes);
app.use('/quizzes', quizRoutes);
app.use('/questions', questionRoutes);

// Backward-compatible API routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: 'Internal server error', error: err.message });
});

// ─── Connect to MongoDB & Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
