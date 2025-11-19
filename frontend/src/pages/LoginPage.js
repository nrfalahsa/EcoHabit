import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthCard from '../components/auth/AuthCard';

const Spinner = () => <div className="spinner"></div>;

const emailRegex = /\S+@\S+\.\S+/;

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  
  const { login, token } = useAuth();

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
 
    if (!validateEmail()) {
      return; 
    }
    
    setIsLoading(true);
    await login(email, password); 
    setIsLoading(false);
  };

  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <AuthCard subtitle="Login ke akun Anda">
      <form id="loginForm" onSubmit={handleSubmit}>
        
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

        <div className="form-group">
          <input 
            type={showPassword ? 'text' : 'password'} 
            id="password" 
            className="form-input input-password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <label htmlFor="password" className="form-label">Password</label>
          <button 
            type="button" 
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? <Spinner /> : 'Login'}
        </button>
      </form>
      
      <div className="auth-links split">
        <Link to="/forgot" className="auth-link">Lupa Password?</Link>
        <span>Belum punya akun? <Link to="/register" className="auth-link">Daftar di sini</Link></span>
      </div>
    </AuthCard>
  );
}

export default LoginPage;