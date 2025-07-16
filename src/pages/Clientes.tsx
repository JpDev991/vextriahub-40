
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { AppHeader } from "@/components/Layout/AppHeader";
import { Users, Plus, Search, Filter, Phone, Mail, MapPin, Calendar, User, Building, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { EditClientDialog } from "@/components/Clientes/EditClientDialog";
import { NovoClienteDialog } from "@/components/Clientes/NovoClienteDialog";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { initialClientsData } from "@/utils/initialData";
import { useDataState } from "@/hooks/useDataState";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  cases: number;
  status: string;
  lastContact: string;
  cpfCnpj: string;
  tipoPessoa: "fisica" | "juridica";
  origem: string;
  endereco: string;
  dataAniversario: string;
}


const Clientes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: clientes, isNewUser, loadSampleData } = useDataState(initialClientsData);
  const [clients, setClients] = useState<Client[]>(clientes);

  // Atualizar lista quando dados do hook mudarem
  useEffect(() => {
    setClients(clientes);
  }, [clientes]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [novoClienteDialogOpen, setNovoClienteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(isNewUser);
  
  useEffect(() => {
    setShowEmptyState(isNewUser && clientes.length === 0);
  }, [isNewUser, clientes]);
  
  const multiSelect = useMultiSelect(clients);

  const handleEditClient = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
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
    setClients(prev => 
      prev.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      )
    );
    toast({
      title: "Cliente atualizado",
      description: `Os dados de ${updatedClient.name} foram atualizados com sucesso.`,
    });
  };

  const handleNovoCliente = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
    toast({
      title: "Cliente cadastrado",
      description: `${newClient.name} foi cadastrado com sucesso.`,
    });
  };

  const handleViewProcesses = (clientId: number, clientName: string) => {
    console.log(`Navegando para processos do cliente ${clientId} - ${clientName}`);
    // Navegação com state para aplicar filtro
    navigate('/processos', { 
      state: { 
        clientFilter: clientName,
        clientId: clientId,
        filterActive: true 
      } 
    });
    toast({
      title: "Redirecionando",
      description: `Visualizando processos de ${clientName}`,
    });
  };

  const handleViewAtendimentos = (clientId: number, clientName: string) => {
    console.log(`Navegando para atendimentos do cliente ${clientId} - ${clientName}`);
    // Navegação com state para aplicar filtro
    navigate('/atendimentos', { 
      state: { 
        clientFilter: clientName,
        clientId: clientId,
        filterActive: true 
      } 
    });
    toast({
      title: "Redirecionando",
      description: `Visualizando atendimentos de ${clientName}`,
    });
  };

  const handleViewConsultivo = (clientId: number, clientName: string) => {
    console.log(`Navegando para consultivo do cliente ${clientId} - ${clientName}`);
    // Navegação com state para aplicar filtro
    navigate('/consultivo', { 
      state: { 
        clientFilter: clientName,
        clientId: clientId,
        filterActive: true 
      } 
    });
    toast({
      title: "Redirecionando",
      description: `Visualizando consultivo de ${clientName}`,
    });
  };

  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedItems = multiSelect.getSelectedItems();
      const clientsWithProcesses = selectedItems.filter(client => client.cases > 0);
      
      if (clientsWithProcesses.length > 0) {
        toast({
          title: "Não é possível excluir",
          description: `${clientsWithProcesses.length} cliente(s) possui(em) processos associados.`,
          variant: "destructive",
        });
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        return;
      }

      const updatedClients = clients.filter(client => !multiSelect.isSelected(client.id));
      setClients(updatedClients);
      multiSelect.clearSelection();
      
      toast({
        title: "Clientes excluídos",
        description: `${selectedItems.length} cliente(s) foram excluído(s) com sucesso.`,
      });
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

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie seus clientes e relacionamentos.
          </p>
        </div>
        <div className="flex gap-2">
          {!multiSelect.isNoneSelected && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir Selecionados ({multiSelect.selectedCount})
            </Button>
          )}
          <NovoClienteDialog
            open={novoClienteDialogOpen}
            onOpenChange={setNovoClienteDialogOpen}
            onSave={handleNovoCliente}
          />
          <Button onClick={() => setNovoClienteDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Empty State para novos usuários */}
      {showEmptyState ? (
        <Card className="border-dashed border-2 p-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Nenhum cliente cadastrado</h3>
              <p className="text-muted-foreground">
                Você ainda não possui clientes cadastrados. Comece adicionando seu primeiro cliente ou carregue dados de exemplo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => setNovoClienteDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Cliente
              </Button>
              <Button variant="outline" onClick={loadSampleData}>
                Carregar Dados de Exemplo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Conteúdo normal quando há clientes
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Empty State for New Users */}
          {isNewUser && clients.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum cliente cadastrado</h3>
                <p className="text-muted-foreground mb-6">
                  Comece cadastrando seu primeiro cliente ou carregue dados de exemplo.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setNovoClienteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Cliente
                  </Button>
                  <Button variant="outline" onClick={loadSampleData}>
                    Ver Dados de Exemplo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selection Controls */}
          {clients.length > 0 && (
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
                    `${multiSelect.selectedCount} de ${clients.length} selecionado(s)`
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

          {/* Clients Grid */}
          {clients.length > 0 && (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <Card key={client.id} className={`hover:shadow-md transition-all duration-200 ${
                  multiSelect.isSelected(client.id) ? "ring-2 ring-primary" : ""
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Checkbox
                        checked={multiSelect.isSelected(client.id)}
                        onCheckedChange={() => multiSelect.toggleItem(client.id)}
                        className="mt-1"
                      />
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle 
                            className="text-lg cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleClientClick(client)}
                          >
                            {client.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                      <Badge variant={client.status === "ativo" ? "default" : "secondary"}>
                        {client.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {client.tipoPessoa === "fisica" ? "CPF:" : "CNPJ:"}
                      </span>
                      <span>{client.cpfCnpj}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Telefone:</span>
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Origem:</span>
                      <span>{client.origem}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processos:</span>
                      <span>{client.cases}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Último contato:</span>
                      <span>{client.lastContact}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClient(client.id);
                          }}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProcesses(client.id, client.name);
                          }}
                        >
                          Ver Processos
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAtendimentos(client.id, client.name);
                          }}
                        >
                          Ver Atendimentos
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewConsultivo(client.id, client.name);
                          }}
                        >
                          Consultivo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
              </>
            )}

            {/* Client Details Modal */}
            <Dialog open={clientDetailsOpen} onOpenChange={setClientDetailsOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedClient?.tipoPessoa === "fisica" ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Building className="h-5 w-5" />
                    )}
                    {selectedClient?.name}
                  </DialogTitle>
                </DialogHeader>
                {selectedClient && (
                  <div className="space-y-6">
                    {/* Status and Type */}
                    <div className="flex items-center gap-4">
                      <Badge variant={selectedClient.status === "ativo" ? "default" : "secondary"}>
                        {selectedClient.status}
                      </Badge>
                      <Badge variant="outline">
                        {selectedClient.tipoPessoa === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
                      </Badge>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Informações de Contato</h3>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedClient.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedClient.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedClient.endereco}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Detalhes</h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {selectedClient.tipoPessoa === "fisica" ? "CPF:" : "CNPJ:"}
                          </span>
                          <span>{selectedClient.cpfCnpj}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Origem:</span>
                          <span>{selectedClient.origem}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Processos:</span>
                          <span>{selectedClient.cases}</span>
                        </div>
                        {selectedClient.dataAniversario && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Aniversário: {new Date(selectedClient.dataAniversario).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setClientDetailsOpen(false);
                          handleEditClient(selectedClient.id);
                        }}
                      >
                        Editar Cliente
                      </Button>
                      <Button 
                        onClick={() => {
                          setClientDetailsOpen(false);
                          handleViewProcesses(selectedClient.id, selectedClient.name);
                        }}
                      >
                        Ver Processos
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => {
                          setClientDetailsOpen(false);
                          handleViewAtendimentos(selectedClient.id, selectedClient.name);
                        }}
                      >
                        Ver Atendimentos
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => {
                          setClientDetailsOpen(false);
                          handleViewConsultivo(selectedClient.id, selectedClient.name);
                        }}
                      >
                        Consultivo
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

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
