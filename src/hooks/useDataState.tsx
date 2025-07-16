import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para gerenciar estado de dados baseado no isFirstLogin
 * Garante que usuários novos sempre vejam dados vazios até escolherem ver exemplos
 * Preserva dados reais uma vez que são criados
 */
export function useDataState<T>(mockData: T[]) {
  const { isFirstLogin, resetFirstLogin, user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const hasRealData = useRef(false);
  const isInitialized = useRef(false);
  
  // Gera uma chave única para o localStorage baseada no tipo de dados e usuário
  const getStorageKey = () => {
    // Usa uma identificação mais robusta baseada na estrutura dos dados mockados
    let dataType = 'data';
    if (mockData.length > 0) {
      const firstItem = mockData[0] as any;
      if (firstItem.titulo && firstItem.cliente && firstItem.status) {
        dataType = 'processos';
      } else if (firstItem.nome && firstItem.email) {
        dataType = 'clientes';
      } else if (firstItem.data && firstItem.tipo) {
        dataType = 'atendimentos';
      }
    }
    return `vextria_${dataType}_${user?.id || 'anonymous'}`;
  };

  // Carrega dados do localStorage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsedData = JSON.parse(stored);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          hasRealData.current = true;
          return parsedData;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar dados do localStorage:', error);
    }
    return null;
  };

  // Salva dados no localStorage
  const saveToStorage = (dataToSave: T[]) => {
    try {
      if (dataToSave.length > 0 && JSON.stringify(dataToSave) !== JSON.stringify(mockData)) {
        localStorage.setItem(getStorageKey(), JSON.stringify(dataToSave));
      }
    } catch (error) {
      console.warn('Erro ao salvar dados no localStorage:', error);
    }
  };

  useEffect(() => {
    // Só inicializa uma vez quando o componente monta
    if (!isInitialized.current && user) {
      const storedData = loadFromStorage();
      
      if (storedData && storedData.length > 0) {
        // Se há dados salvos, usa eles
        setData(storedData);
        hasRealData.current = true;
        // Se o usuário tem dados reais mas ainda está marcado como firstLogin, corrige isso
        if (isFirstLogin) {
          resetFirstLogin();
        }
      } else {
        // Para demonstração: sempre mostra dados mockados se disponíveis
        // Para novos usuários (isFirstLogin = true), mostra lista vazia apenas se não houver mockData
        const shouldShowMockData = mockData.length > 0;
        const initialData = (isFirstLogin && !shouldShowMockData) ? [] : mockData;
        setData(initialData);
      }
      
      isInitialized.current = true;
    }
  }, [isFirstLogin, mockData, user]);

  const updateData = (newData: T[]) => {
    setData(newData);
    
    // Se dados reais foram adicionados (não vazios e diferentes dos mockados)
    if (newData.length > 0 && JSON.stringify(newData) !== JSON.stringify(mockData)) {
      hasRealData.current = true;
      saveToStorage(newData);
      
      // Reset isFirstLogin quando dados reais são criados
      if (isFirstLogin) {
        resetFirstLogin();
      }
    } else if (newData.length === 0) {
      // Se os dados foram limpos, remove do localStorage
      try {
        localStorage.removeItem(getStorageKey());
      } catch (error) {
        console.warn('Erro ao remover dados do localStorage:', error);
      }
      hasRealData.current = false;
    }
  };

  const loadSampleData = () => {
    setData(mockData);
    // Dados de exemplo não contam como dados reais
    hasRealData.current = false;
    // Remove dados reais do localStorage quando carrega exemplos
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.warn('Erro ao remover dados do localStorage:', error);
    }
  };

  const clearData = () => {
    setData([]);
    hasRealData.current = false;
    // Remove dados do localStorage
    try {
      localStorage.removeItem(getStorageKey());
    } catch (error) {
      console.warn('Erro ao remover dados do localStorage:', error);
    }
  };

  return {
    data,
    isNewUser: isFirstLogin && !hasRealData.current,
    loadSampleData,
    clearData,
    updateData
  };
}