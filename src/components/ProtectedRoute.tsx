import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and user has a different role
  if (requiredRole && userRole !== requiredRole) {
    // Redirect admins to admin dashboard
    if (userRole === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    // Redirect staff to staff dashboard
    if (userRole === 'staff') {
      return <Navigate to="/staff/dashboard" replace />;
    }
  }

  return <>{children}</>;
};