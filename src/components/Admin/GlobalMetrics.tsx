import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOfficeManagement } from '@/hooks/useOfficeManagement';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Building2, Users, CreditCard, TrendingUp, Activity, DollarSign } from 'lucide-react';

export const GlobalMetrics: React.FC = () => {
  const { offices, loading: officesLoading } = useOfficeManagement();
  const { subscriptions, loading: subscriptionsLoading } = useSubscriptions();

  const loading = officesLoading || subscriptionsLoading;

  // Métricas calculadas
  const totalOffices = offices.length;
  const activeOffices = offices.filter(office => office.active).length;
  const totalUsers = offices.reduce((sum, office) => sum + ((office as any).users?.length || 0), 0);
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const monthlyRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + (sub.price || 0), 0);

  // Métricas de crescimento (mockadas por enquanto)
  const officeGrowth = 12.5;
  const userGrowth = 8.3;
  const revenueGrowth = 15.7;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escritórios Totais</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOffices}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {activeOffices} ativos
              </Badge>
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{officeGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Em {activeOffices} escritórios</span>
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{userGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" 
                className={activeSubscriptions > 0 ? "text-green-600 border-green-200" : "text-amber-600 border-amber-200"}>
                {((activeSubscriptions / totalOffices) * 100).toFixed(1)}% conversão
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>ARR: R$ {(monthlyRevenue * 12).toLocaleString('pt-BR')}</span>
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +{revenueGrowth}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Usuários</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOffices > 0 ? (totalUsers / totalOffices).toFixed(1) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              por escritório
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ativação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOffices > 0 ? ((activeOffices / totalOffices) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              escritórios ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Planos */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Planos</CardTitle>
          <CardDescription>
            Visão geral da distribuição de planos entre os escritórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {['free', 'basic', 'professional', 'enterprise'].map((plan) => {
              const planCount = offices.filter(office => office.plan === plan).length;
              const planRevenue = subscriptions
                .filter(sub => sub.plan === plan && sub.status === 'active')
                .reduce((sum, sub) => sum + (sub.price || 0), 0);
              
              return (
                <div key={plan} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{planCount}</div>
                  <p className="text-sm font-medium capitalize">{plan}</p>
                  <p className="text-xs text-muted-foreground">
                    R$ {planRevenue.toLocaleString('pt-BR')}/mês
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas atividades no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Atividades mockadas */}
            {[
              { type: 'office_created', message: 'Novo escritório "Silva & Associados" criado', time: '2 horas atrás' },
              { type: 'subscription_activated', message: 'Assinatura Professional ativada para "Costa Advogados"', time: '4 horas atrás' },
              { type: 'user_invited', message: '3 novos usuários convidados para "Ferreira Legal"', time: '6 horas atrás' },
              { type: 'office_upgraded', message: 'Escritório "Santos Law" migrou para plano Enterprise', time: '1 dia atrás' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};