import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoutes = () => {
  const { currentUser, loading } = useAuth();
  
  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render child routes
  return <Outlet />;
};

export default ProtectedRoutes;
