import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../UI/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

 
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
