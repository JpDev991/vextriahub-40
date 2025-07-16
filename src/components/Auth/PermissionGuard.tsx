import React from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: 
    | 'canViewAdminFeatures'
    | 'canManageOffice'
    | 'canManageUsers'
    | 'canManageSubscriptions'
    | 'canInviteUsers'
    | 'canViewAllOffices'
    | 'canCreateOffices';
  fallback?: React.ReactNode;
  showError?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback,
  showError = true
}) => {
  const permissions = useUserRole();

  const hasPermission = permissions[permission];

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showError) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar esta funcionalidade.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

// Hook para usar dentro de componentes
export const usePermission = (permission: PermissionGuardProps['permission']) => {
  const permissions = useUserRole();
  return permissions[permission];
};