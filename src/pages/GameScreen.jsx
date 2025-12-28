import React, { useState } from 'react';

export default function GameScreen({ questions, userId, onEndGame }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' }
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false); // Immediate feedback
  const [isCorrect, setIsCorrect] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (optionKey) => {
    if (showFeedback) return; // Block clicks during feedback

    // Robust comparison: handle potential whitespace or case differences from Sheet
    const correctAnswer = String(currentQuestion.answer || '').trim().toUpperCase();
    const isAnswerCorrect = correctAnswer === optionKey.toUpperCase();
    setSelectedOption(optionKey);
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    // Update state
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionKey }));
    if (isAnswerCorrect) {
      setScore(prev => prev + 10);
    }

    // Auto advance after short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
      } else {
        // Game Over
        onEndGame(isAnswerCorrect ? score + 10 : score, { ...answers, [currentQuestion.id]: optionKey });
      }
    }, 1500);
  };

  return (
    <div className="game-container">
      {/* Header Info */}
      <div className="header-info">
        <div>PLAYER: <span style={{ color: '#fff' }}>{userId}</span></div>
        <div>STAGE {currentIndex + 1}-{questions.length}</div>
      </div>

      {/* Main Game Area */}
      <div className="pixel-border" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Avatar */}
        <div className="avatar-container">
             <img 
               src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${currentQuestion.id + 'boss'}`} 
               alt="Boss" 
               className="avatar-img"
             />
             {showFeedback && (
               <div className="boss-feedback" style={{ color: isCorrect ? 'var(--color-secondary)' : 'var(--color-error)' }}>
                 {isCorrect ? 'HIT!' : 'MISS'}
               </div>
             )}
        </div>

        {/* Question */}
        <div style={{ marginBottom: '2rem', textAlign: 'center', width: '100%' }}>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.5' }}>{currentQuestion.text}</p>
        </div>

        {/* Options */}
        <div className="options-grid" style={{ width: '100%' }}>
          {['A', 'B', 'C', 'D'].map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionSelect(opt)}
              disabled={showFeedback}
              className={`
                pixel-btn
                ${selectedOption === opt 
                    ? (isCorrect ? 'correct' : 'wrong') 
                    : ''}
              `}
            >
              <span style={{ color: 'var(--color-accent)', marginRight: '10px' }}>{opt}.</span> 
              {currentQuestion.options[opt]}
            </button>
          ))}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="progress-container">
        <div 
          className="progress-bar"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
