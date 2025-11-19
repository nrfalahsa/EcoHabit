import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// CSS Global
import './assets/global.css';
import './assets/auth.css';
import './assets/dashboard.css';
import './assets/header.css';

// Komponen & Halaman
import PrivateRoute from './components/auth/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rute Publik */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot" element={<ForgotPasswordPage />} />
            <Route path="/reset" element={<ResetPasswordPage />} />

            {/* Rute Privat */}
            <Route 
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            {/* Redirect default ke dashboard jika login, atau login jika tidak */}
            <Route 
              path="*"
              element={
                <Navigate to={localStorage.getItem('ecohabit_token') ? "/dashboard" : "/login"} />
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;