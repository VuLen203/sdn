import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizzes } from "../redux/slices/quizSlice";

function QuizList() {
  const dispatch = useDispatch();
  const { quizzes, loading, error } = useSelector((state) => state.quiz);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        color: 'var(--text-muted)'
      }}>
        <div className="animate-pulse">Loading amazing quizzes...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <div style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Hi, {user?.username}! 👋</div>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>Available Quizzes</h2>
          <p style={{ color: "var(--text-muted)", fontSize: '1.1rem' }}>Test your knowledge and challenge yourself</p>
        </div>
        <div className="badge badge-user" style={{ padding: '8px 16px', fontSize: '1rem' }}>
          {quizzes.length} Quizzes Found
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid var(--danger)', 
          borderRadius: '12px',
          color: 'var(--danger)',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}

      {quizzes.length === 0 && !error ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>Empty 📭</div>
          <p style={{ color: 'var(--text-muted)' }}>No quizzes available at the moment. Please check back later!</p>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
          gap: "24px" 
        }}>
          {quizzes.map((quiz, index) => (
            <div
              key={quiz._id}
              className="glass-card"
              style={{
                padding: "24px",
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                animationDelay: `${index * 0.1}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                   <div style={{ 
                     background: 'rgba(99, 102, 241, 0.1)', 
                     color: 'var(--primary)', 
                     padding: '4px 10px', 
                     borderRadius: '8px',
                     fontSize: '0.8rem',
                     fontWeight: '700'
                   }}>
                     QUIZ
                   </div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                     {quiz.questions?.length || 0} Questions
                   </div>
                </div>
                
                <h3 style={{ fontSize: "1.35rem", fontWeight: "700", marginBottom: "0.75rem" }}>
                  {quiz.title}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem", minHeight: '3rem' }}>
                  {quiz.description || "No description provided for this quiz."}
                </p>
              </div>

              <Link
                to={`/quizzes/${quiz._id}`}
                className="btn-primary"
                style={{ 
                  width: "100%", 
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                Start Quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizList;
