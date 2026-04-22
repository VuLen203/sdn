import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuizzes,
  fetchQuizById,
  clearCurrentQuiz,
} from '../redux/slices/quizSlice';

function QuizPage() {
  const dispatch = useDispatch();
  const { quizzes, currentQuiz, loading } = useSelector((state) => state.quiz);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Fetch all quizzes on mount
  useEffect(() => {
    dispatch(fetchQuizzes());
    return () => dispatch(clearCurrentQuiz());
  }, [dispatch]);

  // Auto-select first quiz
  useEffect(() => {
    if (quizzes.length > 0) {
      dispatch(fetchQuizById(quizzes[0]._id));
    }
  }, [quizzes, dispatch]);

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuiz) return;

    const question = currentQuiz.questions[currentIndex];
    const isCorrect = selectedOption === question.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;

    if (currentIndex + 1 >= currentQuiz.questions.length) {
      setScore(newScore);
      setCompleted(true);
    } else {
      setScore(newScore);
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption('');
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption('');
    setScore(0);
    setCompleted(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>Loading...</div>
    );
  }

  if (!currentQuiz || currentQuiz.questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        No quiz available.
      </div>
    );
  }

  // Completed screen
  if (completed) {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <h1 style={{ fontWeight: 'bold', marginBottom: '12px' }}>
          Quiz Completed
        </h1>
        <p style={{ marginBottom: '24px' }}>Your score: {score}</p>
        <button
          onClick={handleRestart}
          style={{
            padding: '10px 28px',
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  const question = currentQuiz.questions[currentIndex];

  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <h2
        style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '1.8rem' }}
      >
        Quiz
      </h2>
      <p
        style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '20px' }}
      >
        {question.questionText}
      </p>

      <div
        style={{
          display: 'inline-block',
          textAlign: 'left',
          marginBottom: '28px',
        }}
      >
        {question.options.map((option, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="option"
                value={option}
                checked={selectedOption === option}
                onChange={() => setSelectedOption(option)}
                style={{ marginRight: '8px' }}
              />
              {option}
            </label>
          </div>
        ))}
      </div>

      <div>
        <button
          onClick={handleSubmitAnswer}
          disabled={!selectedOption}
          style={{
            padding: '10px 28px',
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '15px',
            cursor: selectedOption ? 'pointer' : 'not-allowed',
          }}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
}

export default QuizPage;
