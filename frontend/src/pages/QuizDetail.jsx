import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuizById, clearCurrentQuiz } from "../redux/slices/quizSlice";

function QuizDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentQuiz, loading, error } = useSelector((state) => state.quiz);

  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    dispatch(fetchQuizById(id));
    return () => dispatch(clearCurrentQuiz());
  }, [dispatch, id]);

  const handleAnswerChange = (qIndex, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentQuiz) return;

    let correct = 0;
    currentQuiz.questions.forEach((q, i) => {
      // Logic for multi-answer support or single answer support
      const userIdx = answers[i];
      if (Array.isArray(q.correctAnswerIndices)) {
        if (q.correctAnswerIndices.includes(Number(userIdx))) correct++;
      } else if (Number(userIdx) === Number(q.correctAnswerIndex)) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <div className="animate-pulse">Loading quiz details...</div>
      </div>
    );
  }

  if (error || !currentQuiz) {
    return (
      <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Oops!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || "Quiz not found"}</p>
          <button onClick={() => navigate("/quizzes")} className="btn-outline">← Back to Explore</button>
        </div>
      </div>
    );
  }

  const total = currentQuiz.questions.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      <button
        onClick={() => navigate("/quizzes")}
        className="btn-outline"
        style={{ marginBottom: "2rem", display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        ← Back
      </button>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: "2.8rem", fontWeight: "800", marginBottom: "0.75rem" }}>{currentQuiz.title}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: '1.2rem' }}>{currentQuiz.description || "Good luck with the quiz!"}</p>
      </div>

      {submitted && (
        <div className="glass-card" style={{ 
          padding: '2.5rem', 
          marginBottom: '3rem', 
          textAlign: 'center',
          border: percentage >= 50 ? '1px solid var(--success)' : '1px solid var(--danger)',
          background: percentage >= 50 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your Score</div>
          <div style={{ fontSize: '4rem', fontWeight: '800', color: percentage >= 50 ? 'var(--success)' : 'var(--danger)' }}>
            {percentage}%
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '1.5rem' }}>
            You got {score} out of {total} questions correct
          </div>
          <button onClick={handleRetry} className="btn-primary">Try Again</button>
        </div>
      )}

      {total === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          This quiz has no questions yet.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {currentQuiz.questions.map((question, qIndex) => {
            const selectedIndex = answers[qIndex];
            const isAnswered = selectedIndex !== undefined;
            
            return (
              <div
                key={question._id}
                className="glass-card"
                style={{
                  padding: "2rem",
                  marginBottom: "2rem",
                  borderLeft: isAnswered ? '4px solid var(--primary)' : '1px solid var(--glass-border)',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    minWidth: '32px', 
                    height: '32px', 
                    background: isAnswered ? 'var(--primary)' : 'var(--bg-dark)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    fontWeight: '700'
                  }}>
                    {qIndex + 1}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", lineHeight: '1.4' }}>
                    {question.text}
                  </h3>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {question.options.map((option, oIndex) => {
                    const picked = Number(selectedIndex) === oIndex;
                    
                    let bg = 'rgba(255,255,255,0.03)';
                    let border = '1px solid var(--glass-border)';
                    
                    if (picked) {
                      bg = 'rgba(99, 102, 241, 0.1)';
                      border = '1px solid var(--primary)';
                    }

                    if (submitted) {
                      const isCorrect = Array.isArray(question.correctAnswerIndices) 
                        ? question.correctAnswerIndices.includes(oIndex)
                        : Number(question.correctAnswerIndex) === oIndex;
                      
                      if (isCorrect) {
                        bg = 'rgba(16, 185, 129, 0.1)';
                        border = '1px solid var(--success)';
                      } else if (picked) {
                        bg = 'rgba(239, 68, 68, 0.1)';
                        border = '1px solid var(--danger)';
                      }
                    }

                    return (
                      <label
                        key={oIndex}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "1rem 1.25rem",
                          borderRadius: "12px",
                          border: border,
                          cursor: submitted ? "default" : "pointer",
                          backgroundColor: bg,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!submitted && !picked) e.currentTarget.style.borderColor = 'var(--text-muted)';
                        }}
                        onMouseLeave={(e) => {
                          if (!submitted && !picked) e.currentTarget.style.borderColor = 'var(--glass-border)';
                        }}
                        onClick={() => handleAnswerChange(qIndex, oIndex)}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={picked}
                          onChange={() => handleAnswerChange(qIndex, oIndex)}
                          disabled={submitted}
                          style={{ 
                            marginRight: "16px", 
                            width: '20px', 
                            height: '20px',
                            accentColor: 'var(--primary)'
                          }}
                        />
                        <span style={{ fontSize: '1.05rem' }}>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!submitted && (
            <button
              type="submit"
              className="btn-primary"
              style={{ 
                width: "100%", 
                padding: "1rem", 
                fontSize: '1.1rem',
                marginTop: '1rem'
              }}
            >
              Finish & Submit Quiz
            </button>
          )}
        </form>
      )}
    </div>
  );
}

export default QuizDetail;
