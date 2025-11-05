// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { authFetch, saveToken, saveUser, clearAuthStorage, getToken, getUser } from '../services/api';
import { useToast } from '../hooks/useToast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Cek local storage saat pertama kali load
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      setToken(data.token);
      saveToken(data.token);
      saveUser(data.user);
      showToast('Login berhasil!', 'success');
      return true;
    } catch (error) {
      showToast(error.message, 'error');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setUser(data.user);
      setToken(data.token);
      saveToken(data.token);
      saveUser(data.user);
      showToast('Registrasi berhasil!', 'success');
      return true;
    } catch (error) {
      showToast(error.message, 'error');
      return false;
    }
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;