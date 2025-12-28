import React, { useState } from 'react';

export default function StartScreen({ onStart }) {
  const [userId, setUserId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userId.trim()) {
      onStart(userId.trim());
    }
  };

  return (
    <div className="flex-col flex-center" style={{ width: '100%', padding: '20px' }}>
      <h1 style={{ 
        fontSize: '3rem', 
        color: 'var(--color-primary)', 
        textShadow: '4px 4px 0px #000',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        PIXEL QUIZ
      </h1>
      
      <div className="pixel-border" style={{ padding: '2rem', background: '#333' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--color-accent)', textAlign: 'center' }}>ENTER PLAYER ID</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{
              padding: '10px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '1.2rem',
              border: '4px solid var(--color-border)',
              background: '#000',
              color: '#fff',
              outline: 'none',
              textAlign: 'center'
            }}
            placeholder="PLAYER 1"
          />
          <button type="submit" className="pixel-btn">
            INSERT COIN (START)
          </button>
        </form>
      </div>
    </div>
  );
}
