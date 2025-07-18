import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Play, Pause, Square, Timer, Plus } from "lucide-react";
import { useTimesheet, TIMESHEET_CATEGORIAS, type TimesheetCategoria } from "@/hooks/useTimesheet";

export default function Timesheet() {
  // Tentar usar hook real, com fallback para funcionalidade local
  const { 
    data: timesheets = [], 
    loading = false, 
    activeTimer, 
    startTimer,
    stopTimer,
    getTodayStats,
    getWeekStats
  } = useTimesheet();

  const [isNewTimerDialogOpen, setIsNewTimerDialogOpen] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [formData, setFormData] = useState({
    descricao: "",
    categoria: "" as TimesheetCategoria | ""
  });

  // Usar timer ativo do hook ou local como fallback
  const timerAtivo = activeTimer || (isTimerActive ? { tarefa_descricao: formData.descricao } : null);

  // Calcular tempo decorrido (hook real ou local)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTimer && activeTimer.status === 'ativo') {
      // Timer real do banco
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.data_inicio);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else if (isTimerActive) {
      // Timer local como fallback
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeTimer, isTimerActive]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async () => {
    if (!formData.descricao || !formData.categoria) return;
    
    try {
      // Tentar usar hook real
      if (startTimer && formData.categoria !== "") {
        const result = await startTimer(
          formData.descricao,
          formData.categoria as TimesheetCategoria
        );
        
        if (result) {
          console.log('Timer iniciado via Supabase:', result.id);
          setFormData({ descricao: "", categoria: "" });
          setIsNewTimerDialogOpen(false);
          return;
        }
      }
    } catch (error) {
      console.warn('Erro ao usar Supabase, usando fallback local:', error);
    }

    // Fallback: usar timer local
    setIsTimerActive(true);
    setElapsedTime(0);
    setIsNewTimerDialogOpen(false);
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    (window as any).timerInterval = interval;
  };

  const handleStopTimer = async () => {
    try {
      // Tentar usar hook real
      if (activeTimer && stopTimer) {
        const result = await stopTimer(activeTimer.id);
        if (result) {
          console.log('Timer parado via Supabase');
          return;
        }
      }
    } catch (error) {
      console.warn('Erro ao usar Supabase, usando fallback local:', error);
    }

    // Fallback: parar timer local
    setIsTimerActive(false);
    setElapsedTime(0);
    if ((window as any).timerInterval) {
      clearInterval((window as any).timerInterval);
    }
  };

  // Estatísticas reais ou fallback
  const todayStats = getTodayStats ? getTodayStats() : { totalMinutos: 0, totalRegistros: 0 };
  const weekStats = getWeekStats ? getWeekStats() : { totalMinutos: 0, totalRegistros: 0 };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando timesheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 md:h-8 md:w-8" />
            Timesheet
          </h1>
          <p className="text-muted-foreground">
            Controle e acompanhe o tempo gasto em suas atividades jurídicas
          </p>
        </div>
        
        <Dialog open={isNewTimerDialogOpen} onOpenChange={setIsNewTimerDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={!!timerAtivo}>
              <Plus className="h-4 w-4" />
              Novo Timer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Iniciar Novo Timer</DialogTitle>
              <DialogDescription>
                Descreva a atividade que você vai realizar e selecione a categoria
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tarefa">Descrição da Tarefa *</Label>
                <Input
                  id="tarefa"
                  placeholder="Ex: Elaboração de petição inicial..."
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMESHEET_CATEGORIAS.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleStartTimer} disabled={!formData.descricao || !formData.categoria}>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Timer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timer Ativo */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Timer Ativo {activeTimer ? '(Supabase)' : isTimerActive ? '(Local)' : ''}
          </CardTitle>
          <CardDescription>
            {timerAtivo ? "Timer em execução" : "Nenhum timer ativo no momento"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {timerAtivo ? (
            <>
              <div className="text-center">
                <div className="text-4xl md:text-6xl font-mono font-bold text-primary">
                  {formatTime(elapsedTime)}
                </div>
                <p className="text-sm font-medium mt-2">
                  {activeTimer?.tarefa_descricao || formData.descricao}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button 
                  variant="destructive" 
                  onClick={handleStopTimer}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Finalizar
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Nenhum timer ativo</p>
              <Button onClick={() => setIsNewTimerDialogOpen(true)} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Iniciar Novo Timer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(todayStats.totalMinutos)}</div>
            <p className="text-xs text-muted-foreground">{todayStats.totalRegistros} registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(weekStats.totalMinutos)}</div>
            <p className="text-xs text-muted-foreground">{weekStats.totalRegistros} registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weekStats.totalRegistros > 0 ? formatMinutes(Math.round(weekStats.totalMinutos / 7)) : "0m"}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
          <CardDescription>
            Últimos 7 dias de atividades registradas ({timesheets.length} encontrados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timesheets.length > 0 ? (
            <div className="space-y-4">
              {timesheets.map((timesheet) => (
                <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{timesheet.tarefa_descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Categoria: {timesheet.categoria} | Status: {timesheet.status}
                    </p>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <p className="font-mono font-bold">
                      {timesheet.duracao_minutos ? formatMinutes(timesheet.duracao_minutos) : 'Em andamento'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(timesheet.data_inicio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro encontrado</p>
              <p className="text-sm">Inicie o timer para começar a registrar suas atividades</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 