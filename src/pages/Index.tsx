
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { PriorityTasks } from "@/components/Dashboard/PriorityTasks";
import { DeadlinesCard } from "@/components/Dashboard/DeadlinesCard";
import { HearingsCard } from "@/components/Dashboard/HearingsCard";
import { ScoreCard } from "@/components/Gamification/ScoreCard";
import { CalendarWidget } from "@/components/Dashboard/CalendarWidget";

import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const isMobile = useIsMobile();
  const { isFirstLogin } = useAuth();

  return (
    <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Início</h1>
        <p className="text-xs md:text-sm lg:text-base text-muted-foreground">
          Bem-vindo ao seu assistente jurídico inteligente.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Layout responsivo - Mobile: Stack vertical, Desktop: Grid otimizado */}
      {isMobile ? (
        /* Layout Mobile - Tudo empilhado verticalmente */
        <div className="space-y-4">
          <RecentActivity />
          <CalendarWidget />
          <HearingsCard />
          <PriorityTasks />
          <DeadlinesCard />
          <ScoreCard
            userName="Usuário"
            totalScore={0}
            monthlyScore={0}
            weeklyScore={0}
            rank={0}
            completedTasks={0}
            totalTasks={0}
          />
        </div>
      ) : (
        /* Layout Desktop - Grid otimizado com altura uniforme */
        <div className="grid gap-6">
          {/* Primeira linha - Agenda ao lado de Audiências, Prioridades e Prazos */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
            <div className="h-full">
              <CalendarWidget />
            </div>
            <div className="h-full">
              <HearingsCard />
            </div>
            <div className="h-full">
              <PriorityTasks />
            </div>
            <div className="h-full">
              <DeadlinesCard />
            </div>
          </div>

          {/* Segunda linha - Atividades Recentes ao lado de Produtividade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
            <div className="h-full">
              <RecentActivity />
            </div>
            <div className="h-full flex items-center justify-center">
              <div className="w-full max-w-md h-full">
                <ScoreCard
                  userName="Usuário"
                  totalScore={0}
                  monthlyScore={0}
                  weeklyScore={0}
                  rank={0}
                  completedTasks={0}
                  totalTasks={0}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
