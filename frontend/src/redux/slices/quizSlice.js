import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/quizzes');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải danh sách quiz',
      );
    }
  },
);

export const fetchQuizById = createAsyncThunk(
  'quiz/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/quizzes/${id}/populate`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải quiz',
      );
    }
  },
);

export const createQuiz = createAsyncThunk(
  'quiz/create',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tạo quiz',
      );
    }
  },
);

export const updateQuiz = createAsyncThunk(
  'quiz/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/quizzes/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể cập nhật quiz',
      );
    }
  },
);

export const deleteQuiz = createAsyncThunk(
  'quiz/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/quizzes/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể xoá quiz',
      );
    }
  },
);

export const addQuestion = createAsyncThunk(
  'quiz/addQuestion',
  async ({ quizId, questionData }, { rejectWithValue }) => {
    try {
      // Backend expects: { text, options, correctAnswerIndex }
      const response = await api.post(`/quizzes/${quizId}/question`, questionData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể thêm câu hỏi',
      );
    }
  },
);

export const updateQuestion = createAsyncThunk(
  'quiz/updateQuestion',
  async ({ questionId, questionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/questions/${questionId}`, questionData);
      return { questionId, question: response.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể cập nhật câu hỏi',
      );
    }
  },
);

export const deleteQuestion = createAsyncThunk(
  'quiz/deleteQuestion',
  async ({ questionId }, { rejectWithValue }) => {
    try {
      await api.delete(`/questions/${questionId}`);
      return { questionId };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể xoá câu hỏi',
      );
    }
  },
);

export const fetchAllQuestions = createAsyncThunk(
  'quiz/fetchAllQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/questions');
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải danh sách câu hỏi',
      );
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizzes: [],
    allQuestions: [],
    currentQuiz: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchQuizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchQuizById
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createQuiz
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.quizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.error = action.payload;
      })
      // updateQuiz
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const idx = state.quizzes.findIndex(
          (q) => q._id === action.payload._id,
        );
        if (idx !== -1) state.quizzes[idx] = action.payload;
        if (state.currentQuiz?._id === action.payload._id)
          state.currentQuiz = action.payload;
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.error = action.payload;
      })
      // deleteQuiz
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter((q) => q._id !== action.payload);
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.error = action.payload;
      })
      // addQuestion
      .addCase(addQuestion.fulfilled, (state, action) => {
        const idx = state.quizzes.findIndex(
          (q) => q._id === action.payload._id,
        );
        if (idx !== -1) state.quizzes[idx] = action.payload;
        state.currentQuiz = action.payload;
      })
      .addCase(addQuestion.rejected, (state, action) => {
        state.error = action.payload;
      })
      // updateQuestion
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const { questionId, question } = action.payload;
        if (state.currentQuiz?.questions?.length) {
          state.currentQuiz.questions = state.currentQuiz.questions.map((q) =>
            q._id === questionId ? question : q,
          );
        }
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.error = action.payload;
      })
      // deleteQuestion
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        const { questionId } = action.payload;
        if (state.currentQuiz?.questions?.length) {
          state.currentQuiz.questions = state.currentQuiz.questions.filter(
            (q) => q._id !== questionId,
          );
        }
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.error = action.payload;
      })
      // fetchAllQuestions
      .addCase(fetchAllQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.allQuestions = action.payload;
      })
      .addCase(fetchAllQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer;
