const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

function normalizeCorrectAnswerIndices({ correctAnswerIndices, correctAnswerIndex }, optionsLength) {
  if (Array.isArray(correctAnswerIndices)) {
    const normalized = correctAnswerIndices
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n));
    const unique = Array.from(new Set(normalized));
    if (unique.length === 0) {
      return { error: 'correctAnswerIndices must contain at least 1 valid index' };
    }
    if (unique.length !== normalized.length) {
      return { error: 'correctAnswerIndices must not contain duplicates' };
    }
    if (unique.some((n) => n < 0 || n >= optionsLength)) {
      return { error: 'correctAnswerIndices must be within options array bounds' };
    }
    return { indices: unique, legacyIndex: unique[0] };
  }

  const idx = Number(correctAnswerIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= optionsLength) {
    return { error: 'correctAnswerIndex must be a valid option index' };
  }
  return { indices: [idx], legacyIndex: idx };
}

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('title description questions createdAt updatedAt');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getQuizPopulated = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    return res.status(200).json(quiz);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Quiz title is required' });
    }

    const quiz = new Quiz({
      title: title.trim(),
      description: description || '',
      questions: Array.isArray(questions) ? questions : [],
      author: req.user.id,
    });
    await quiz.save();

    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { title, description } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Authorization check: ONLY the author can edit
    if (quiz.author && quiz.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only the author can edit this quiz.' });
    }

    if (title !== undefined) quiz.title = title.trim();
    if (description !== undefined) quiz.description = description;

    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Authorization check: ONLY the author can delete
    if (quiz.author && quiz.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only the author can delete this quiz.' });
    }

    await Question.deleteMany({ quizId: quiz._id });
    await Quiz.findByIdAndDelete(quiz._id);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addQuestionToQuiz = async (req, res) => {
  try {
    const { text, options, correctAnswerIndices, correctAnswerIndex } = req.body;

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Authorization check: ONLY the author can add questions
    if (quiz.author && quiz.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only the author can add questions to this quiz.' });
    }

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'text is required' });
    }
    if (!Array.isArray(options) || options.length < 2 || options.length > 7) {
      return res.status(400).json({ message: 'options must be an array of 2 to 7 items' });
    }
    const normalizedOptions = options.map((o) => String(o ?? '').trim());
    if (normalizedOptions.some((o) => !o)) {
      return res.status(400).json({ message: 'options cannot contain empty items' });
    }

    const normalizedCorrect = normalizeCorrectAnswerIndices(
      { correctAnswerIndices, correctAnswerIndex },
      normalizedOptions.length,
    );
    if (normalizedCorrect.error) {
      return res.status(400).json({ message: normalizedCorrect.error });
    }

    const created = await Question.create({
      quizId: quiz._id,
      text: String(text).trim(),
      options: normalizedOptions,
      correctAnswerIndices: normalizedCorrect.indices,
      correctAnswerIndex: normalizedCorrect.legacyIndex,
      author: req.user.id,
    });

    quiz.questions.push(created._id);
    await quiz.save();

    const populated = await Quiz.findById(quiz._id).populate('questions');
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addMultipleQuestionsToQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Authorization check: ONLY the author can add questions
    if (quiz.author && quiz.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only the author can add questions to this quiz.' });
    }

    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: 'Body must be a non-empty array of questions' });
    }

    const payload = req.body.map((q) => {
      const text = q?.text;
      const options = q?.options;
      const correctAnswerIndices = q?.correctAnswerIndices;
      const correctAnswerIndex = q?.correctAnswerIndex;

      if (!text || !String(text).trim()) {
        throw new Error('Each question must have text');
      }
      if (!Array.isArray(options) || options.length < 2 || options.length > 7) {
        throw new Error('Each question must have options (2 to 7 items)');
      }
      const normalizedOptions = options.map((o) => String(o ?? '').trim());
      if (normalizedOptions.some((o) => !o)) {
        throw new Error('Options cannot contain empty items');
      }

      const normalizedCorrect = normalizeCorrectAnswerIndices(
        { correctAnswerIndices, correctAnswerIndex },
        normalizedOptions.length,
      );
      if (normalizedCorrect.error) {
        throw new Error(normalizedCorrect.error);
      }

      return {
        quizId: quiz._id,
        text: String(text).trim(),
        options: normalizedOptions,
        correctAnswerIndices: normalizedCorrect.indices,
        correctAnswerIndex: normalizedCorrect.legacyIndex,
        author: req.user.id,
      };
    });

    const created = await Question.insertMany(payload);
    quiz.questions.push(...created.map((c) => c._id));
    await quiz.save();

    const populated = await Quiz.findById(quiz._id).populate('questions');
    return res.status(201).json(populated);
  } catch (err) {
    if (
      String(err.message || '').startsWith('Each question') ||
      String(err.message || '').includes('Options') ||
      String(err.message || '').includes('correctAnswer')
    ) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
