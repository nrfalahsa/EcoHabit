import React, { createContext, useState, useEffect } from 'react';
import { authFetch, saveToken, saveUser, clearAuthStorage, getToken, getUser } from '../services/api';
import { useToast } from '../hooks/useToast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [theme, setTheme] = useState('light');

  const { showToast } = useToast();

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    const storedTheme = localStorage.getItem('ecohabit_theme') || 'light';
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    
    setTheme(storedTheme);
    document.body.setAttribute('data-theme', storedTheme);
    
    setIsLoading(false);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('ecohabit_theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

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

  const updateUserState = (userData) => {
    const newUser = { ...user, ...userData };
    setUser(newUser);
    saveUser(newUser);
  };

  const value = {
    user,
    token,
    isLoading,
    theme,
    toggleTheme,
    updateUserState,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;