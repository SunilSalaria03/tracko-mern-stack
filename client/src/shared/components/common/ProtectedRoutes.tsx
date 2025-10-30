import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { ProtectedRouteProps } from '../../../utils/interfaces/commonInterface';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredRole,
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth);
    if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

   if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

   if (requiredRole !== undefined) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;

    if (!hasRequiredRole) {
       return <Navigate to="/welcome" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
