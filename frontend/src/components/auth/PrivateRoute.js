import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function PrivateRoute({ children }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;