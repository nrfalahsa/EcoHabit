// src/components/auth/AuthCard.js
import React from 'react';

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

AuthCard.defaultProps = {
  title: 'EcoHabit',
};

export default AuthCard;