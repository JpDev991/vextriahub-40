
import { Calendar, Clock, Users, MapPin, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const initialAgendaData = {
  hoje: [],
  semana: [],
  compromissos: []
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "audiencia": return "bg-red-100 text-red-800";
    case "reuniao": return "bg-blue-100 text-blue-800";
    case "analise": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmado": return "bg-green-100 text-green-800";
    case "pendente": return "bg-yellow-100 text-yellow-800";
    case "cancelado": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function Agenda() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [agendaData, setAgendaData] = useState(initialAgendaData);
  
  const multiSelect = useMultiSelect(agendaData.hoje);

  const handleDeleteSelected = () => {
    const selectedItems = multiSelect.getSelectedItems();
    const pastEvents = selectedItems.filter(event => {
      const eventDate = new Date();
      eventDate.setHours(parseInt(event.time.split(':')[0]), parseInt(event.time.split(':')[1]));
      return eventDate < new Date();
    });
    
    if (pastEvents.length > 0) {
      toast({
        title: "Não é possível excluir",
        description: "Eventos passados não podem ser excluídos.",
        variant: "destructive",
      });
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedItems = multiSelect.getSelectedItems();
      const selectedIds = selectedItems.map(item => item.id);
      
      // Remover dos dados locais
      const updatedHoje = agendaData.hoje.filter(event => !selectedIds.includes(event.id));
      setAgendaData({
        ...agendaData,
        hoje: updatedHoje
      });
      
      toast({
        title: "Compromissos excluídos",
        description: `${selectedItems.length} compromisso(s) foram excluído(s) com sucesso.`,
      });
      multiSelect.clearSelection();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir os compromissos.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Agenda</h1>
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
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Compromisso
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agendaData.hoje.length}</div>
                  <p className="text-xs text-muted-foreground">compromissos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agendaData.semana.reduce((total, day) => total + (day.events || 0), 0)}</div>
                  <p className="text-xs text-muted-foreground">eventos agendados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Audiências</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agendaData.compromissos.filter(c => c.title?.toLowerCase().includes('audiência')).length}</div>
                  <p className="text-xs text-muted-foreground">próximas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reuniões</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{agendaData.compromissos.filter(c => c.title?.toLowerCase().includes('reunião')).length}</div>
                  <p className="text-xs text-muted-foreground">esta semana</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Calendário</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">Janeiro 2024</span>
                        <Button variant="outline" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                        <div key={day} className="text-center text-sm font-medium p-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 35 }, (_, i) => {
                        const dayNumber = i - 6 + 1;
                        const isCurrentMonth = dayNumber > 0 && dayNumber <= 31;
                        const hasEvents = isCurrentMonth && [15, 16, 17, 18, 19].includes(dayNumber);
                        
                        return (
                          <div
                            key={i}
                            className={`
                              p-2 text-center text-sm border rounded cursor-pointer transition-colors
                              ${isCurrentMonth ? 'hover:bg-gray-50' : 'text-gray-300'}
                              ${hasEvents ? 'bg-primary/10 border-primary/20' : ''}
                              ${dayNumber === 15 ? 'bg-primary text-primary-foreground' : ''}
                            `}
                          >
                            {isCurrentMonth ? dayNumber : ''}
                            {hasEvents && dayNumber !== 15 && (
                              <div className="w-1 h-1 bg-primary rounded-full mx-auto mt-1"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Hoje - 15/01/2024</CardTitle>
                    <CardDescription>Seus compromissos de hoje</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Selection Controls */}
                    {agendaData.hoje.length > 0 && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={multiSelect.isAllSelected}
                            onCheckedChange={() => 
                              multiSelect.isAllSelected ? multiSelect.clearSelection() : multiSelect.selectAll()
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {multiSelect.selectedCount > 0 ? (
                              `${multiSelect.selectedCount} de ${agendaData.hoje.length} selecionado(s)`
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
                    {agendaData.hoje.map((event) => (
                      <div key={event.id} className={`flex items-start space-x-3 p-3 border rounded-lg transition-all duration-200 ${
                        multiSelect.isSelected(event.id) ? "ring-2 ring-primary" : ""
                      }`}>
                        <Checkbox
                          checked={multiSelect.isSelected(event.id)}
                          onCheckedChange={() => multiSelect.toggleItem(event.id)}
                        />
                        <div className="text-sm font-medium text-primary">
                          {event.time}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.client}</div>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </div>
                          <Badge className={`${getTypeColor(event.type)} mt-2 text-xs`}>
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Compromissos</CardTitle>
                    <CardDescription>Agenda da próxima semana</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {agendaData.compromissos.map((compromisso) => (
                      <div key={compromisso.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{compromisso.title}</div>
                          <div className="text-sm text-gray-500">{compromisso.client}</div>
                          <div className="text-xs text-gray-400">
                            {compromisso.date} às {compromisso.time}
                          </div>
                        </div>
                        <Badge className={getStatusColor(compromisso.status)}>
                          {compromisso.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            <DeleteConfirmDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onConfirm={handleConfirmDelete}
              title="Excluir Compromissos"
              description={`Tem certeza que deseja excluir ${multiSelect.selectedCount} compromisso(s)? Esta ação não pode ser desfeita.`}
              isLoading={isDeleting}
            />
        </div>
    </div>
  );
}
