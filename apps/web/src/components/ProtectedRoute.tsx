import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleType, PermissionKey } from '@al-husseiniya/types';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: RoleType[];
  requiredPermissions?: PermissionKey[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermissions,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#64748b' }}>Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && !hasRole(...requiredRoles)) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Your current account role does not have authorization to view this section.
        </p>
      </div>
    );
  }

  if (requiredPermissions && !hasPermission(...requiredPermissions)) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Access Restricted</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Missing required operational permission to view this section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
