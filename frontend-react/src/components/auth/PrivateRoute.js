// src/components/auth/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function PrivateRoute({ children }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Atau tampilkan spinner
  }

  return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;