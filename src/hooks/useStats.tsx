import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Stats {
  processosAtivos: number;
  clientes: number;
  tarefasPendentes: number;
  tarefasConcluidas: number;
  audienciasProximas: number;
  prazosVencendo: number;
  receitaMensal: number;
  despesaMensal: number;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    processosAtivos: 0,
    clientes: 0,
    tarefasPendentes: 0,
    tarefasConcluidas: 0,
    audienciasProximas: 0,
    prazosVencendo: 0,
    receitaMensal: 0,
    despesaMensal: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Buscar estatísticas em paralelo
      const [
        processosResult,
        clientesResult,
        tarefasResult,
        audienciasResult,
        prazosResult,
        financeiroResult
      ] = await Promise.all([
        // Processos ativos
        supabase
          .from('processos')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('deletado', false)
          .neq('status', 'encerrado'),

        // Total de clientes
        supabase
          .from('clientes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('deletado', false),

        // Tarefas
        supabase
          .from('tarefas')
          .select('concluida', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('deletado', false),

        // Audiências próximas (próximos 7 dias)
        supabase
          .from('audiencias')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('deletado', false)
          .gte('data_audiencia', new Date().toISOString())
          .lte('data_audiencia', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),

        // Prazos vencendo (próximos 3 dias)
        supabase
          .from('prazos')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('deletado', false)
          .eq('status', 'pendente')
          .lte('data_vencimento', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

        // Financeiro do mês atual
        supabase
          .from('financeiro')
          .select('tipo, valor')
          .eq('user_id', user.id)
          .eq('deletado', false)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      // Processar tarefas
      const tarefasPendentes = tarefasResult.data?.filter(t => !t.concluida).length || 0;
      const tarefasConcluidas = tarefasResult.data?.filter(t => t.concluida).length || 0;

      // Processar financeiro
      const receitas = financeiroResult.data?.filter(f => f.tipo === 'receita') || [];
      const despesas = financeiroResult.data?.filter(f => f.tipo === 'despesa') || [];
      const receitaMensal = receitas.reduce((sum, r) => sum + (Number(r.valor) || 0), 0);
      const despesaMensal = despesas.reduce((sum, d) => sum + (Number(d.valor) || 0), 0);

      setStats({
        processosAtivos: processosResult.count || 0,
        clientes: clientesResult.count || 0,
        tarefasPendentes,
        tarefasConcluidas,
        audienciasProximas: audienciasResult.count || 0,
        prazosVencendo: prazosResult.count || 0,
        receitaMensal,
        despesaMensal,
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    refresh: fetchStats,
    isEmpty: Object.values(stats).every(val => val === 0),
  };
}