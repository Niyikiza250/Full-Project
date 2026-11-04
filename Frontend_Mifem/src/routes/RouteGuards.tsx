import React, { Component, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES, UserRole, canAccess } from '@/constants/routes';

class AdminErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AdminErrorBoundary]', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      const errMsg = this.state.error?.message;
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 dark:text-red-400 text-xl font-bold">!</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              An unexpected error occurred while loading this page. Please try refreshing.
            </p>
            {errMsg && (
              <p className="text-xs font-mono text-red-500 dark:text-red-400 mb-4 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg break-all">
                {errMsg}
              </p>
            )}
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-5 py-2 bg-sda-blue text-white rounded-xl text-sm font-bold hover:bg-sda-blue-dark cursor-pointer"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AdminRoute: React.FC = () => {
  const { user } = useAuthStore();

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'FIELD_ADMINISTRATOR') {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return (
    <AdminErrorBoundary>
      <Outlet />
    </AdminErrorBoundary>
  );
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
