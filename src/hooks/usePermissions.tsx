import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FeaturePermissions } from '@/types/permissions';

/**
 * Hook para gerenciar permissões granulares baseadas em roles e contexto
 * Substitui o useUserRole para um sistema mais específico
 */
export const usePermissions = (): FeaturePermissions => {
  const { user, isSuperAdmin, isAdmin, isOfficeAdmin, office, officeUser } = useAuth();

  return useMemo(() => {
    // Se não há usuário, nenhuma permissão
    if (!user) {
      return createEmptyPermissions();
    }

    // Super Admin tem todas as permissões
    if (isSuperAdmin) {
      return createSuperAdminPermissions();
    }

    // Admin tem permissões administrativas limitadas
    if (isAdmin) {
      return createAdminPermissions();
    }

    // Office Admin tem permissões de escritório
    if (isOfficeAdmin) {
      return createOfficeAdminPermissions();
    }

    // Usuário comum tem permissões básicas
    return createUserPermissions();
  }, [user, isSuperAdmin, isAdmin, isOfficeAdmin, office, officeUser]);
};

/**
 * Cria permissões vazias (usuário não autenticado)
 */
function createEmptyPermissions(): FeaturePermissions {
  return {
    // Core Features
    canViewDashboard: false,
    canViewClients: false,
    canCreateClients: false,
    canEditClients: false,
    canDeleteClients: false,
    
    // Process Management
    canViewProcesses: false,
    canCreateProcesses: false,
    canEditProcesses: false,
    canDeleteProcesses: false,
    
    // Attendance/Service Management
    canViewAtendimentos: false,
    canCreateAtendimentos: false,
    canEditAtendimentos: false,
    canDeleteAtendimentos: false,
    
    // CRM Features
    canViewCRM: false,
    canManageCRM: false,
    
    // Calendar & Scheduling
    canViewAgenda: false,
    canManageAgenda: false,
    canViewAudiencias: false,
    canManageAudiencias: false,
    
    // Team Management
    canViewEquipe: false,
    canManageEquipe: false,
    
    // Tasks & Deadlines
    canViewTarefas: false,
    canManageTarefas: false,
    canViewPrazos: false,
    canManagePrazos: false,
    
    // Publications & Legal Research
    canViewPublicacoes: false,
    canManagePublicacoes: false,
    canViewConsultivo: false,
    canManageConsultivo: false,
    
    // Analytics & Reports
    canViewGraficos: false,
    canViewAdvancedAnalytics: false,
    
    // Financial
    canViewFinanceiro: false,
    canManageFinanceiro: false,
    
    // Goals & Targets
    canViewMetas: false,
    canManageMetas: false,
    
    // Tags & Organization
    canViewEtiquetas: false,
    canManageEtiquetas: false,
    
    // Notifications
    canViewNotificacoes: false,
    canManageNotificacoes: false,
    
    // Settings & Configuration
    canViewConfiguracoes: false,
    canManageConfiguracoes: false,
    canViewPerfil: false,
    canEditPerfil: false,
    
    // Office Management
    canViewOffice: false,
    canManageOffice: false,
    canInviteUsers: false,
    canManageOfficeUsers: false,
    canManageOfficeSettings: false,
    
    // System Administration
    canViewAdmin: false,
    canManageGlobalSettings: false,
    canManageAllOffices: false,
    canManageSubscriptions: false,
    canViewSystemMetrics: false,
    canManageSystemUsers: false,
  };
}

/**
 * Cria permissões para Super Admin (acesso total)
 */
function createSuperAdminPermissions(): FeaturePermissions {
  return {
    // Core Features
    canViewDashboard: true,
    canViewClients: true,
    canCreateClients: true,
    canEditClients: true,
    canDeleteClients: true,
    
    // Process Management
    canViewProcesses: true,
    canCreateProcesses: true,
    canEditProcesses: true,
    canDeleteProcesses: true,
    
    // Attendance/Service Management
    canViewAtendimentos: true,
    canCreateAtendimentos: true,
    canEditAtendimentos: true,
    canDeleteAtendimentos: true,
    
    // CRM Features
    canViewCRM: true,
    canManageCRM: true,
    
    // Calendar & Scheduling
    canViewAgenda: true,
    canManageAgenda: true,
    canViewAudiencias: true,
    canManageAudiencias: true,
    
    // Team Management
    canViewEquipe: true,
    canManageEquipe: true,
    
    // Tasks & Deadlines
    canViewTarefas: true,
    canManageTarefas: true,
    canViewPrazos: true,
    canManagePrazos: true,
    
    // Publications & Legal Research
    canViewPublicacoes: true,
    canManagePublicacoes: true,
    canViewConsultivo: true,
    canManageConsultivo: true,
    
    // Analytics & Reports
    canViewGraficos: true,
    canViewAdvancedAnalytics: true,
    
    // Financial
    canViewFinanceiro: true,
    canManageFinanceiro: true,
    
    // Goals & Targets
    canViewMetas: true,
    canManageMetas: true,
    
    // Tags & Organization
    canViewEtiquetas: true,
    canManageEtiquetas: true,
    
    // Notifications
    canViewNotificacoes: true,
    canManageNotificacoes: true,
    
    // Settings & Configuration
    canViewConfiguracoes: true,
    canManageConfiguracoes: true,
    canViewPerfil: true,
    canEditPerfil: true,
    
    // Office Management
    canViewOffice: true,
    canManageOffice: true,
    canInviteUsers: true,
    canManageOfficeUsers: true,
    canManageOfficeSettings: true,
    
    // System Administration
    canViewAdmin: true,
    canManageGlobalSettings: true,
    canManageAllOffices: true,
    canManageSubscriptions: true,
    canViewSystemMetrics: true,
    canManageSystemUsers: true,
  };
}

/**
 * Cria permissões para Admin (sem acesso a funcionalidades de super admin)
 */
function createAdminPermissions(): FeaturePermissions {
  return {
    // Core Features
    canViewDashboard: true,
    canViewClients: true,
    canCreateClients: true,
    canEditClients: true,
    canDeleteClients: true,
    
    // Process Management
    canViewProcesses: true,
    canCreateProcesses: true,
    canEditProcesses: true,
    canDeleteProcesses: true,
    
    // Attendance/Service Management
    canViewAtendimentos: true,
    canCreateAtendimentos: true,
    canEditAtendimentos: true,
    canDeleteAtendimentos: true,
    
    // CRM Features
    canViewCRM: true,
    canManageCRM: true,
    
    // Calendar & Scheduling
    canViewAgenda: true,
    canManageAgenda: true,
    canViewAudiencias: true,
    canManageAudiencias: true,
    
    // Team Management
    canViewEquipe: true,
    canManageEquipe: true,
    
    // Tasks & Deadlines
    canViewTarefas: true,
    canManageTarefas: true,
    canViewPrazos: true,
    canManagePrazos: true,
    
    // Publications & Legal Research
    canViewPublicacoes: true,
    canManagePublicacoes: true,
    canViewConsultivo: true,
    canManageConsultivo: true,
    
    // Analytics & Reports
    canViewGraficos: true,
    canViewAdvancedAnalytics: true,
    
    // Financial
    canViewFinanceiro: true,
    canManageFinanceiro: true,
    
    // Goals & Targets
    canViewMetas: true,
    canManageMetas: true,
    
    // Tags & Organization
    canViewEtiquetas: true,
    canManageEtiquetas: true,
    
    // Notifications
    canViewNotificacoes: true,
    canManageNotificacoes: true,
    
    // Settings & Configuration
    canViewConfiguracoes: true,
    canManageConfiguracoes: true,
    canViewPerfil: true,
    canEditPerfil: true,
    
    // Office Management
    canViewOffice: true,
    canManageOffice: true,
    canInviteUsers: true,
    canManageOfficeUsers: true,
    canManageOfficeSettings: true,
    
    // System Administration - Limitado para admin
    canViewAdmin: true,
    canManageGlobalSettings: false,
    canManageAllOffices: false,
    canManageSubscriptions: false,
    canViewSystemMetrics: false,
    canManageSystemUsers: false,
  };
}

/**
 * Cria permissões para Office Admin (gerenciamento de escritório)
 */
function createOfficeAdminPermissions(): FeaturePermissions {
  return {
    // Core Features
    canViewDashboard: true,
    canViewClients: true,
    canCreateClients: true,
    canEditClients: true,
    canDeleteClients: true,
    
    // Process Management
    canViewProcesses: true,
    canCreateProcesses: true,
    canEditProcesses: true,
    canDeleteProcesses: false, // Limitado para office admin
    
    // Attendance/Service Management
    canViewAtendimentos: true,
    canCreateAtendimentos: true,
    canEditAtendimentos: true,
    canDeleteAtendimentos: true,
    
    // CRM Features
    canViewCRM: true,
    canManageCRM: true,
    
    // Calendar & Scheduling
    canViewAgenda: true,
    canManageAgenda: true,
    canViewAudiencias: true,
    canManageAudiencias: true,
    
    // Team Management
    canViewEquipe: true,
    canManageEquipe: true,
    
    // Tasks & Deadlines
    canViewTarefas: true,
    canManageTarefas: true,
    canViewPrazos: true,
    canManagePrazos: true,
    
    // Publications & Legal Research
    canViewPublicacoes: true,
    canManagePublicacoes: true,
    canViewConsultivo: true,
    canManageConsultivo: true,
    
    // Analytics & Reports
    canViewGraficos: true,
    canViewAdvancedAnalytics: true,
    
    // Financial
    canViewFinanceiro: true,
    canManageFinanceiro: true,
    
    // Goals & Targets
    canViewMetas: true,
    canManageMetas: true,
    
    // Tags & Organization
    canViewEtiquetas: true,
    canManageEtiquetas: true,
    
    // Notifications
    canViewNotificacoes: true,
    canManageNotificacoes: true,
    
    // Settings & Configuration
    canViewConfiguracoes: true,
    canManageConfiguracoes: true,
    canViewPerfil: true,
    canEditPerfil: true,
    
    // Office Management
    canViewOffice: true,
    canManageOffice: true,
    canInviteUsers: true,
    canManageOfficeUsers: true,
    canManageOfficeSettings: true,
    
    // System Administration - Negado para office admin
    canViewAdmin: false,
    canManageGlobalSettings: false,
    canManageAllOffices: false,
    canManageSubscriptions: false,
    canViewSystemMetrics: false,
    canManageSystemUsers: false,
  };
}

/**
 * Cria permissões para usuário comum
 */
function createUserPermissions(): FeaturePermissions {
  return {
    // Core Features
    canViewDashboard: true,
    canViewClients: true,
    canCreateClients: true,
    canEditClients: true,
    canDeleteClients: false, // Usuário comum não pode excluir
    
    // Process Management
    canViewProcesses: true,
    canCreateProcesses: true,
    canEditProcesses: true,
    canDeleteProcesses: false, // Usuário comum não pode excluir
    
    // Attendance/Service Management
    canViewAtendimentos: true,
    canCreateAtendimentos: true,
    canEditAtendimentos: true,
    canDeleteAtendimentos: false, // Usuário comum não pode excluir
    
    // CRM Features
    canViewCRM: true,
    canManageCRM: false, // Apenas visualização
    
    // Calendar & Scheduling
    canViewAgenda: true,
    canManageAgenda: true,
    canViewAudiencias: true,
    canManageAudiencias: true,
    
    // Team Management
    canViewEquipe: true,
    canManageEquipe: false, // Apenas visualização
    
    // Tasks & Deadlines
    canViewTarefas: true,
    canManageTarefas: true,
    canViewPrazos: true,
    canManagePrazos: true,
    
    // Publications & Legal Research
    canViewPublicacoes: true,
    canManagePublicacoes: false, // Apenas visualização
    canViewConsultivo: true,
    canManageConsultivo: true,
    
    // Analytics & Reports
    canViewGraficos: true,
    canViewAdvancedAnalytics: false, // Limitado
    
    // Financial
    canViewFinanceiro: true,
    canManageFinanceiro: false, // Apenas visualização
    
    // Goals & Targets
    canViewMetas: true,
    canManageMetas: false, // Apenas visualização
    
    // Tags & Organization
    canViewEtiquetas: true,
    canManageEtiquetas: false, // Apenas visualização
    
    // Notifications
    canViewNotificacoes: true,
    canManageNotificacoes: false, // Apenas visualização
    
    // Settings & Configuration
    canViewConfiguracoes: true,
    canManageConfiguracoes: false, // Apenas visualização
    canViewPerfil: true,
    canEditPerfil: true,
    
    // Office Management - Negado para usuário comum
    canViewOffice: false,
    canManageOffice: false,
    canInviteUsers: false,
    canManageOfficeUsers: false,
    canManageOfficeSettings: false,
    
    // System Administration - Negado para usuário comum
    canViewAdmin: false,
    canManageGlobalSettings: false,
    canManageAllOffices: false,
    canManageSubscriptions: false,
    canViewSystemMetrics: false,
    canManageSystemUsers: false,
  };
}