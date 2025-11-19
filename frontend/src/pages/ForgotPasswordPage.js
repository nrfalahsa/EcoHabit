import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../services/api';
import { useToast } from '../hooks/useToast';
import AuthCard from '../components/auth/AuthCard';

const Spinner = () => <div className="spinner"></div>;

const emailRegex = /\S+@\S+\.\S+/;

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState('');

  const { showToast } = useToast();

  const validateEmail = () => {
    if (email.trim() === '') {
      setEmailError('Email wajib diisi');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Email tidak valid');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail();

    if (!isEmailValid) {
      showToast('Harap periksa kembali form Anda', 'error');
      return;
    }

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
          <input 
            type="email" 
            id="email" 
            className="form-input" 
            placeholder=" " 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            onBlur={validateEmail} 
            required 
          />
          <label htmlFor="email" className="form-label">Email</label>
          {emailError && <small className="form-error">{emailError}</small>}
        </div>
        
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Kirim Link Reset'}
        </button>
      </form>
      
      <div className="auth-links text-center">
        <Link to="/login" className="auth-link">Kembali ke Login</Link>
      </div>
    </AuthCard>
  );
}

export default ForgotPasswordPage;