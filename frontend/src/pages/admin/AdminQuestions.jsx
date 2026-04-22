import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchQuizzes,
  fetchQuizById,
  fetchAllQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  clearCurrentQuiz,
} from "../../redux/slices/quizSlice";
import AdminLayout from "../../components/AdminLayout";

const emptyForm = {
  text: "",
  options: ["", ""],
  correctAnswerIndices: [],
};

function AdminQuestions() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { quizzes, currentQuiz, allQuestions } = useSelector((state) => state.quiz);

  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchQuizzes());
    dispatch(fetchAllQuestions());
    return () => dispatch(clearCurrentQuiz());
  }, [dispatch]);

  useEffect(() => {
    const qid = searchParams.get("quizId");
    if (qid) setSelectedQuizId(qid);
  }, [searchParams]);

  useEffect(() => {
    if (selectedQuizId) {
      dispatch(fetchQuizById(selectedQuizId));
    } else {
      dispatch(fetchAllQuestions());
    }
  }, [selectedQuizId, dispatch]);

  const questionsToDisplay = selectedQuizId ? (currentQuiz?.questions || []) : allQuestions;
  const currentQuizTitle = selectedQuizId ? (currentQuiz?.title || "...") : "All Questions";

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm((prev) => ({ ...prev, options: newOptions }));
  };

  const toggleCorrect = (index) => {
    setForm((prev) => {
      const current = Array.isArray(prev.correctAnswerIndices) ? prev.correctAnswerIndices : [];
      const exists = current.includes(index);
      const next = exists ? current.filter((n) => n !== index) : [...current, index];
      next.sort((a, b) => a - b);
      return { ...prev, correctAnswerIndices: next };
    });
  };

  const addOptionRow = () => {
    setForm((prev) => {
      if (prev.options.length >= 7) return prev;
      return { ...prev, options: [...prev.options, ""] };
    });
  };

  const removeOptionRow = (index) => {
    setForm((prev) => {
      if (prev.options.length <= 2) return prev;
      const nextOptions = prev.options.filter((_, i) => i !== index);
      const current = Array.isArray(prev.correctAnswerIndices) ? prev.correctAnswerIndices : [];
      const nextCorrect = current
        .filter((n) => n !== index)
        .map((n) => (n > index ? n - 1 : n))
        .sort((a, b) => a - b);
      return { ...prev, options: nextOptions, correctAnswerIndices: nextCorrect };
    });
  };

  const handleEdit = (question) => {
    setEditingId(question._id);
    setForm({
      text: question.text,
      options: [...question.options],
      correctAnswerIndices: [...(question.correctAnswerIndices || [])].sort((a, b) => a - b),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) {
      toast.warn("Question text is required");
      return;
    }
    if (form.correctAnswerIndices.length === 0) {
      toast.warn("Please select at least one correct answer");
      return;
    }

    const questionData = {
      text: form.text.trim(),
      options: form.options.map(o => o.trim()),
      correctAnswerIndices: form.correctAnswerIndices,
    };

    if (editingId) {
      const result = await dispatch(updateQuestion({ questionId: editingId, questionData }));
      if (result.meta.requestStatus !== "rejected") {
        toast.success("Question updated!");
        setEditingId(null);
        setForm(emptyForm);
        dispatch(selectedQuizId ? fetchQuizById(selectedQuizId) : fetchAllQuestions());
      }
    } else {
      if (!selectedQuizId) {
        toast.error("Please select a quiz to add this question to");
        return;
      }
      const result = await dispatch(addQuestion({ quizId: selectedQuizId, questionData }));
      if (result.meta.requestStatus !== "rejected") {
        toast.success("Question added!");
        setForm(emptyForm);
      }
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    const result = await dispatch(deleteQuestion({ questionId }));
    if (result.meta.requestStatus !== "rejected") {
      toast.success("Question deleted!");
      dispatch(selectedQuizId ? fetchQuizById(selectedQuizId) : fetchAllQuestions());
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: "800" }}>Manage Questions</h2>
          <p style={{ color: "var(--text-muted)" }}>{currentQuizTitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Filter by Quiz:</span>
          <select
            className="input-control"
            style={{ width: "auto", padding: '8px 16px' }}
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
          >
            <option value="">-- All Quizzes --</option>
            {quizzes.map((q) => <option key={q._id} value={q._id}>{q.title}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card animate-fade" style={{ padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? "Edit Question" : "Add New Question"}</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Question Text</label>
            <input
              className="input-control"
              value={form.text}
              onChange={(e) => setForm(p => ({ ...p, text: e.target.value }))}
              placeholder="What would you like to ask?"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)' }}>Options (Check the correct ones)</label>
            <div style={{ display: 'grid', gap: '12px' }}>
              {form.options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={form.correctAnswerIndices.includes(i)}
                    onChange={() => toggleCorrect(i)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--success)' }}
                  />
                  <input
                    className="input-control"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    style={{ borderColor: form.correctAnswerIndices.includes(i) ? 'var(--success)' : 'var(--border)' }}
                  />
                  {form.options.length > 2 && (
                    <button type="button" onClick={() => removeOptionRow(i)} className="btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '8px' }}>✕</button>
                  )}
                </div>
              ))}
            </div>
            {form.options.length < 7 && (
              <button type="button" onClick={addOptionRow} className="btn-outline" style={{ marginTop: '12px', fontSize: '0.85rem' }}>+ Add Option</button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingId ? "Update Question" : "Add Question"}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="btn-outline">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="table-container animate-fade">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>#</th>
              <th>Question</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questionsToDisplay.map((q, i) => (
              <tr key={q._id}>
                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{i + 1}</td>
                <td>
                  <div style={{ fontWeight: '500' }}>{q.text}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {q.options.map((opt, oi) => (
                      <span key={oi} style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: q.correctAnswerIndices?.includes(oi) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                        color: q.correctAnswerIndices?.includes(oi) ? 'var(--success)' : 'var(--text-muted)',
                        border: q.correctAnswerIndices?.includes(oi) ? '1px solid var(--success)' : '1px solid var(--glass-border)'
                      }}>
                        {opt}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => handleEdit(q)}>Edit</button>
                    <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleDelete(q._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default AdminQuestions;
