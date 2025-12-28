import React, { useEffect, useState, useRef } from 'react';
import { submitResult } from '../services/api';

export default function ResultScreen({ score, totalQuestions, userId, answers, onRestart, onNewGame }) {
  const [submitting, setSubmitting] = useState(true);
  const submittedRef = useRef(false); // Guard for StrictMode double-fire

  // Environment variable for pass threshold, default to ~60%
  const PASS_THRESHOLD = parseInt(import.meta.env.VITE_PASS_THRESHOLD) || Math.ceil(totalQuestions * 0.6);
  const passed = (score / 10) >= PASS_THRESHOLD; // Provided score is score value (e.g. 50), threshold is count (e.g. 3). Wait.
  // In GameScreen I should pass 'correctCount' not raw score to be safe, or API calculation.
  // But for simple display:
  const correctCount = score / 10;
  
  useEffect(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const submit = async () => {
      // Submitting correct answers count or raw answers?
      // API expects { userId, answers: { qId: answer } }
      // The score calculation happens on backend too, but we show local result first.
      try {
        await submitResult(userId, answers);
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
      }
    };
    submit();
  }, [userId, answers]);

  return (
    <div className="flex-col flex-center animate-pulse" style={{ marginTop: '2rem' }}>
      <h1 style={{ 
        fontSize: '3rem', 
        color: passed ? 'var(--color-secondary)' : 'var(--color-primary)', 
        textShadow: '4px 4px 0px #000',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        {passed ? 'MISSION COMPLETE' : 'GAME OVER'}
      </h1>

      <div className="pixel-border" style={{ padding: '2rem', background: '#333', minWidth: '300px', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '10px' }}>PLAYER</p>
          <p style={{ fontSize: '1.5rem', color: '#fff' }}>{userId}</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '10px' }}>SCORE</p>
          <p style={{ fontSize: '3rem', color: passed ? 'var(--color-secondary)' : 'var(--color-primary)' }}>
            {score}
          </p>
          <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
            ({correctCount} / {totalQuestions} CORRECT)
          </p>
        </div>

        {submitting && <p className="animate-pulse">SAVING DATA...</p>}
        {!submitting && (
          <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '20px' }}>
            DATA SAVED
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onRestart} className="pixel-btn" style={{ flex: 1 }}>
            TRY AGAIN
          </button>
          <button onClick={onNewGame} className="pixel-btn" style={{ flex: 1, filter: 'grayscale(1)' }}>
            NEW PLAYER
          </button>
        </div>
      </div>
    </div>
  );
}
