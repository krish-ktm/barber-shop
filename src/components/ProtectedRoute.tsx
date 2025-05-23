import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'billing';
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
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Redirect billing users to POS page
    if (userRole === 'billing') {
      return <Navigate to="/billing/pos" replace />;
    }
    // Redirect staff to staff dashboard
    if (userRole === 'staff') {
      return <Navigate to="/staff/dashboard" replace />;
    }
  }

  return <>{children}</>;
};