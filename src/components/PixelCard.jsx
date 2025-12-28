import React from 'react';

export default function PixelCard({ children, className = '' }) {
  return (
    <div className={`pixel-card ${className}`} style={{ 
      position: 'relative', 
      background: 'var(--color-bg)',
      padding: '2rem',
      boxShadow: '0 0 0 4px var(--color-border)',
      marginBottom: '1rem'
    }}>
      {/* Corner decorations could be added here for extra flair */}
      {children}
    </div>
  );
}
