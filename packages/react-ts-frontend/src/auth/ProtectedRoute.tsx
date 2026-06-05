import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserProfile } from './useUserProfile';
import {
  getDefaultPathForProfile,
  profileHasAllowedRole,
  type RegistryRole,
} from './userProfile';

type ProtectedRouteProps = {
  allowedRoles?: readonly RegistryRole[];
  children: ReactNode;
};

export function ProtectedRoute({ allowedRoles = [], children }: ProtectedRouteProps) {
  const { error, loading, profile, user } = useUserProfile({
    enabled: allowedRoles.length > 0,
  });
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (
    allowedRoles.length > 0 &&
    !profileHasAllowedRole(profile, allowedRoles)
  ) {
    return <Navigate to={getDefaultPathForProfile(profile)} replace />;
  }

  return <>{children}</>;
}
