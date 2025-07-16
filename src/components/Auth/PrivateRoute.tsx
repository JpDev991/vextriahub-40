import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireRole?: 'user' | 'admin' | 'super_admin';
  requirePermission?: 
    | 'canViewAdminFeatures'
    | 'canManageOffice'
    | 'canManageUsers'
    | 'canManageSubscriptions'
    | 'canInviteUsers'
    | 'canViewAllOffices'
    | 'canCreateOffices';
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireRole,
  requirePermission 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const permissions = useUserRole();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  // Timeout para evitar carregamento infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000); // 5 segundos

    return () => clearTimeout(timer);
  }, []);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading && !showTimeout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // Se demorou muito para carregar, redirecionar para login
  if (showTimeout && isLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar role específico
  if (requireRole && user?.role !== requireRole && user?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Acesso Negado</h2>
          <p className="text-muted-foreground mt-2">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Role necessário: {requireRole}
          </p>
        </div>
      </div>
    );
  }

  // Verificar permissão específica
  if (requirePermission && !permissions[requirePermission]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Acesso Negado</h2>
          <p className="text-muted-foreground mt-2">
            Você não tem permissão para acessar esta funcionalidade.
          </p>
        </div>
      </div>
    );
  }

  // Se estiver autenticado e autorizado, renderizar o componente filho
  return <>{children}</>;
};