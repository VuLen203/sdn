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

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().select(
      'quizId text options correctAnswerIndices correctAnswerIndex createdAt updatedAt',
    );
    return res.status(200).json(questions);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    return res.status(200).json(question);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { quizId, text, options, correctAnswerIndices, correctAnswerIndex } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'text is required' });
    }
    if (!Array.isArray(options) || options.length < 2 || options.length > 7) {
      return res
        .status(400)
        .json({ message: 'options must be an array of 2 to 7 items' });
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

    let quiz = null;
    if (quizId) {
      quiz = await Quiz.findById(quizId);
      if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    }

    const created = await Question.create({
      quizId: quiz ? quiz._id : undefined,
      text: String(text).trim(),
      options: normalizedOptions,
      correctAnswerIndices: normalizedCorrect.indices,
      correctAnswerIndex: normalizedCorrect.legacyIndex,
      author: req.user.id,
    });

    if (quiz) {
      quiz.questions.push(created._id);
      await quiz.save();
    }

    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { text, options, correctAnswerIndices, correctAnswerIndex } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Authorization check: ONLY the author can edit
    if (question.author && question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only the author can edit this question.' });
    }

    if (text !== undefined) {
      const t = String(text).trim();
      if (!t) return res.status(400).json({ message: 'text cannot be empty' });
      question.text = t;
    }

    if (options !== undefined) {
      if (!Array.isArray(options) || options.length < 2 || options.length > 7) {
        return res
          .status(400)
          .json({ message: 'options must be an array of 2 to 7 items' });
      }
      const normalizedOptions = options.map((o) => String(o ?? '').trim());
      if (normalizedOptions.some((o) => !o)) {
        return res.status(400).json({ message: 'options cannot contain empty items' });
      }
      question.options = normalizedOptions;
    }

    if (correctAnswerIndices !== undefined || correctAnswerIndex !== undefined) {
      const normalizedCorrect = normalizeCorrectAnswerIndices(
        { correctAnswerIndices, correctAnswerIndex },
        question.options.length,
      );
      if (normalizedCorrect.error) {
        return res.status(400).json({ message: normalizedCorrect.error });
      }
      question.correctAnswerIndices = normalizedCorrect.indices;
      question.correctAnswerIndex = normalizedCorrect.legacyIndex;
    }

    await question.save();
    return res.status(200).json(question);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Authorization check: ONLY the author can delete
    if (question.author && question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. Only the author can delete this question.' });
    }

    await Quiz.updateOne({ _id: question.quizId }, { $pull: { questions: question._id } });
    await Question.deleteOne({ _id: question._id });

    return res.status(200).json({ message: 'Question deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
