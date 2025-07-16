
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NovoProcessoDialog } from "@/components/Processos/NovoProcessoDialog";
import { ProcessoDetalhes } from "@/components/Processos/ProcessoDetalhes";
import { FileText, Calendar, User, Filter, X, ArrowLeft, Edit, Trash2, Archive, ArchiveRestore, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface para dados do Supabase
interface ProcessoDB {
  id: string;
  user_id: string;
  cliente_id: string;
  numero_processo: string;
  titulo: string;
  status: string;
  tipo_processo: string;
  tribunal?: string;
  comarca?: string;
  sistema_tribunal?: string;
  vara?: string;
  valor_causa: number;
  data_inicio: string;
  data_ultima_atualizacao: string;
  proximo_prazo: string;
  etiquetas: string[];
  observacoes: string;
  deletado: boolean;
  arquivado?: boolean;
  data_arquivamento?: string;
  motivo_arquivamento?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface local para compatibilidade com componentes existentes
interface ProcessoLocal {
  id: string;
  titulo: string;
  cliente: string;
  clienteId: string;
  status: string;
  ultimaAtualizacao: string;
  proximoPrazo: string;
  etiquetas?: string[];
  arquivado?: boolean;
  dataArquivamento?: string;
  motivoArquivamento?: string;
  descricao?: string;
  tipoProcesso?: string;
  valorCausa?: string;
}

// Etiquetas padrão disponíveis
const etiquetasDisponiveis = [
  { value: "urgente", label: "Urgente", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "recurso", label: "Recurso", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "acordao", label: "Acórdão", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "pericia", label: "Perícia", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "audiencia", label: "Audiência", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "sentenca", label: "Sentença", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "execucao", label: "Execução", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "cautelar", label: "Cautelar", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "trabalhista", label: "Trabalhista", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "civel", label: "Cível", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { value: "criminal", label: "Criminal", color: "bg-slate-100 text-slate-800 border-slate-200" },
  { value: "familia", label: "Família", color: "bg-rose-100 text-rose-800 border-rose-200" },
  { value: "empresarial", label: "Empresarial", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "tributario", label: "Tributário", color: "bg-lime-100 text-lime-800 border-lime-200" },
  { value: "previdenciario", label: "Previdenciário", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { value: "consumidor", label: "Consumidor", color: "bg-sky-100 text-sky-800 border-sky-200" },
  { value: "ambiental", label: "Ambiental", color: "bg-violet-100 text-violet-800 border-violet-200" },
  { value: "administrativo", label: "Administrativo", color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" },
  { value: "constitucional", label: "Constitucional", color: "bg-stone-100 text-stone-800 border-stone-200" },
  { value: "internacional", label: "Internacional", color: "bg-zinc-100 text-zinc-800 border-zinc-200" }
];


const Processos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [processos, setProcessos] = useState<ProcessoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [processosFiltrados, setProcessosFiltrados] = useState<ProcessoLocal[]>([]);
  const [processoSelecionado, setProcessoSelecionado] = useState<ProcessoLocal | null>(null);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [viewMode, setViewMode] = useState<'ativos' | 'arquivados' | 'todos'>('ativos');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Função para converter ProcessoDB para ProcessoLocal
  // Ajuste: exibir placeholder para nome do cliente, pois cliente_id é apenas o ID
  const convertToLocal = (processo: ProcessoDB): ProcessoLocal => ({
    id: processo.numero_processo || '',
    titulo: processo.titulo || '',
    cliente: processo.cliente_id ? `Cliente #${processo.cliente_id}` : 'Cliente não informado',
    clienteId: processo.cliente_id || '',
    status: processo.status || '',
    ultimaAtualizacao: processo.data_ultima_atualizacao ? processo.data_ultima_atualizacao.split('T')[0] : '',
    proximoPrazo: processo.proximo_prazo ? processo.proximo_prazo.split('T')[0] : '',
    etiquetas: processo.etiquetas || [],
    arquivado: processo.arquivado || false,
    dataArquivamento: processo.data_arquivamento || undefined,
    motivoArquivamento: processo.motivo_arquivamento || undefined,
    descricao: processo.observacoes || '',
    tipoProcesso: processo.tipo_processo || '',
    valorCausa: processo.valor_causa ? processo.valor_causa.toString() : ''
  });

  // Buscar processos do Supabase
  const fetchProcessos = useCallback(async () => {
    console.log('fetchProcessos chamado, user:', user);
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .eq('user_id', user.id)
        .eq('deletado', false)
        .order('data_ultima_atualizacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar processos:', error);
        toast({
          title: "Erro ao carregar processos",
          description: error.message,
          variant: "destructive"
        });
        setProcessos([]);
      } else {
        // Verificar se data é válido antes de definir
        console.log('Dados recebidos do Supabase:', data);
        if (Array.isArray(data)) {
          setProcessos(data);
        } else {
          console.warn('Dados recebidos não são um array:', data);
          setProcessos([]);
        }
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar processos:', err);
      toast({
        title: "Erro ao carregar processos",
        description: "Erro inesperado ao carregar processos",
        variant: "destructive"
      });
      setProcessos([]);
    } finally {
      setLoading(false);
      console.log('setLoading(false) chamado');
    }
  }, [user]);

  // Função para atualizar um processo
  const handleUpdateProcesso = async (processoAtualizado: ProcessoLocal) => {
    if (!user) return;
    
    // Encontrar o processo original no array para obter o ID do Supabase
    const processoOriginal = processos.find(p => convertToLocal(p).id === processoAtualizado.id);
    if (!processoOriginal) return;
    
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('processos')
      .update({
        titulo: processoAtualizado.titulo,
        status: processoAtualizado.status,
        tipo_processo: processoAtualizado.tipoProcesso,
        valor_causa: processoAtualizado.valorCausa ? Number(processoAtualizado.valorCausa) : null,
        proximo_prazo: processoAtualizado.proximoPrazo ? new Date(processoAtualizado.proximoPrazo).toISOString() : null,
        etiquetas: processoAtualizado.etiquetas || [],
        observacoes: processoAtualizado.descricao,
        data_ultima_atualizacao: now
      })
      .eq('id', processoOriginal.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao atualizar processo",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Atualizar estado local
      setProcessos(processos.map(p => p.id === data.id ? data : p));
      toast({
        title: "Processo atualizado",
        description: `Processo ${data.numero_processo} foi atualizado com sucesso.`
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchProcessos();
  }, [user, fetchProcessos]);
  
  useEffect(() => {
    // Só mostra empty state se não há processos e não está carregando
    console.log('loading:', loading, 'processos:', processos.length, 'processosFiltrados:', processosFiltrados.length);
    setShowEmptyState(!loading && processos.length === 0 && processosFiltrados.length === 0);
  }, [loading, processos.length, processosFiltrados.length]);
  
  const multiSelect = useMultiSelect(processosFiltrados);

  useEffect(() => {
    // Verifica se veio um filtro de cliente da navegação
    const clientFilter = location.state?.clientFilter;
    if (clientFilter) {
      setFiltroCliente(clientFilter);
    }
  }, [location]);

  useEffect(() => {
    try {
      // Converter processos do Supabase para formato local
      let processosLocais = processos.map(convertToLocal);

      // Filtro por modo de visualização (ativos/arquivados/todos)
      if (viewMode === 'ativos') {
        processosLocais = processosLocais.filter(processo => !processo.arquivado);
      } else if (viewMode === 'arquivados') {
        processosLocais = processosLocais.filter(processo => processo.arquivado);
      }

      // Filtro por cliente
      if (filtroCliente) {
        processosLocais = processosLocais.filter(processo => 
          processo.cliente && processo.cliente.toLowerCase().includes(filtroCliente.toLowerCase())
        );
      }

      // Filtro por status
      if (filtroStatus) {
        processosLocais = processosLocais.filter(processo => 
          processo.status === filtroStatus
        );
      }

      // Filtro por tipo
      if (filtroTipo) {
        processosLocais = processosLocais.filter(processo => 
          processo.tipoProcesso === filtroTipo
        );
      }

      // Busca por texto
      if (buscaTexto) {
        const busca = buscaTexto.toLowerCase();
        processosLocais = processosLocais.filter(processo => 
          (processo.titulo && processo.titulo.toLowerCase().includes(busca)) ||
          (processo.cliente && processo.cliente.toLowerCase().includes(busca)) ||
          (processo.id && processo.id.toLowerCase().includes(busca)) ||
          (processo.descricao && processo.descricao.toLowerCase().includes(busca))
        );
      }

      setProcessosFiltrados(processosLocais);
    } catch (error) {
      console.error('Erro ao filtrar processos:', error);
      setProcessosFiltrados([]);
    }
  }, [processos, filtroCliente, viewMode, filtroStatus, filtroTipo, buscaTexto]);

  const handleAddProcesso = async (novoProcesso: any) => {
    if (!user) return;
    
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('processos')
      .insert({
        user_id: user.id,
        cliente_id: novoProcesso.clienteId || novoProcesso.cliente,
        numero_processo: novoProcesso.numeroProcesso || `PROC-${Date.now()}`,
        titulo: novoProcesso.titulo,
        status: novoProcesso.status || "Iniciado",
        tipo_processo: novoProcesso.tipoProcesso,
        valor_causa: novoProcesso.valorCausa,
        data_inicio: now,
        data_ultima_atualizacao: now,
        proximo_prazo: novoProcesso.proximoPrazo ? new Date(novoProcesso.proximoPrazo).toISOString() : null,
        etiquetas: novoProcesso.etiquetas || [],
        observacoes: novoProcesso.descricao,
        deletado: false,
        arquivado: false
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao criar processo",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setProcessos([data, ...processos]);
      toast({
        title: "Processo criado",
        description: `Processo ${data.numero_processo} foi criado com sucesso.`
      });
    }
  };

  const handleArchiveSelected = () => {
    setArchiveDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    setIsArchiving(true);
    try {
      const selectedItems = multiSelect.getSelectedItems();
      const selectedIds = selectedItems.map(item => {
        // Buscar o processo original no array de processos para obter o ID do Supabase
        const processoOriginal = processos.find(p => convertToLocal(p).id === item.id);
        return processoOriginal?.id;
      }).filter(Boolean);
      
      const isArchiving = selectedItems.some(item => !item.arquivado);
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('processos')
        .update({
          arquivado: isArchiving,
          data_arquivamento: isArchiving ? now : null,
          motivo_arquivamento: isArchiving ? "Arquivado pelo usuário" : null,
          data_ultima_atualizacao: now
        })
        .in('id', selectedIds);

      if (error) {
        toast({
          title: "Erro ao arquivar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Atualizar estado local
        const updatedProcessos = processos.map(processo => {
          if (selectedIds.includes(processo.id)) {
            return {
              ...processo,
              arquivado: isArchiving,
              data_arquivamento: isArchiving ? now : null,
              motivo_arquivamento: isArchiving ? "Arquivado pelo usuário" : null,
              data_ultima_atualizacao: now
            };
          }
          return processo;
        });
        
        setProcessos(updatedProcessos);
        
        toast({
          title: isArchiving ? "Processos arquivados" : "Processos desarquivados",
          description: `${selectedItems.length} processo(s) ${isArchiving ? "arquivado(s)" : "desarquivado(s)"} com sucesso.`
        });
        multiSelect.clearSelection();
      }
    } catch (error) {
      toast({
        title: "Erro ao arquivar",
        description: "Ocorreu um erro ao arquivar os processos.",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
      setArchiveDialogOpen(false);
    }
  };

  const limparFiltros = () => {
    setFiltroCliente(null);
    setFiltroStatus('');
    setFiltroTipo('');
    setBuscaTexto('');
  };

  const handleProcessoClick = (processo: ProcessoLocal) => {
    console.log('Clicando no processo:', processo.id);
    setProcessoSelecionado(processo);
    setDetalhesOpen(true);
  };

  const handleEditProcesso = (processo: ProcessoLocal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    console.log('Editando processo:', processo.id);
    setProcessoSelecionado(processo);
    setDetalhesOpen(true);
    toast({
      title: "Processo selecionado",
      description: `Abrindo detalhes do processo ${processo.id}`,
    });
  };

  const limparFiltro = () => {
    setFiltroCliente(null);
  };

  const voltarParaClientes = () => {
    navigate('/clientes');
  };

  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedItems = multiSelect.getSelectedItems();
      const selectedIds = selectedItems.map(item => {
        // Buscar o processo original no array de processos para obter o ID do Supabase
        const processoOriginal = processos.find(p => convertToLocal(p).id === item.id);
        return processoOriginal?.id;
      }).filter(Boolean);
      
      const { error } = await supabase
        .from('processos')
        .update({ deletado: true })
        .in('id', selectedIds);

      if (error) {
        toast({
          title: "Erro ao excluir",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Remover dos dados locais
        const updatedProcessos = processos.filter(processo => !selectedIds.includes(processo.id));
        setProcessos(updatedProcessos);
        
        toast({
          title: "Processos excluídos",
          description: `${selectedItems.length} processo(s) foram excluidos com sucesso.`
        });
        multiSelect.clearSelection();
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir os processos.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Tela de carregamento
  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando processos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {filtroCliente ? `Processos de ${filtroCliente}` : "Processos"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {filtroCliente 
              ? `Visualizando processos relacionados a ${filtroCliente}` 
              : "Gerencie seus processos e acompanhe o andamento"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filtroCliente && (
            <Button 
              variant="outline"
              onClick={() => {
                setFiltroCliente(null);
                navigate('/processos');
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para todos
            </Button>
          )}
          
          {!multiSelect.isNoneSelected && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleArchiveSelected}
                className="flex items-center gap-2"
              >
                {viewMode === 'arquivados' ? (
                  <>
                    <ArchiveRestore className="h-4 w-4" />
                    Desarquivar ({multiSelect.selectedCount})
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    Arquivar ({multiSelect.selectedCount})
                  </>
                )}
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir ({multiSelect.selectedCount})
              </Button>
            </div>
          )}
          
          <NovoProcessoDialog onAddProcesso={handleAddProcesso} />
        </div>
      </div>

      {/* Empty State para novos usuários */}
      {showEmptyState ? (
        <Card className="border-dashed border-2 p-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Nenhum processo cadastrado</h3>
              <p className="text-muted-foreground">
                Você ainda não possui processos cadastrados. Comece adicionando seu primeiro processo ou carregue dados de exemplo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <NovoProcessoDialog onAddProcesso={handleAddProcesso} />
              <Button variant="outline" onClick={() => {}}>
                Carregar Dados de Exemplo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tabs para visualização */}
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ativos" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Ativos ({processos.filter(p => !p.arquivado).length})
              </TabsTrigger>
              <TabsTrigger value="arquivados" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Arquivados ({processos.filter(p => p.arquivado).length})
              </TabsTrigger>
              <TabsTrigger value="todos" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Todos ({processos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ativos" className="space-y-4">
              {/* Filtros Avançados */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Buscar</label>
                      <Input
                        placeholder="Buscar por título, cliente ou número..."
                        value={buscaTexto}
                        onChange={(e) => setBuscaTexto(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os status</SelectItem>
                          <SelectItem value="Iniciado">Iniciado</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                          <SelectItem value="Aguardando Documentos">Aguardando Documentos</SelectItem>
                          <SelectItem value="Suspenso">Suspenso</SelectItem>
                          <SelectItem value="Arquivado">Arquivado</SelectItem>
                          <SelectItem value="Encerrado">Encerrado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os tipos</SelectItem>
                          <SelectItem value="Ação de Cobrança">Ação de Cobrança</SelectItem>
                          <SelectItem value="Ação de Indenização">Ação de Indenização</SelectItem>
                          <SelectItem value="Ação Trabalhista">Ação Trabalhista</SelectItem>
                          <SelectItem value="Divórcio">Divórcio</SelectItem>
                          <SelectItem value="Inventário">Inventário</SelectItem>
                          <SelectItem value="Execução">Execução</SelectItem>
                          <SelectItem value="Cautelar">Cautelar</SelectItem>
                          <SelectItem value="Mandado de Segurança">Mandado de Segurança</SelectItem>
                          <SelectItem value="Ação Penal">Ação Penal</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ações</label>
                      <Button
                        variant="outline"
                        onClick={limparFiltros}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filtro de Cliente Ativo */}
              {filtroCliente && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary">
                    Mostrando processos de: <strong>{filtroCliente}</strong>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparFiltro}
                    className="ml-auto h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Estatísticas dos Processos Filtrados */}
              {filtroCliente && (
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-primary">
                        {processosFiltrados.filter(p => p.status !== "Encerrado").length}
                      </div>
                      <p className="text-sm text-muted-foreground">Processos Ativos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {processosFiltrados.filter(p => p.status === "Encerrado").length}
                      </div>
                      <p className="text-sm text-muted-foreground">Processos Encerrados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {processosFiltrados.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Total de Processos</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Selection Controls */}
              {processosFiltrados.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={multiSelect.isAllSelected}
                      onCheckedChange={() => 
                        multiSelect.isAllSelected ? multiSelect.clearSelection() : multiSelect.selectAll()
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {multiSelect.selectedCount > 0 ? (
                        `${multiSelect.selectedCount} de ${processosFiltrados.length} selecionado(s)`
                      ) : (
                        "Selecionar todos"
                      )}
                    </span>
                  </div>
                  {multiSelect.selectedCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={multiSelect.clearSelection}
                    >
                      Limpar seleção
                    </Button>
                  )}
                </div>
              )}

              {/* Processos Grid - Ativos */}
              <div className="grid gap-4 md:gap-6">
                {processosFiltrados.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum processo ativo encontrado</h3>
                      <p className="text-muted-foreground">
                        {filtroCliente 
                          ? `Não há processos ativos para ${filtroCliente}.`
                          : "Não há processos ativos no sistema."
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                processosFiltrados.map((processo) => (
                  <Card 
                    key={processo.id} 
                    className={`hover:shadow-md transition-all duration-200 cursor-pointer relative group ${
                      multiSelect.isSelected(processo.id) ? "ring-2 ring-primary" : ""
                    } ${
                      processo.arquivado ? "opacity-75 bg-muted/30" : ""
                    }`}
                    onClick={() => handleProcessoClick(processo)}
                  >
                    <CardHeader className="p-4 md:p-6">
                      <Checkbox
                        checked={multiSelect.isSelected(processo.id)}
                        onCheckedChange={() => multiSelect.toggleItem(processo.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-4 right-4 z-10"
                      />
                      {processo.arquivado && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Archive className="h-3 w-3" />
                            Arquivado
                          </Badge>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                              <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                              <span className="truncate">{processo.titulo}</span>
                              {processo.tipoProcesso && (
                                <Badge variant="outline" className="text-xs ml-2">
                                  {processo.tipoProcesso}
                                </Badge>
                              )}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleEditProcesso(processo, e)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Descrição do processo */}
                          {processo.descricao && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {processo.descricao}
                            </p>
                          )}
                          
                          {/* Etiquetas do processo */}
                          {processo.etiquetas && processo.etiquetas.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {processo.etiquetas.map((etiquetaValue) => {
                                const etiqueta = etiquetasDisponiveis.find(e => e.value === etiquetaValue);
                                return (
                                  <Badge 
                                    key={etiquetaValue} 
                                    variant="outline" 
                                    className={`text-xs ${etiqueta?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                                  >
                                    {etiqueta?.label}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs md:text-sm text-muted-foreground">#{processo.id}</span>
                          {processo.valorCausa && (
                            <span className="text-xs font-medium text-green-600">
                              {processo.valorCausa}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm text-muted-foreground">Cliente</p>
                            <p className="font-medium text-sm md:text-base truncate">{processo.cliente}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">Status</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            processo.status === "Encerrado" 
                              ? "bg-green-100 text-green-800"
                              : "bg-primary/10 text-primary"
                          }`}>
                            {processo.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm text-muted-foreground">Última Atualização</p>
                            <p className="font-medium text-sm md:text-base">{new Date(processo.ultimaAtualizacao).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-accent flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs md:text-sm text-muted-foreground">Próximo Prazo</p>
                            <p className="font-medium text-sm md:text-base text-accent">{new Date(processo.proximoPrazo).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            </TabsContent>

            <TabsContent value="arquivados" className="space-y-4">
              {/* Processos Grid - Arquivados */}
              <div className="grid gap-4 md:gap-6">
                {processosFiltrados.filter(p => p.arquivado).length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum processo arquivado encontrado</h3>
                      <p className="text-muted-foreground">
                        Não há processos arquivados no sistema.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  processosFiltrados.filter(p => p.arquivado).map((processo) => (
                    <Card 
                      key={processo.id} 
                      className={`hover:shadow-md transition-all duration-200 cursor-pointer relative group opacity-75 ${
                        multiSelect.isSelected(processo.id) ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleProcessoClick(processo)}
                    >
                      <CardHeader className="p-4 md:p-6">
                        <Checkbox
                          checked={multiSelect.isSelected(processo.id)}
                          onCheckedChange={() => multiSelect.toggleItem(processo.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-4 right-4 z-10"
                        />
                        <div className="absolute top-4 left-4 z-10">
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Archive className="h-3 w-3" />
                            Arquivado
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                                <span className="truncate">{processo.titulo}</span>
                                {processo.tipoProcesso && (
                                  <Badge variant="outline" className="text-xs ml-2">
                                    {processo.tipoProcesso}
                                  </Badge>
                                )}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleEditProcesso(processo, e)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Descrição do processo */}
                            {processo.descricao && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {processo.descricao}
                              </p>
                            )}
                            
                            {/* Etiquetas do processo */}
                            {processo.etiquetas && processo.etiquetas.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                {processo.etiquetas.map((etiquetaValue) => {
                                  const etiqueta = etiquetasDisponiveis.find(e => e.value === etiquetaValue);
                                  return (
                                    <Badge 
                                      key={etiquetaValue} 
                                      variant="outline" 
                                      className={`text-xs ${etiqueta?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                                    >
                                      {etiqueta?.label}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs md:text-sm text-muted-foreground">#{processo.id}</span>
                            {processo.valorCausa && (
                              <span className="text-xs font-medium text-green-600">
                                {processo.valorCausa}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs md:text-sm text-muted-foreground">Cliente</p>
                              <p className="font-medium text-sm md:text-base truncate">{processo.cliente}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs md:text-sm text-muted-foreground">Status</p>
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                              Arquivado
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs md:text-sm text-muted-foreground">Última Atualização</p>
                              <p className="font-medium text-sm md:text-base">{new Date(processo.ultimaAtualizacao).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs md:text-sm text-muted-foreground">Próximo Prazo</p>
                              <p className="font-medium text-sm md:text-base text-muted-foreground">{new Date(processo.proximoPrazo).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="todos" className="space-y-4">
              {/* Processos Grid - Todos */}
              <div className="grid gap-4 md:gap-6">
                {processosFiltrados.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum processo encontrado</h3>
                      <p className="text-muted-foreground">
                        Não há processos cadastrados no sistema.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  processosFiltrados.map((processo) => (
                    <Card 
                      key={processo.id} 
                      className={`hover:shadow-md transition-all duration-200 cursor-pointer relative group ${
                        multiSelect.isSelected(processo.id) ? "ring-2 ring-primary" : ""
                      } ${
                        processo.arquivado ? "opacity-75 bg-muted/30" : ""
                      }`}
                      onClick={() => handleProcessoClick(processo)}
                    >
                      <CardHeader className="p-4 md:p-6">
                        <Checkbox
                          checked={multiSelect.isSelected(processo.id)}
                          onCheckedChange={() => multiSelect.toggleItem(processo.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-4 right-4 z-10"
                        />
                        {processo.arquivado && (
                          <div className="absolute top-4 left-4 z-10">
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Archive className="h-3 w-3" />
                              Arquivado
                            </Badge>
                          </div>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                                <span className="truncate">{processo.titulo}</span>
                                {processo.tipoProcesso && (
                                  <Badge variant="outline" className="text-xs ml-2">
                                    {processo.tipoProcesso}
                                  </Badge>
                                )}
                              </CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleEditProcesso(processo, e)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Descrição do processo */}
                            {processo.descricao && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {processo.descricao}
                              </p>
                            )}
                            
                            {/* Etiquetas do processo */}
                            {processo.etiquetas && processo.etiquetas.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                {processo.etiquetas.map((etiquetaValue) => {
                                  const etiqueta = etiquetasDisponiveis.find(e => e.value === etiquetaValue);
                                  return (
                                    <Badge 
                                      key={etiquetaValue} 
                                      variant="outline" 
                                      className={`text-xs ${etiqueta?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                                    >
                                      {etiqueta?.label}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs md:text-sm text-muted-foreground">#{processo.id}</span>
                            {processo.valorCausa && (
                              <span className="text-xs font-medium text-green-600">
                                {processo.valorCausa}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs md:text-sm text-muted-foreground">Cliente</p>
                              <p className="font-medium text-sm md:text-base truncate">{processo.cliente}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs md:text-sm text-muted-foreground">Status</p>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              processo.arquivado 
                                ? "bg-gray-100 text-gray-800"
                                : processo.status === "Encerrado" 
                                  ? "bg-green-100 text-green-800"
                                  : "bg-primary/10 text-primary"
                            }`}>
                              {processo.arquivado ? "Arquivado" : processo.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs md:text-sm text-muted-foreground">Última Atualização</p>
                              <p className="font-medium text-sm md:text-base">{new Date(processo.ultimaAtualizacao).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className={`h-4 w-4 flex-shrink-0 ${
                              processo.arquivado ? "text-muted-foreground" : "text-accent"
                            }`} />
                            <div className="min-w-0">
                              <p className="text-xs md:text-sm text-muted-foreground">Próximo Prazo</p>
                              <p className={`font-medium text-sm md:text-base ${
                                processo.arquivado ? "text-muted-foreground" : "text-accent"
                              }`}>
                                {new Date(processo.proximoPrazo).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Dialog de Detalhes */}
          <ProcessoDetalhes 
            processo={processoSelecionado}
            open={detalhesOpen}
            onOpenChange={setDetalhesOpen}
            onUpdateProcesso={handleUpdateProcesso}
          />

          <DeleteConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleConfirmDelete}
            title="Excluir Processos"
            description={`Tem certeza que deseja excluir ${multiSelect.selectedCount} processo(s)? Esta ação não pode ser desfeita e removerá todas as audiências e prazos associados.`}
            isLoading={isDeleting}
          />

          <DeleteConfirmDialog
            open={archiveDialogOpen}
            onOpenChange={setArchiveDialogOpen}
            onConfirm={handleConfirmArchive}
            title={multiSelect.getSelectedItems().some(item => item.arquivado) ? "Desarquivar Processos" : "Arquivar Processos"}
            description={
              multiSelect.getSelectedItems().some(item => item.arquivado)
                ? `Tem certeza que deseja desarquivar ${multiSelect.selectedCount} processo(s)? Eles voltarão a aparecer na lista de processos ativos.`
                : `Tem certeza que deseja arquivar ${multiSelect.selectedCount} processo(s)? Eles serão movidos para a seção de arquivados mas podem ser restaurados a qualquer momento.`
            }
            isLoading={isArchiving}
            confirmText={multiSelect.getSelectedItems().some(item => item.arquivado) ? "Desarquivar" : "Arquivar"}
            variant={multiSelect.getSelectedItems().some(item => item.arquivado) ? "default" : "secondary"}
          />
        </>
      )}
    </div>
  );
};

export default Processos;
