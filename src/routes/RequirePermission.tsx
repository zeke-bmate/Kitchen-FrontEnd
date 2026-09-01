// src/components/RequirePermission.tsx

import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import useAuth from "../context/useAuth";

type RequirePermissionProps = {
  permission: string;
  children: ReactNode;
};

function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user?.permissions.includes(permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequirePermission;