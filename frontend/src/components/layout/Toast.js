import React, { useState, useEffect } from 'react';

function Toast({ message, type, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    const hideTimer = setTimeout(() => setIsVisible(false), 2800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div 
      className={`toast toast-${type} ${isVisible ? 'show' : ''}`}
      onTransitionEnd={!isVisible ? onRemove : undefined}
    >
      {message}
    </div>
  );
}

export default Toast;