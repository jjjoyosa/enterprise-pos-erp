import React, { useMemo } from 'react';

type Role = 'CASHIER' | 'MANAGER' | 'ADMIN';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback = null }) => {
  const userRole = useMemo(() => {
    try {
      const token = localStorage.getItem('erp_token');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      
      console.log("JWT Payload:", payload);

      
      if (typeof payload.role === 'string') {
        return payload.role.toUpperCase() as Role;
      } 
      if (payload.role && typeof payload.role.name === 'string') {
        return payload.role.name.toUpperCase() as Role;
      }
      if (payload.roleName) {
        return payload.roleName.toUpperCase() as Role;
      }

      
      return null;
    } catch (error) {
      console.error('Failed to decode user role from token', error);
      return null;
    }
  }, []);

  if (!userRole) return <>{fallback}</>;

  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};