import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type PlanType = 'free' | 'basic' | 'professional' | 'enterprise';

interface PlanFeatures {
  // Limites quantitativos
  maxProcesses: number;
  maxClients: number;
  maxUsers: number;
  maxTasks: number;
  maxDeadlines: number;
  
  // Funcionalidades
  hasFinancialModule: boolean;
  hasGoalsModule: boolean;
  hasAdvancedReports: boolean;
  hasTeamManagement: boolean;
  hasCustomFields: boolean;
  hasAutomation: boolean;
  hasIntegrations: boolean;
  hasAdvancedSearch: boolean;
  hasBackup: boolean;
  hasPrioritySport: boolean;
  hasWhiteLabel: boolean;
  hasApiAccess: boolean;
  
  // Notificações
  hasEmailNotifications: boolean;
  hasSmsNotifications: boolean;
  hasWhatsappNotifications: boolean;
  
  // Armazenamento
  storageLimit: number; // em GB
  hasCloudStorage: boolean;
  
  // Suporte
  supportLevel: 'basic' | 'standard' | 'premium' | 'enterprise';
  
  // Recursos visuais
  canCustomizeTheme: boolean;
  canUploadLogo: boolean;
}

const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    maxProcesses: 10,
    maxClients: 25,
    maxUsers: 1,
    maxTasks: 50,
    maxDeadlines: 20,
    hasFinancialModule: false,
    hasGoalsModule: false,
    hasAdvancedReports: false,
    hasTeamManagement: false,
    hasCustomFields: false,
    hasAutomation: false,
    hasIntegrations: false,
    hasAdvancedSearch: false,
    hasBackup: false,
    hasPrioritySport: false,
    hasWhiteLabel: false,
    hasApiAccess: false,
    hasEmailNotifications: true,
    hasSmsNotifications: false,
    hasWhatsappNotifications: false,
    storageLimit: 1,
    hasCloudStorage: false,
    supportLevel: 'basic',
    canCustomizeTheme: false,
    canUploadLogo: false,
  },
  basic: {
    maxProcesses: 50,
    maxClients: 100,
    maxUsers: 3,
    maxTasks: 200,
    maxDeadlines: 100,
    hasFinancialModule: true,
    hasGoalsModule: true,
    hasAdvancedReports: false,
    hasTeamManagement: true,
    hasCustomFields: true,
    hasAutomation: false,
    hasIntegrations: false,
    hasAdvancedSearch: true,
    hasBackup: true,
    hasPrioritySport: false,
    hasWhiteLabel: false,
    hasApiAccess: false,
    hasEmailNotifications: true,
    hasSmsNotifications: true,
    hasWhatsappNotifications: false,
    storageLimit: 5,
    hasCloudStorage: true,
    supportLevel: 'standard',
    canCustomizeTheme: true,
    canUploadLogo: true,
  },
  professional: {
    maxProcesses: 200,
    maxClients: 500,
    maxUsers: 10,
    maxTasks: 1000,
    maxDeadlines: 500,
    hasFinancialModule: true,
    hasGoalsModule: true,
    hasAdvancedReports: true,
    hasTeamManagement: true,
    hasCustomFields: true,
    hasAutomation: true,
    hasIntegrations: true,
    hasAdvancedSearch: true,
    hasBackup: true,
    hasPrioritySport: true,
    hasWhiteLabel: false,
    hasApiAccess: true,
    hasEmailNotifications: true,
    hasSmsNotifications: true,
    hasWhatsappNotifications: true,
    storageLimit: 25,
    hasCloudStorage: true,
    supportLevel: 'premium',
    canCustomizeTheme: true,
    canUploadLogo: true,
  },
  enterprise: {
    maxProcesses: -1, // Ilimitado
    maxClients: -1,
    maxUsers: -1,
    maxTasks: -1,
    maxDeadlines: -1,
    hasFinancialModule: true,
    hasGoalsModule: true,
    hasAdvancedReports: true,
    hasTeamManagement: true,
    hasCustomFields: true,
    hasAutomation: true,
    hasIntegrations: true,
    hasAdvancedSearch: true,
    hasBackup: true,
    hasPrioritySport: true,
    hasWhiteLabel: true,
    hasApiAccess: true,
    hasEmailNotifications: true,
    hasSmsNotifications: true,
    hasWhatsappNotifications: true,
    storageLimit: -1, // Ilimitado
    hasCloudStorage: true,
    supportLevel: 'enterprise',
    canCustomizeTheme: true,
    canUploadLogo: true,
  },
};

export const usePlanFeatures = () => {
  const { office, isSuperAdmin } = useAuth();
  
  return useMemo(() => {
    // Super admin tem acesso completo
    if (isSuperAdmin) {
      return PLAN_FEATURES.enterprise;
    }
    
    // Usar o plano do escritório ou free como padrão
    const plan = office?.plan || 'free';
    return PLAN_FEATURES[plan as PlanType];
  }, [office?.plan, isSuperAdmin]);
};

export const usePlanLimits = () => {
  const features = usePlanFeatures();
  const { office } = useAuth();
  
  return useMemo(() => {
    const isLimitReached = (current: number, max: number) => {
      if (max === -1) return false; // Ilimitado
      return current >= max;
    };
    
    const getUsagePercentage = (current: number, max: number) => {
      if (max === -1) return 0; // Ilimitado
      return Math.min((current / max) * 100, 100);
    };
    
    return {
      isLimitReached,
      getUsagePercentage,
      features,
      currentPlan: office?.plan || 'free',
    };
  }, [features, office?.plan]);
};

export const PLAN_NAMES: Record<PlanType, string> = {
  free: 'Gratuito',
  basic: 'Básico',
  professional: 'Profissional',
  enterprise: 'Empresarial',
};

export const PLAN_PRICES: Record<PlanType, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  basic: { monthly: 49.90, yearly: 499.90 },
  professional: { monthly: 99.90, yearly: 999.90 },
  enterprise: { monthly: 199.90, yearly: 1999.90 },
};