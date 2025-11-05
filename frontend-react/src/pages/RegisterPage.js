// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import AuthCard from '../components/auth/AuthCard';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, token } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast('Password minimal 6 karakter', 'error');
      return;
    }
    setIsLoading(true);
    await register(name, email, password);
    setIsLoading(false);
  };

  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <AuthCard subtitle="Buat akun baru">
      <form id="registerForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Nama Lengkap</label>
          <input 
            type="text" 
            id="name" 
            className="form-input" 
            placeholder="Masukkan nama lengkap" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>
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
            placeholder="Minimal 6 karakter" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Mendaftarkan...' : 'Daftar'}
        </button>
      </form>
      <div className="auth-links text-center">
        <span>Sudah punya akun? <Link to="/login" className="auth-link">Login di sini</Link></span>
      </div>
    </AuthCard>
  );
}

export default RegisterPage;