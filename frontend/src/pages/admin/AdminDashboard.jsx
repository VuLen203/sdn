import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function AdminDashboard() {
  const { quizzes, allQuestions } = useSelector((state) => state.quiz);
  const { user } = useSelector((state) => state.auth);

  return (
    <AdminLayout>
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Hi, {user?.username}! 👋</div>
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>Admin Center</h2>
        <p style={{ color: "var(--text-muted)", fontSize: '1.1rem' }}>Manage your quizzes and questions efficiently</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Quizzes</div>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1.5rem' }}>{quizzes.length}</div>
          <Link to="/admin/quizzes" className="btn-primary" style={{ display: 'inline-block' }}>Manage Quizzes</Link>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Questions</div>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '1.5rem' }}>{allQuestions.length}</div>
          <Link to="/admin/questions" className="btn-primary" style={{ display: 'inline-block' }}>Manage Questions</Link>
        </div>

        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' }}>
           <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
           <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Ready to create something new?</h3>
           <Link to="/admin/quizzes" className="btn-outline">Quick Create Quiz</Link>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
