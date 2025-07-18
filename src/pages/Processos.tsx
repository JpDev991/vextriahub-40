import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useDataState } from '@/hooks/useDataState';
import { FileText, Search, Filter } from 'lucide-react';

// Componentes UI
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

// Componentes específicos
import { ProcessoCard } from '@/components/Processos/ProcessoCard';
import { NovoProcessoDialog } from '@/components/Processos/NovoProcessoDialog';
import { ProcessoEditDialog } from '@/components/Processos/ProcessoEditDialog';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

// Tipos e dados
import { Processo, NovoProcessoForm, ProcessoFilters, processosExemplo, statusProcesso } from '@/types/processo';

const Processos = React.memo(() => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: processosIniciais, isNewUser, loadSampleData } = useDataState(processosExemplo);

  // Estados
  const [processos, setProcessos] = useState<Processo[]>(processosIniciais);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processoToDelete, setProcessoToDelete] = useState<Processo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Memoized values
  const showEmptyState = useMemo(() => {
    return isNewUser && processosIniciais.length === 0;
  }, [isNewUser, processosIniciais.length]);

  // Atualizar lista quando dados do hook mudarem - apenas quando realmente mudou
  useEffect(() => {
    if (JSON.stringify(processos) !== JSON.stringify(processosIniciais)) {
      setProcessos(processosIniciais);
    }
  }, [processosIniciais]); // Removido 'processos' das dependências para evitar loop

  // Filtrar processos - memoizado para evitar recálculos desnecessários
  const filteredProcessos = useMemo(() => {
    return processos.filter(processo => {
      const matchesSearch = searchValue === '' || 
        processo.titulo.toLowerCase().includes(searchValue.toLowerCase()) ||
        processo.cliente.toLowerCase().includes(searchValue.toLowerCase()) ||
        (processo.numeroProcesso && processo.numeroProcesso.toLowerCase().includes(searchValue.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || processo.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [processos, searchValue, statusFilter]);

  // Contagem de filtros ativos - memoizada
  const activeFiltersCount = useMemo(() => {
    return [searchValue !== '', statusFilter !== 'all'].filter(Boolean).length;
  }, [searchValue, statusFilter]);

  // Handlers - todos usando useCallback para evitar re-criações
  const handleAddProcesso = useCallback((novoProcesso: NovoProcessoForm) => {
    const processo: Processo = {
      ...novoProcesso,
      id: Date.now().toString(),
      dataInicio: new Date().toISOString().split('T')[0],
    };

    setProcessos(prev => [processo, ...prev]);
    
    toast({
      title: "Processo criado",
      description: `Processo "${processo.titulo}" foi criado com sucesso.`,
    });
  }, [toast]);

  const handleEditProcesso = useCallback((processo: Processo) => {
    setEditingProcesso(processo);
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = useCallback((processoAtualizado: Processo) => {
    setProcessos(prev => 
      prev.map(p => p.id === processoAtualizado.id ? processoAtualizado : p)
    );
    
    toast({
      title: "Processo atualizado",
      description: `Processo "${processoAtualizado.titulo}" foi atualizado com sucesso.`,
    });
  }, [toast]);

  const handleDeleteProcesso = useCallback((processo: Processo) => {
    setProcessoToDelete(processo);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!processoToDelete) return;

    setIsDeleting(true);
    
    try {
      setProcessos(prev => prev.filter(p => p.id !== processoToDelete.id));
      
      toast({
        title: "Processo excluído",
        description: `Processo "${processoToDelete.titulo}" foi excluído com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o processo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProcessoToDelete(null);
    }
  }, [processoToDelete, toast]);

  const handleClienteClick = useCallback((clienteId: string) => {
    navigate(`/clientes?filter=${clienteId}`);
  }, [navigate]);

  const handleLoadSampleData = useCallback(() => {
    loadSampleData();
    toast({
      title: "Dados carregados",
      description: "Dados de exemplo foram carregados com sucesso.",
    });
  }, [loadSampleData, toast]);

  const handleClearFilters = useCallback(() => {
    setSearchValue('');
    setStatusFilter('all');
  }, []);

  const handleEditDialogOpenChange = useCallback((open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingProcesso(null);
    }
  }, []);

  const handleDeleteDialogOpenChange = useCallback((open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setProcessoToDelete(null);
    }
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Processos Jurídicos
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus processos jurídicos de forma simples e eficiente
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NovoProcessoDialog onAddProcesso={handleAddProcesso} />
        </div>
      </div>

      {/* Empty State */}
      {showEmptyState ? (
        <Card className="border-dashed border-2 p-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Nenhum processo cadastrado</h3>
              <p className="text-muted-foreground">
                Você ainda não possui processos cadastrados. 
                Comece criando seu primeiro processo ou carregue dados de exemplo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <NovoProcessoDialog 
                onAddProcesso={handleAddProcesso}
                trigger={
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Criar Primeiro Processo
                  </Button>
                }
              />
              <Button variant="outline" onClick={handleLoadSampleData}>
                Carregar Dados de Exemplo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por título, cliente ou número do processo..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtro de Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {statusProcesso.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Limpar filtros */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Limpar ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grid de Processos ou Empty State filtrado */}
          {filteredProcessos.length === 0 ? (
            <Card className="border-dashed border-2 p-8">
              <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
                <Search className="h-12 w-12 text-muted-foreground" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Nenhum processo encontrado</h3>
                  <p className="text-muted-foreground">
                    Não foram encontrados processos com os filtros aplicados. 
                    Tente ajustar os filtros ou criar um novo processo.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpar Filtros
                  </Button>
                  <NovoProcessoDialog onAddProcesso={handleAddProcesso} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProcessos.map((processo) => (
                <ProcessoCard
                  key={processo.id}
                  processo={processo}
                  onEdit={handleEditProcesso}
                  onDelete={handleDeleteProcesso}
                  onClienteClick={handleClienteClick}
                />
              ))}
            </div>
          )}

          {/* Contador de resultados */}
          {filteredProcessos.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Mostrando {filteredProcessos.length} de {processos.length} processo(s)
            </div>
          )}
        </>
      )}

      {/* Modal de Edição */}
      <ProcessoEditDialog
        processo={editingProcesso}
        open={editDialogOpen}
        onOpenChange={handleEditDialogOpenChange}
        onSave={handleSaveEdit}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        onConfirm={handleConfirmDelete}
        title="Excluir Processo"
        description={`Tem certeza que deseja excluir o processo "${processoToDelete?.titulo}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />
    </div>
  );
});

Processos.displayName = 'Processos';

export default Processos;