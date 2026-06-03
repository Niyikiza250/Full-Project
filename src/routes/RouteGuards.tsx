import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES, UserRole, canAccess } from '@/constants/routes';

export const AdminRoute: React.FC = () => {
  const { user } = useAuthStore();

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export const RoleBasedRoute: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export const HigherAccessRoute: React.FC<{ minRole: UserRole }> = ({ minRole }) => {
  const { user } = useAuthStore();

  if (!user || !canAccess(user.role, minRole)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Force user to change password if temporaryPasswordStatus is active
  if (user?.temporaryPasswordStatus && location.pathname !== ROUTES.FORCE_PASSWORD_CHANGE) {
    return <Navigate to={ROUTES.FORCE_PASSWORD_CHANGE} replace />;
  }

  // Prevent users from going to password change page if they don't need it
  if (!user?.temporaryPasswordStatus && location.pathname === ROUTES.FORCE_PASSWORD_CHANGE) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};
