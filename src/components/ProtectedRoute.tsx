import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectPath = '/login'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    // Or render a loading spinner
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
     // User is authenticated but doesn't have permission
     return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
