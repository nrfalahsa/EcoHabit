import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../services/api';
import { useToast } from '../hooks/useToast';
import AuthCard from '../components/auth/AuthCard';

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      showToast('Token reset tidak valid', 'error');
      navigate('/login');
    }
  }, [token, showToast, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      showToast('Password dan konfirmasi tidak sama', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password minimal 6 karakter', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await authFetch(`/auth/reset/${token}`, {
        method: 'POST',
        body: JSON.stringify({ password })
      });
      showToast(data.message, 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      showToast(error.message, 'error');
      setIsLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Reset Password Baru">
      <form id="resetForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <input 
            type="password" 
            id="password" 
            className="form-input" 
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <label htmlFor="password" className="form-label">Password Baru</label>
        </div>
        <div className="form-group">
          <input 
            type="password" 
            id="passwordConfirm" 
            className="form-input" 
            placeholder=" "
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required 
          />
          <label htmlFor="passwordConfirm" className="form-label">Konfirmasi Password Baru</label>
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <div className="auth-links text-center">
        <Link to="/login" className="auth-link">Kembali ke Login</Link>
      </div>
    </AuthCard>
  );
}

export default ResetPasswordPage;