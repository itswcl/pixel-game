import React, { useState } from 'react';
import StartScreen from './pages/StartScreen';
import GameScreen from './pages/GameScreen';
import ResultScreen from './pages/ResultScreen';
import { fetchQuestions } from './services/api';

function App() {
  const [gameState, setGameState] = useState('START'); // START, LOADING, PLAYING, RESULT
  const [userId, setUserId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  const handleStart = async (id) => {
    setUserId(id);
    setGameState('LOADING');
    // Fetch Questions
    const count = parseInt(import.meta.env.VITE_QUESTION_COUNT) || 5;
    const qs = await fetchQuestions(count);
    setQuestions(qs);
    setGameState('PLAYING');
  };

  const handleEndGame = (score, answers) => {
    setFinalScore(score);
    setUserAnswers(answers);
    setGameState('RESULT');
  };

  const handleRestart = () => {
    // Replay with the same user ID
    handleStart(userId);
  };

  return (
    <div className="App">
      {gameState === 'START' && <StartScreen onStart={handleStart} />}
      
      {gameState === 'LOADING' && (
        <div className="flex-col flex-center">
           <div style={{ fontSize: '3rem', marginBottom: '1rem' }} className="animate-pulse">👾</div>
           <p style={{ fontSize: '1.2rem' }}>LOADING STAGE...</p>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <GameScreen 
          questions={questions} 
          userId={userId} 
          onEndGame={handleEndGame} 
        />
      )}

      {gameState === 'RESULT' && (
        <ResultScreen 
          score={finalScore} 
          totalQuestions={questions.length} 
          userId={userId} 
          answers={userAnswers}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
