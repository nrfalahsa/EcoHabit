// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthCard from '../components/auth/AuthCard';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  // Jika sudah login, redirect ke dashboard
  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <AuthCard subtitle="Login ke akun Anda">
      <form id="loginForm" onSubmit={handleSubmit}>
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
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input 
            type="password" 
            id="password" 
            className="form-input" 
            placeholder="Masukkan password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
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