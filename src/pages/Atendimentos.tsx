import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCheck, Calendar, Clock, User, Filter, X, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EditAtendimentoDialog } from "@/components/Atendimentos/EditAtendimentoDialog";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { initialAtendimentosData } from "@/utils/initialData";
import { useDataState } from "@/hooks/useDataState";
import { useMultiSelect } from "@/hooks/useMultiSelect";

interface Atendimento {
  id: string;
  cliente: string;
  clienteId: number;
  tipo: string;
  data: string;
  horario: string;
  status: string;
  duracao: string;
  observacoes: string;
}


const getStatusColor = (status: string) => {
  switch (status) {
    case "Agendado":
      return "bg-accent text-accent-foreground";
    case "Confirmado":
      return "bg-blue-500/10 text-blue-500";
    case "Concluído":
      return "bg-green-500/10 text-green-500";
    case "Pendente":
      return "bg-yellow-500/10 text-yellow-500";
    case "Cancelado":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Atendimentos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: atendimentos, isNewUser, loadSampleData, updateData } = useDataState(initialAtendimentosData);
  const [atendimentosFiltrados, setAtendimentosFiltrados] = useState<Atendimento[]>(atendimentos);
  const [filtroCliente, setFiltroCliente] = useState<string | null>(null);
  const [editingAtendimento, setEditingAtendimento] = useState<Atendimento | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const multiSelect = useMultiSelect(atendimentosFiltrados);

  useEffect(() => {
    // Verifica se veio um filtro de cliente da navegação
    const clientFilter = location.state?.clientFilter;
    if (clientFilter) {
      setFiltroCliente(clientFilter);
    }
  }, [location]);

  useEffect(() => {
    // Filtra atendimentos baseado no cliente selecionado
    if (filtroCliente) {
      const atendimentosFiltrados = atendimentos.filter(atendimento => 
        atendimento.cliente.toLowerCase().includes(filtroCliente.toLowerCase())
      );
      setAtendimentosFiltrados(atendimentosFiltrados);
    } else {
      setAtendimentosFiltrados(atendimentos);
    }
  }, [atendimentos, filtroCliente]);

  // Atualizar lista filtrada quando dados do hook mudarem
  useEffect(() => {
    if (!filtroCliente) {
      setAtendimentosFiltrados(atendimentos);
    }
  }, [atendimentos, filtroCliente]);

  const handleEditAtendimento = (atendimento: Atendimento) => {
    setEditingAtendimento(atendimento);
    setEditDialogOpen(true);
  };

  const handleSaveAtendimento = (updatedAtendimento: Atendimento) => {
    const updatedList = atendimentos.map(a => 
      a.id === updatedAtendimento.id ? updatedAtendimento : a
    );
    updateData(updatedList);
    toast({
      title: "Atendimento atualizado",
      description: `O atendimento ${updatedAtendimento.tipo} foi atualizado com sucesso.`,
    });
  };

  const handleDeleteSelected = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedItems = multiSelect.getSelectedItems();
      const updatedList = atendimentos.filter(a => !multiSelect.isSelected(a.id));
      updateData(updatedList);
      multiSelect.clearSelection();
      
      toast({
        title: "Atendimentos excluídos",
        description: `${selectedItems.length} atendimento(s) foram excluído(s) com sucesso.`,
      });
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

  const limparFiltro = () => {
    setFiltroCliente(null);
  };

  const voltarParaClientes = () => {
    navigate('/clientes');
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {filtroCliente && (
              <Button
                variant="ghost"
                size="sm"
                onClick={voltarParaClientes}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Atendimentos</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie seus atendimentos e consultas com clientes.
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
          {filtroCliente && (
            <Button
              variant="outline"
              onClick={voltarParaClientes}
              className="w-full sm:w-auto"
            >
              Voltar para Clientes
            </Button>
          )}
          <Button className="flex items-center gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Novo Atendimento</span>
          </Button>
        </div>
      </div>

      {/* Filtro de Cliente Ativo */}
      {filtroCliente && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary">
            Mostrando atendimentos de: <strong>{filtroCliente}</strong>
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

      {/* Estatísticas dos Atendimentos Filtrados */}
      {filtroCliente && (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {atendimentosFiltrados.filter(a => a.status === "Agendado" || a.status === "Confirmado").length}
              </div>
              <p className="text-sm text-muted-foreground">Próximos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {atendimentosFiltrados.filter(a => a.status === "Concluído").length}
              </div>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {atendimentosFiltrados.filter(a => a.status === "Pendente").length}
              </div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {atendimentosFiltrados.length}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State for New Users */}
      {isNewUser && atendimentosFiltrados.length === 0 && !filtroCliente && (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum atendimento cadastrado</h3>
            <p className="text-muted-foreground mb-6">
              Comece agendando seu primeiro atendimento ou carregue dados de exemplo.
            </p>
            <div className="flex gap-2 justify-center">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agendar Primeiro Atendimento
              </Button>
              <Button variant="outline" onClick={loadSampleData}>
                Ver Dados de Exemplo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Controls */}
      {atendimentosFiltrados.length > 0 && (
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
                `${multiSelect.selectedCount} de ${atendimentosFiltrados.length} selecionado(s)`
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

      {/* Atendimentos Grid */}
      <div className="grid gap-4 md:gap-6">
        {atendimentosFiltrados.length === 0 && (!isNewUser || filtroCliente) ? (
          <Card>
            <CardContent className="p-8 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum atendimento encontrado</h3>
              <p className="text-muted-foreground">
                {filtroCliente 
                  ? `Não há atendimentos cadastrados para ${filtroCliente}.`
                  : "Não há atendimentos cadastrados no sistema."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          atendimentosFiltrados.map((atendimento) => (
            <Card key={atendimento.id} className={`hover:shadow-md transition-shadow group ${
              multiSelect.isSelected(atendimento.id) ? "ring-2 ring-primary" : ""
            }`}>
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Checkbox
                      checked={multiSelect.isSelected(atendimento.id)}
                      onCheckedChange={() => multiSelect.toggleItem(atendimento.id)}
                      className="mr-2"
                    />
                    <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                    <span className="truncate">{atendimento.tipo}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditAtendimento(atendimento)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Badge className={getStatusColor(atendimento.status)}>
                      {atendimento.status}
                    </Badge>
                    <span className="text-xs md:text-sm text-muted-foreground">#{atendimento.id}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent 
                className="p-4 pt-0 md:p-6 md:pt-0 cursor-pointer"
                onClick={() => handleEditAtendimento(atendimento)}
              >
                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium text-sm md:text-base truncate">{atendimento.cliente}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Data</p>
                      <p className="font-medium text-sm md:text-base">{new Date(atendimento.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-muted-foreground">Horário</p>
                      <p className="font-medium text-sm md:text-base text-accent">{atendimento.horario}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Duração</p>
                    <p className="font-medium text-sm md:text-base">{atendimento.duracao}</p>
                  </div>
                </div>
                {atendimento.observacoes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Observações:</p>
                    <p className="text-sm md:text-base text-foreground">{atendimento.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
        description={`Tem certeza que deseja excluir ${multiSelect.selectedCount} atendimento(s)? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Atendimentos;
