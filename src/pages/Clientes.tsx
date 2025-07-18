import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { initialClientsData } from "@/utils/initialData";
import { useDataState } from "@/hooks/useDataState";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { Client } from "@/types/client";
import { useClientService } from "@/services/clientService";

// Componentes refatorados
import { ClientsPageHeader } from "@/components/Clientes/ClientsPageHeader";
import { ClientsSearchBar } from "@/components/Clientes/ClientsSearchBar";
import { ClientsEmptyState } from "@/components/Clientes/ClientsEmptyState";
import { ClientsSelectionControls } from "@/components/Clientes/ClientsSelectionControls";
import { ClientsGrid } from "@/components/Clientes/ClientsGrid";
import { ClientDetailsModal } from "@/components/Clientes/ClientDetailsModal";

// Componentes existentes mantidos
import { EditClientDialog } from "@/components/Clientes/EditClientDialog";
import { NovoClienteDialog } from "@/components/Clientes/NovoClienteDialog";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

const Clientes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const clientService = useClientService();
  const { data: clientes, isNewUser, loadSampleData } = useDataState(initialClientsData);
  
  // Estados
  const [clients, setClients] = useState<Client[]>(clientes);
  const [searchValue, setSearchValue] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [novoClienteDialogOpen, setNovoClienteDialogOpen] = useState(false);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(isNewUser);

  // Atualizar lista quando dados do hook mudarem
  useEffect(() => {
    setClients(clientes);
  }, [clientes]);

  useEffect(() => {
    setShowEmptyState(isNewUser && clientes.length === 0);
  }, [isNewUser, clientes]);

  // Multi-seleção
  const multiSelect = useMultiSelect(clients);

  // Handlers de cliente
  const handleEditClient = (clientId: number) => {
    const client = clientService.findClientById(clients, clientId);
    if (client) {
      setEditingClient(client);
      setEditDialogOpen(true);
    }
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setClientDetailsOpen(true);
  };

  const handleSaveClient = (updatedClient: Client) => {
    const newClients = clientService.updateClient(clients, updatedClient);
    setClients(newClients);
  };

  const handleNovoCliente = (newClient: Client) => {
    const newClients = clientService.createClient(clients, newClient);
    setClients(newClients);
  };

  // Handlers de navegação
  const handleViewProcesses = (clientId: number, clientName: string) => {
    clientService.navigateToProcesses(navigate, clientId, clientName);
  };

  const handleViewAtendimentos = (clientId: number, clientName: string) => {
    clientService.navigateToAtendimentos(navigate, clientId, clientName);
  };

  const handleViewConsultivo = (clientId: number, clientName: string) => {
    clientService.navigateToConsultivo(navigate, clientId, clientName);
  };

  // Handlers de exclusão
  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedIds = multiSelect.getSelectedItems().map(client => client.id);
      const result = clientService.deleteClients(clients, selectedIds);
      
      if (result.success) {
        setClients(result.clients);
        multiSelect.clearSelection();
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir os clientes.",
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

  const handleFilterClick = () => {
    // TODO: Implementar filtros avançados
    toast({
      title: "Filtros",
      description: "Funcionalidade de filtros será implementada em breve.",
    });
  };

  // Filtragem de clientes
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    client.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    client.phone.includes(searchValue) ||
    client.cpfCnpj.includes(searchValue)
  );

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <ClientsPageHeader
        selectedCount={multiSelect.selectedCount}
        onDeleteSelected={handleDeleteSelected}
        onNewClient={() => setNovoClienteDialogOpen(true)}
        isNoneSelected={multiSelect.isNoneSelected}
      />

      {/* Empty State para novos usuários */}
      {showEmptyState ? (
        <ClientsEmptyState
          onNewClient={() => setNovoClienteDialogOpen(true)}
          onLoadSampleData={loadSampleData}
        />
      ) : (
        // Conteúdo normal quando há clientes
        <>
          {/* Search and Filters */}
          <ClientsSearchBar
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onFilterClick={handleFilterClick}
          />

          {/* Selection Controls */}
          {filteredClients.length > 0 && (
            <ClientsSelectionControls
              isAllSelected={multiSelect.isAllSelected}
              selectedCount={multiSelect.selectedCount}
              totalCount={filteredClients.length}
              onSelectAll={multiSelect.selectAll}
              onClearSelection={multiSelect.clearSelection}
            />
          )}

          {/* Clients Grid */}
          {filteredClients.length > 0 && (
            <ClientsGrid
              clients={filteredClients}
              selectedIds={multiSelect.getSelectedItems().map(item => item.id)}
              onToggleSelect={multiSelect.toggleItem}
              onClientClick={handleClientClick}
              onEditClient={handleEditClient}
              onViewProcesses={handleViewProcesses}
              onViewAtendimentos={handleViewAtendimentos}
              onViewConsultivo={handleViewConsultivo}
            />
          )}
        </>
      )}

      {/* Modais */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={clientDetailsOpen}
        onClose={() => setClientDetailsOpen(false)}
        onEditClient={handleEditClient}
        onViewProcesses={handleViewProcesses}
        onViewAtendimentos={handleViewAtendimentos}
        onViewConsultivo={handleViewConsultivo}
      />

      <EditClientDialog
        client={editingClient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveClient}
      />

      <NovoClienteDialog
        open={novoClienteDialogOpen}
        onOpenChange={setNovoClienteDialogOpen}
        onSave={handleNovoCliente}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir Clientes"
        description={`Tem certeza que deseja excluir ${multiSelect.selectedCount} cliente(s)? Clientes com processos associados não podem ser excluídos.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Clientes;