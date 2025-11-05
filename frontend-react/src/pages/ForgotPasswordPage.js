// src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../services/api';
import { useToast } from '../hooks/useToast';
import AuthCard from '../components/auth/AuthCard';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authFetch('/auth/forgot', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      showToast(data.message, 'success');
      setEmail('');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Reset Password">
      <form id="forgotForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input 
            type="email" 
            id="email" 
            className="form-input" 
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
        </button>
      </form>
      <div className="auth-links text-center">
        <Link to="/login" className="auth-link">Kembali ke Login</Link>
      </div>
    </AuthCard>
  );
}

export default ForgotPasswordPage;