import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "../../redux/slices/quizSlice";
import AdminLayout from "../../components/AdminLayout";

const emptyForm = { title: "", description: "" };

function AdminQuizList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quizzes, loading, error } = useSelector((state) => state.quiz);

  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  const openCreate = () => {
    setEditingQuiz(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (quiz) => {
    setEditingQuiz(quiz);
    setForm({ title: quiz.title, description: quiz.description || "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.warn("Quiz title is required");
      return;
    }

    const action = editingQuiz
      ? updateQuiz({ id: editingQuiz._id, data: form })
      : createQuiz(form);

    const result = await dispatch(action);
    if (result.meta.requestStatus !== "rejected") {
      toast.success(editingQuiz ? "Quiz updated!" : "Quiz created!");
      closeModal();
      dispatch(fetchQuizzes());
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteQuiz(deleteTarget));
    if (result.meta.requestStatus !== "rejected") {
      toast.success("Quiz deleted successfully!");
      setDeleteTarget(null);
      dispatch(fetchQuizzes());
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: "800" }}>Manage Quizzes</h2>
          <p style={{ color: "var(--text-muted)" }}>{quizzes.length} quizzes in total</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Create New Quiz</button>
      </div>

      <div className="table-container animate-fade">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>#</th>
              <th>Quiz Info</th>
              <th style={{ textAlign: 'center' }}>Questions</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz, index) => (
              <tr key={quiz._id}>
                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{index + 1}</td>
                <td>
                  <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '4px' }}>{quiz.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
                    {quiz.description || "No description"}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-user">{quiz.questions?.length || 0}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => navigate(`/admin/questions?quizId=${quiz._id}`)}>
                      Questions
                    </button>
                    <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => openEdit(quiz)}>
                      Edit
                    </button>
                    <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => setDeleteTarget(quiz._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {quizzes.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No quizzes found. Click the button above to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="backdrop">
          <div className="glass-card animate-fade" style={{ padding: "32px", width: "100%", maxWidth: "500px" }}>
            <h3 style={{ marginBottom: "24px", fontSize: '1.5rem' }}>{editingQuiz ? "Edit Quiz" : "Create New Quiz"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Title</label>
                <input
                  type="text"
                  className="input-control"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  autoFocus
                  placeholder="e.g. JavaScript Fundamentals"
                />
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  className="input-control"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="What is this quiz about?"
                />
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: '2rem' }}>
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary">{editingQuiz ? "Update Quiz" : "Create Quiz"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="backdrop">
          <div className="glass-card animate-fade" style={{ padding: "32px", maxWidth: "400px", textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ marginBottom: "12px" }}>Delete Quiz?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: "2rem" }}>
              Are you sure? This will permanently remove the quiz and all its questions.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => setDeleteTarget(null)} className="btn-outline">Cancel</button>
              <button onClick={handleDelete} className="btn-primary" style={{ background: 'var(--danger)' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminQuizList;
