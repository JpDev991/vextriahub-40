import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { initialAtendimentosData } from "@/utils/initialData";
import { useDataState } from "@/hooks/useDataState";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { Atendimento } from "@/types/atendimento";
import { useAtendimentoService } from "@/services/atendimentoService";

// Componentes refatorados
import { AtendimentosPageHeader } from "@/components/Atendimentos/AtendimentosPageHeader";
import { AtendimentosFilters } from "@/components/Atendimentos/AtendimentosFilters";
import { AtendimentosEmptyState } from "@/components/Atendimentos/AtendimentosEmptyState";
import { AtendimentosSelectionControls } from "@/components/Atendimentos/AtendimentosSelectionControls";
import { AtendimentosGrid } from "@/components/Atendimentos/AtendimentosGrid";

// Componentes existentes mantidos
import { EditAtendimentoDialog } from "@/components/Atendimentos/EditAtendimentoDialog";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

const Atendimentos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const atendimentoService = useAtendimentoService();
  const { data: atendimentos, isNewUser, loadSampleData, updateData } = useDataState(initialAtendimentosData);
  
  // Estados
  const [items, setItems] = useState<Atendimento[]>(atendimentos);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [groupedByDate, setGroupedByDate] = useState(false);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(isNewUser);

  // Filtros vindos da navegação
  const [isFiltered, setIsFiltered] = useState(false);
  const [clientName, setClientName] = useState<string>("");
  const [clientId, setClientId] = useState<number | undefined>(undefined);

  // Atualizar lista quando dados do hook mudarem
  useEffect(() => {
    setItems(atendimentos);
  }, [atendimentos]);

  useEffect(() => {
    setShowEmptyState(isNewUser && atendimentos.length === 0);
  }, [isNewUser, atendimentos]);

  // Verificar se chegou com filtro da navegação
  useEffect(() => {
    if (location.state?.filterActive) {
      setIsFiltered(true);
      setClientName(location.state.clientFilter || "");
      setClientId(location.state.clientId);
    }
  }, [location.state]);

  // Multi-seleção
  const multiSelect = useMultiSelect(items);

  // Handlers de atendimento
  const handleEditAtendimento = (atendimentoId: string) => {
    const atendimento = atendimentoService.findAtendimentoById(items, atendimentoId);
    if (atendimento) {
      setEditingAtendimento(atendimento);
      setEditDialogOpen(true);
    }
  };

  const handleSaveAtendimento = (updatedAtendimento: Atendimento) => {
    const newAtendimentos = atendimentoService.updateAtendimento(items, updatedAtendimento);
    setItems(newAtendimentos);
    updateData(newAtendimentos);
  };

  const handleNewAtendimento = () => {
    // TODO: Implementar diálogo de novo atendimento
    toast({
      title: "Novo Atendimento",
      description: "Funcionalidade de novo atendimento será implementada em breve.",
    });
  };

  // Handlers de navegação
  const handleNavigateToClient = (clientId: number, clientName: string) => {
    atendimentoService.navigateToClient(navigate, clientId, clientName);
  };

  const handleNavigateToProcesses = (clientId: number, clientName: string) => {
    atendimentoService.navigateToProcesses(navigate, clientId, clientName);
  };

  // Handlers de exclusão
  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedIds = multiSelect.getSelectedItems().map(item => item.id);
      const result = atendimentoService.deleteAtendimentos(items, selectedIds);
      
      if (result.success) {
        setItems(result.atendimentos);
        updateData(result.atendimentos);
        multiSelect.clearSelection();
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir os atendimentos.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Handlers de UI
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleTipoFilterChange = (value: string) => {
    setTipoFilter(value);
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setStatusFilter("all");
    setTipoFilter("all");
  };

  const handleClearNavFilter = () => {
    setIsFiltered(false);
    setClientName("");
    setClientId(undefined);
    navigate('/atendimentos', { replace: true });
  };

  const handleToggleGrouping = () => {
    setGroupedByDate(!groupedByDate);
  };

  // Filtragem de atendimentos
  const filteredAtendimentos = atendimentoService.filterAtendimentos(items, {
    search: searchValue,
    status: statusFilter !== "all" ? statusFilter : undefined,
    tipo: tipoFilter !== "all" ? tipoFilter : undefined,
    clienteId: clientId
  });

  // Contagem de filtros ativos
  const activeFiltersCount = [
    searchValue !== "",
    statusFilter !== "all",
    tipoFilter !== "all"
  ].filter(Boolean).length;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <AtendimentosPageHeader
        selectedCount={multiSelect.selectedCount}
        onDeleteSelected={handleDeleteSelected}
        onNewAtendimento={handleNewAtendimento}
        isNoneSelected={multiSelect.isNoneSelected}
        isFiltered={isFiltered}
        onClearFilter={handleClearNavFilter}
        clientName={clientName}
      />

      {/* Empty State para novos usuários */}
      {showEmptyState ? (
        <AtendimentosEmptyState
          onNewAtendimento={handleNewAtendimento}
          onLoadSampleData={loadSampleData}
        />
      ) : (
        // Conteúdo normal quando há atendimentos
        <>
          {/* Filtros */}
          <AtendimentosFilters
            searchValue={searchValue}
            statusFilter={statusFilter}
            tipoFilter={tipoFilter}
            onSearchChange={handleSearchChange}
            onStatusFilterChange={handleStatusFilterChange}
            onTipoFilterChange={handleTipoFilterChange}
            onClearFilters={handleClearFilters}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Empty State para filtros */}
          {filteredAtendimentos.length === 0 && !showEmptyState ? (
            <AtendimentosEmptyState
              onNewAtendimento={handleNewAtendimento}
              onLoadSampleData={loadSampleData}
              isFiltered={true}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <>
              {/* Selection Controls */}
              {filteredAtendimentos.length > 0 && (
                <AtendimentosSelectionControls
                  isAllSelected={multiSelect.isAllSelected}
                  selectedCount={multiSelect.selectedCount}
                  totalCount={filteredAtendimentos.length}
                  onSelectAll={multiSelect.selectAll}
                  onClearSelection={multiSelect.clearSelection}
                  groupedByDate={groupedByDate}
                  onToggleGrouping={handleToggleGrouping}
                />
              )}

              {/* Atendimentos Grid */}
              {filteredAtendimentos.length > 0 && (
                <AtendimentosGrid
                  atendimentos={filteredAtendimentos}
                  selectedIds={multiSelect.getSelectedItems().map(item => item.id)}
                  onToggleSelect={multiSelect.toggleItem}
                  onEditAtendimento={handleEditAtendimento}
                  onNavigateToClient={handleNavigateToClient}
                  onNavigateToProcesses={handleNavigateToProcesses}
                  getStatusColor={atendimentoService.getStatusColor}
                  groupedByDate={groupedByDate}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Modais */}
      <EditAtendimentoDialog
        atendimento={editingAtendimento}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveAtendimento}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir Atendimentos"
        description={`Tem certeza que deseja excluir ${multiSelect.selectedCount} atendimento(s)? Atendimentos confirmados não podem ser excluídos.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Atendimentos;