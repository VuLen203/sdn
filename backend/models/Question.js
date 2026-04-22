const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: false,
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'A question must have at least 2 options',
      },
    },
    // New: allow multiple correct answers
    correctAnswerIndices: {
      type: [Number],
      default: undefined,
    },
    // Legacy: keep for backward compatibility (single correct answer)
    correctAnswerIndex: {
      type: Number,
      default: undefined,
      min: 0,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true },
);

questionSchema.pre('validate', function (next) {
  if (!Array.isArray(this.options) || this.options.length < 2) return next();

  // Normalize legacy single index into indices array
  const hasIndicesArray = Array.isArray(this.correctAnswerIndices) && this.correctAnswerIndices.length > 0;
  const hasLegacyIndex = Number.isInteger(this.correctAnswerIndex);

  if (!hasIndicesArray && hasLegacyIndex) {
    this.correctAnswerIndices = [Number(this.correctAnswerIndex)];
  }

  if (Array.isArray(this.correctAnswerIndices) && this.correctAnswerIndices.length > 0) {
    const normalized = this.correctAnswerIndices
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n));

    const unique = Array.from(new Set(normalized));
    if (unique.length !== normalized.length) {
      return next(new Error('correctAnswerIndices must not contain duplicates'));
    }
    if (unique.some((n) => n < 0 || n >= this.options.length)) {
      return next(new Error('correctAnswerIndices must be within options array bounds'));
    }

    // Keep legacy field in sync for older clients
    if (!Number.isInteger(this.correctAnswerIndex)) {
      this.correctAnswerIndex = unique[0];
    }
  } else if (Number.isInteger(this.correctAnswerIndex)) {
    // If only legacy field is set, validate it.
    if (this.correctAnswerIndex < 0 || this.correctAnswerIndex >= this.options.length) {
      return next(new Error('correctAnswerIndex must be within options array bounds'));
    }
  }
  next();
});

function applyCorrectAnswerTransform(ret) {
  // Ensure API responses always include correctAnswerIndices.
  if (!Array.isArray(ret.correctAnswerIndices) || ret.correctAnswerIndices.length === 0) {
    if (Number.isInteger(ret.correctAnswerIndex)) ret.correctAnswerIndices = [ret.correctAnswerIndex];
    else ret.correctAnswerIndices = [];
  }
  return ret;
}

questionSchema.set('toJSON', {
  transform: (doc, ret) => applyCorrectAnswerTransform(ret),
});

questionSchema.set('toObject', {
  transform: (doc, ret) => applyCorrectAnswerTransform(ret),
});

module.exports = mongoose.model('Question', questionSchema);
