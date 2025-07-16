// Removed duplicate sidebar imports as they're already provided by AppLayout
import { UserCheck, Phone, Mail, Building2, Calendar, Filter, Search, Plus, Users, Target, TrendingUp, BarChart3, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";



const getStatusColor = (status: string) => {
  switch (status) {
    case "quente": return "bg-red-100 text-red-800";
    case "morno": return "bg-yellow-100 text-yellow-800";
    case "frio": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
};



export default function Crm() {
  const [activeTab, setActiveTab] = useState("leads");
  const [currentView, setCurrentView] = useState("main");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [editingHistoryItem, setEditingHistoryItem] = useState(null);
  const [showNewHistoryDialog, setShowNewHistoryDialog] = useState(false);
  const [newHistoryForm, setNewHistoryForm] = useState({
    title: '',
    date: '',
    description: '',
    details: '',
    type: 'meeting',
    status: 'completed'
  });

  const handleMenuClick = (view: string) => {
    console.log(`Navegando para: ${view}`);
    setCurrentView(view);
    setActiveTab("leads");
  };

  const handleCardClick = (view: string) => {
    console.log(`Card clicado: ${view}`);
    setCurrentView(view);
    setActiveTab("leads");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
    setActiveTab("leads");
  };

  const handleOpportunityClick = (opportunity) => {
    console.log(`Oportunidade clicada: ${opportunity.id}`);
    setSelectedOpportunity(opportunity);
    setCurrentView("opportunity-detail");
  };

  const handleHistoryItemClick = (historyItem) => {
    console.log(`Item do histórico clicado: ${historyItem.title}`);
    setSelectedHistoryItem(historyItem);
  };

  const handleEditHistoryItem = (historyItem) => {
    setEditingHistoryItem(historyItem);
  };

  const handleSaveHistoryEdit = () => {
    if (editingHistoryItem) {
      setHistoryItems(prev => 
        prev.map(item => 
          item.id === editingHistoryItem.id ? editingHistoryItem : item
        )
      );
      setEditingHistoryItem(null);
    }
  };

  const handleDeleteHistoryItem = (historyItemId) => {
    setHistoryItems(prev => prev.filter(item => item.id !== historyItemId));
  };

  const handleCreateNewHistory = () => {
    const newId = Math.max(...historyItems.map(item => item.id)) + 1;
    const newItem = {
      id: newId,
      ...newHistoryForm
    };
    setHistoryItems(prev => [...prev, newItem]);
    setNewHistoryForm({
      title: '',
      date: '',
      description: '',
      details: '',
      type: 'meeting',
      status: 'completed'
    });
    setShowNewHistoryDialog(false);
  };

  const renderSpecificView = () => {
    switch (currentView) {
      case "leads":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">Todos os Leads</h2>
                <p className="text-sm md:text-base text-muted-foreground">Lista completa de leads</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Todos os Leads (0)</CardTitle>
                <CardDescription className="text-sm">Gerencie todos os seus leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[].map((lead) => (
                    <div key={lead.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">{lead.name}</div>
                          <div className="text-xs md:text-sm text-gray-500">{lead.company}</div>
                          <div className="text-xs text-gray-400">Último contato: {lead.lastContact}</div>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:text-right">
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {lead.phone}
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end gap-2">
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">{lead.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "leads-quentes":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">Leads Quentes</h2>
                <p className="text-sm md:text-base text-muted-foreground">Leads com alta probabilidade de conversão</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Leads Quentes (0)</CardTitle>
                <CardDescription className="text-sm">Leads prioritários para acompanhamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[].map((lead) => (
                    <div key={lead.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">{lead.name}</div>
                          <div className="text-xs md:text-sm text-gray-500">{lead.company}</div>
                          <div className="text-xs text-gray-400">Último contato: {lead.lastContact}</div>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:text-right">
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {lead.phone}
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end gap-2">
                          <Badge className="bg-red-100 text-red-800">
                            Quente
                          </Badge>
                          <span className="text-sm font-medium text-green-600">{lead.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "conversoes":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">Conversões</h2>
                <p className="text-sm md:text-base text-muted-foreground">Leads convertidos em clientes</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Clientes Convertidos (0)</CardTitle>
                <CardDescription className="text-sm">Leads que se tornaram clientes pagantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[].map((cliente) => (
                    <div key={cliente.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">{cliente.name}</div>
                          <div className="text-xs md:text-sm text-gray-500">{cliente.company}</div>
                          <div className="text-xs text-gray-400">{cliente.cases} casos ativos</div>
                        </div>
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:text-right">
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            <span className="truncate">{cliente.email}</span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {cliente.phone}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600 text-sm md:text-base">{cliente.value}</div>
                          <div className="text-xs md:text-sm text-gray-500">Valor total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "receita-potencial":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">Receita Potencial</h2>
                <p className="text-sm md:text-base text-muted-foreground">Pipeline de vendas e oportunidades</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pipeline Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[].map((opp) => (
                      <div key={opp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{opp.lead}</div>
                          <div className="text-xs text-gray-500">{opp.company}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">{opp.value}</div>
                          <div className="text-xs text-gray-500">{opp.probability}% prob.</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Receita Confirmada:</span>
                      <span className="font-medium text-green-600">R$ 40.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Receita Potencial:</span>
                      <span className="font-medium text-blue-600">R$ 70.000</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Pipeline:</span>
                      <span className="font-bold text-lg">R$ 110.000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "funil-vendas":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">Funil de Vendas</h2>
                <p className="text-sm md:text-base text-muted-foreground">Visualize o pipeline completo de vendas</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Pipeline de Conversão</CardTitle>
                <CardDescription className="text-sm">Acompanhe o progresso dos leads pelo funil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="p-4 md:p-6 border rounded-lg bg-blue-50 text-center">
                    <h4 className="font-medium text-blue-800 text-sm md:text-base">Prospecção</h4>
                    <div className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">
                      {0}
                    </div>
                    <p className="text-xs md:text-sm text-blue-600">leads novos</p>
                  </div>
                  <div className="p-4 md:p-6 border rounded-lg bg-indigo-50 text-center">
                    <h4 className="font-medium text-indigo-800 text-sm md:text-base">Qualificação</h4>
                    <div className="text-2xl md:text-3xl font-bold text-indigo-600 mt-2">
                      {0}
                    </div>
                    <p className="text-xs md:text-sm text-indigo-600">leads qualificados</p>
                  </div>
                  <div className="p-4 md:p-6 border rounded-lg bg-yellow-50 text-center">
                    <h4 className="font-medium text-yellow-800 text-sm md:text-base">Proposta</h4>
                    <div className="text-2xl md:text-3xl font-bold text-yellow-600 mt-2">
                      {0}
                    </div>
                    <p className="text-xs md:text-sm text-yellow-600">propostas enviadas</p>
                  </div>
                  <div className="p-4 md:p-6 border rounded-lg bg-orange-50 text-center">
                    <h4 className="font-medium text-orange-800 text-sm md:text-base">Negociação</h4>
                    <div className="text-2xl md:text-3xl font-bold text-orange-600 mt-2">
                      {0}
                    </div>
                    <p className="text-xs md:text-sm text-orange-600">em negociação</p>
                  </div>
                  <div className="p-4 md:p-6 border rounded-lg bg-green-50 text-center">
                    <h4 className="font-medium text-green-800 text-sm md:text-base">Fechamento</h4>
                    <div className="text-2xl md:text-3xl font-bold text-green-600 mt-2">
                      {0}
                    </div>
                    <p className="text-xs md:text-sm text-green-600">vendas fechadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Leads por Estágio</CardTitle>
                <CardDescription className="text-sm">Detalhamento dos leads em cada fase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento'].map((stage) => {
                    const stageLeads = [];
                    const stageNames = {
                      prospeccao: 'Prospecção',
                      qualificacao: 'Qualificação',
                      proposta: 'Proposta',
                      negociacao: 'Negociação',
                      fechamento: 'Fechamento'
                    };
                    
                    if (stageLeads.length > 0) {
                      return (
                        <div key={stage} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3">{stageNames[stage]} ({stageLeads.length})</h4>
                          <div className="space-y-2">
                            {stageLeads.map((lead) => (
                              <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded gap-2">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <UserCheck className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{lead.name}</div>
                                    <div className="text-xs text-gray-500">{lead.company}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge className={getStatusColor(lead.status)}>
                                    {lead.status}
                                  </Badge>
                                  <span className="text-sm font-medium text-green-600">{lead.value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "oportunidades":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">Oportunidades</h2>
                <p className="text-sm md:text-base text-muted-foreground">Gerencie oportunidades ativas</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Oportunidades em Andamento</CardTitle>
                <CardDescription className="text-sm">Lista de oportunidades com maior potencial</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[].map((opportunity) => (
                    <div 
                      key={opportunity.id} 
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4 cursor-pointer transition-colors"
                      onClick={() => handleOpportunityClick(opportunity)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">{opportunity.lead} - {opportunity.company}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            Próxima ação: {opportunity.nextAction} • Prazo: {opportunity.dueDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium text-green-600 text-sm md:text-base">{opportunity.value}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">Valor estimado</div>
                        </div>
                        <Badge className={
                          opportunity.probability >= 80 ? "bg-green-100 text-green-800" :
                          opportunity.probability >= 60 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {opportunity.probability}% probabilidade
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "opportunity-detail":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={() => setCurrentView("oportunidades")} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar às Oportunidades
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">{selectedOpportunity?.lead}</h2>
                <p className="text-sm md:text-base text-muted-foreground">{selectedOpportunity?.company}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes da Oportunidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Valor:</span>
                    <span className="text-green-600 font-semibold">{selectedOpportunity?.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Probabilidade:</span>
                    <Badge className={
                      selectedOpportunity?.probability >= 80 ? "bg-green-100 text-green-800" :
                      selectedOpportunity?.probability >= 60 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {selectedOpportunity?.probability}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Estágio:</span>
                    <span className="text-sm capitalize">{selectedOpportunity?.stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Prazo:</span>
                    <span className="text-sm">{selectedOpportunity?.dueDate}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Próximas Ações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800 text-sm">Próxima Ação</div>
                      <div className="text-sm text-blue-600">{selectedOpportunity?.nextAction}</div>
                      <div className="text-xs text-blue-500 mt-1">Prazo: {selectedOpportunity?.dueDate}</div>
                    </div>
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Follow-up
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar E-mail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Histórico de Interações</CardTitle>
                <Button onClick={() => setShowNewHistoryDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Histórico
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historyItems.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-start gap-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg group hover:bg-blue-100 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        item.type === 'meeting' ? 'bg-blue-500' : 
                        item.type === 'proposal' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1 cursor-pointer" onClick={() => handleHistoryItemClick(item)}>
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.date} - {item.description}</div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditHistoryItem(item);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHistoryItem(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Modal de Detalhes do Histórico */}
            <Dialog open={!!selectedHistoryItem} onOpenChange={() => setSelectedHistoryItem(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedHistoryItem?.title}</DialogTitle>
                  <DialogDescription>
                    {selectedHistoryItem?.date} - {selectedHistoryItem?.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Detalhes da Interação</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedHistoryItem?.details}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={selectedHistoryItem?.status === 'completed' ? 'default' : 'secondary'}>
                      {selectedHistoryItem?.status === 'completed' ? 'Concluído' : 
                       selectedHistoryItem?.status === 'pending' ? 'Pendente' : 'Agendado'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Tipo: {selectedHistoryItem?.type === 'meeting' ? 'Reunião' : 
                            selectedHistoryItem?.type === 'proposal' ? 'Proposta' : 'Negociação'}
                    </span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Modal de Edição de Histórico */}
            <Dialog open={!!editingHistoryItem} onOpenChange={() => setEditingHistoryItem(null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Histórico</DialogTitle>
                  <DialogDescription>
                    Edite as informações do histórico de interação
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Título</Label>
                    <Input
                      id="edit-title"
                      value={editingHistoryItem?.title || ''}
                      onChange={(e) => setEditingHistoryItem(prev => prev ? {...prev, title: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Data</Label>
                    <Input
                      id="edit-date"
                      value={editingHistoryItem?.date || ''}
                      onChange={(e) => setEditingHistoryItem(prev => prev ? {...prev, date: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Input
                      id="edit-description"
                      value={editingHistoryItem?.description || ''}
                      onChange={(e) => setEditingHistoryItem(prev => prev ? {...prev, description: e.target.value} : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-details">Detalhes</Label>
                    <Textarea
                      id="edit-details"
                      value={editingHistoryItem?.details || ''}
                      onChange={(e) => setEditingHistoryItem(prev => prev ? {...prev, details: e.target.value} : null)}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-type">Tipo</Label>
                      <Select 
                        value={editingHistoryItem?.type || 'meeting'}
                        onValueChange={(value) => setEditingHistoryItem(prev => prev ? {...prev, type: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meeting">Reunião</SelectItem>
                          <SelectItem value="proposal">Proposta</SelectItem>
                          <SelectItem value="negotiation">Negociação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select 
                        value={editingHistoryItem?.status || 'completed'}
                        onValueChange={(value) => setEditingHistoryItem(prev => prev ? {...prev, status: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingHistoryItem(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveHistoryEdit}>
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Modal de Novo Histórico */}
            <Dialog open={showNewHistoryDialog} onOpenChange={setShowNewHistoryDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Histórico</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova interação ao histórico
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-title">Título</Label>
                    <Input
                      id="new-title"
                      value={newHistoryForm.title}
                      onChange={(e) => setNewHistoryForm(prev => ({...prev, title: e.target.value}))}
                      placeholder="Ex: Reunião de apresentação"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-date">Data</Label>
                    <Input
                      id="new-date"
                      value={newHistoryForm.date}
                      onChange={(e) => setNewHistoryForm(prev => ({...prev, date: e.target.value}))}
                      placeholder="Ex: 25/01/2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-description">Descrição</Label>
                    <Input
                      id="new-description"
                      value={newHistoryForm.description}
                      onChange={(e) => setNewHistoryForm(prev => ({...prev, description: e.target.value}))}
                      placeholder="Ex: Reunião para apresentar proposta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-details">Detalhes</Label>
                    <Textarea
                      id="new-details"
                      value={newHistoryForm.details}
                      onChange={(e) => setNewHistoryForm(prev => ({...prev, details: e.target.value}))}
                      placeholder="Descreva os detalhes da interação..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-type">Tipo</Label>
                      <Select 
                        value={newHistoryForm.type}
                        onValueChange={(value) => setNewHistoryForm(prev => ({...prev, type: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="meeting">Reunião</SelectItem>
                          <SelectItem value="proposal">Proposta</SelectItem>
                          <SelectItem value="negotiation">Negociação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-status">Status</Label>
                      <Select 
                        value={newHistoryForm.status}
                        onValueChange={(value) => setNewHistoryForm(prev => ({...prev, status: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewHistoryDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateNewHistory}>
                    Criar Histórico
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );

      case "relatorios":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">Relatórios</h2>
                <p className="text-sm md:text-base text-muted-foreground">Análises detalhadas de performance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Performance Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-green-600">127%</div>
                  <p className="text-xs md:text-sm text-muted-foreground">da meta atingida</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {0} leads ativos • {0} clientes
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">Tempo Médio de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">15</div>
                  <p className="text-xs md:text-sm text-muted-foreground">dias</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">340%</div>
                  <p className="text-xs md:text-sm text-muted-foreground">retorno sobre investimento</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Desempenho por Lead</CardTitle>
                <CardDescription className="text-sm">Análise individual dos leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[].map((lead) => (
                    <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{lead.name}</div>
                          <div className="text-xs text-muted-foreground">{lead.company}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                        <span className="text-sm font-medium">{lead.value}</span>
                        <span className="text-xs text-muted-foreground">Último contato: {lead.lastContact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "metas":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">Metas</h2>
                <p className="text-sm md:text-base text-muted-foreground">Acompanhe o progresso das metas</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Metas do Mês</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm md:text-base">
                    <span>Novos Leads</span>
                    <span>15/20</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm md:text-base">
                    <span>Conversões</span>
                    <span>8/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "email-marketing":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">E-mail Marketing</h2>
                <p className="text-sm md:text-base text-muted-foreground">Campanhas automatizadas</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Campanhas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm md:text-base">Campanha de Nutrição</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Taxa de abertura: 24%</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 w-fit">Ativo</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm md:text-base">Newsletter Semanal</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Taxa de abertura: 18%</div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 w-fit">Agendado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "follow-up":
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button variant="outline" onClick={handleBackToMain} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao CRM
              </Button>
              <div className="w-full sm:w-auto">
                <h2 className="text-xl md:text-2xl font-bold">Follow-up</h2>
                <p className="text-sm md:text-base text-muted-foreground">Lembretes automáticos</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Próximos Follow-ups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm md:text-base">João Silva - Tech Corp</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Agendar reunião de apresentação</div>
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Hoje, 14:00</div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm md:text-base">Maria Santos - Legal Firm</div>
                      <div className="text-xs md:text-sm text-muted-foreground">Enviar proposta comercial</div>
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Amanhã, 09:00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (currentView !== "main") {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {renderSpecificView()}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">CRM</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Gerencie seus leads e relacionamentos</p>
                  </div>
                </div>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Lead
                </Button>
              </div>

              {/* Navigation Menu */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-center">
                      Pipeline
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]">
                    <DropdownMenuItem 
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onSelect={() => handleMenuClick("funil-vendas")}
                    >
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Funil de Vendas</div>
                        <div className="text-sm text-muted-foreground">Visualize o pipeline completo</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onSelect={() => handleMenuClick("oportunidades")}
                    >
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Oportunidades</div>
                        <div className="text-sm text-muted-foreground">Gerencie oportunidades ativas</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-center">
                      Análises
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]">
                    <DropdownMenuItem 
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onSelect={() => handleMenuClick("relatorios")}
                    >
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Relatórios</div>
                        <div className="text-sm text-muted-foreground">Análises detalhadas de performance</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onSelect={() => handleMenuClick("metas")}
                    >
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Metas</div>
                        <div className="text-sm text-muted-foreground">Acompanhe o progresso das metas</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-center">
                      Automação
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]">
                    <DropdownMenuItem 
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onSelect={() => handleMenuClick("email-marketing")}
                    >
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">E-mail Marketing</div>
                        <div className="text-sm text-muted-foreground">Campanhas automatizadas</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      onSelect={() => handleMenuClick("follow-up")}
                    >
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Follow-up</div>
                        <div className="text-sm text-muted-foreground">Lembretes automáticos</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" className="w-full sm:w-auto">
                  Configurações
                </Button>
              </div>

              {/* Stats Cards - Agora funcionais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => handleCardClick("leads")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl md:text-2xl font-bold">{0}</div>
                    <p className="text-xs text-muted-foreground">Clique para ver todos</p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => handleCardClick("leads-quentes")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Leads Quentes</CardTitle>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl md:text-2xl font-bold">{0}</div>
                    <p className="text-xs text-muted-foreground">Clique para ver detalhes</p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => handleCardClick("conversoes")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversões</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl md:text-2xl font-bold">{0}</div>
                    <p className="text-xs text-muted-foreground">Clique para ver clientes</p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => handleCardClick("receita-potencial")}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Potencial</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl md:text-2xl font-bold">R$ 110.000</div>
                    <p className="text-xs text-muted-foreground">Clique para ver pipeline</p>
                  </CardContent>
                </Card>
              </div>

              {/* Content Tabs - Apenas mostrado na view principal */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <TabsList className="grid w-full sm:w-auto grid-cols-2">
                    <TabsTrigger value="leads">Leads</TabsTrigger>
                    <TabsTrigger value="clientes">Clientes</TabsTrigger>
                  </TabsList>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                    <div className="relative flex-1 sm:max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input placeholder="Buscar..." className="pl-10" />
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>

                <TabsContent value="leads">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl">Leads Ativos</CardTitle>
                      <CardDescription className="text-sm">
                        Gerencie seus leads e oportunidades de negócio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[].map((lead: any) => (
                          <div key={lead.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium text-sm md:text-base">{lead.name}</div>
                                <div className="text-xs md:text-sm text-gray-500">{lead.company}</div>
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:text-right">
                                <div className="flex items-center text-xs md:text-sm text-gray-500">
                                  <Mail className="h-4 w-4 mr-1" />
                                  <span className="truncate">{lead.email}</span>
                                </div>
                                <div className="flex items-center text-xs md:text-sm text-gray-500">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {lead.phone}
                                </div>
                              </div>
                              <div className="flex items-center justify-between lg:justify-end gap-2">
                                <Badge className={getStatusColor(lead.status)}>
                                  {lead.status}
                                </Badge>
                                <div className="text-xs md:text-sm text-gray-500">
                                  {lead.lastContact}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="clientes">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg md:text-xl">Clientes Ativos</CardTitle>
                      <CardDescription className="text-sm">
                        Clientes que já contrataram seus serviços
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[].map((cliente) => (
                          <div key={cliente.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <UserCheck className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-sm md:text-base">{cliente.name}</div>
                                <div className="text-xs md:text-sm text-gray-500">{cliente.company}</div>
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:text-right">
                                <div className="flex items-center text-xs md:text-sm text-gray-500">
                                  <Mail className="h-4 w-4 mr-1" />
                                  <span className="truncate">{cliente.email}</span>
                                </div>
                                <div className="flex items-center text-xs md:text-sm text-gray-500">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {cliente.phone}
                                </div>
                              </div>
                              <div className="flex items-center justify-between lg:justify-end gap-4">
                                <div className="text-center">
                                  <div className="font-medium text-green-600 text-sm md:text-base">{cliente.value}</div>
                                  <div className="text-xs md:text-sm text-gray-500">{cliente.cases} casos</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
      </div>
    </div>
  );
}
