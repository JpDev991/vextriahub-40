import { useState } from "react";
// Removed duplicate sidebar imports as they're already provided by AppLayout
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Calendar } from "lucide-react";
import { DemandGoalsConfig } from "@/components/Goals/DemandGoalsConfig";

const Metas = () => {
  const [activeTab, setActiveTab] = useState("individuais");

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Metas</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Defina e acompanhe suas metas profissionais
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="individuais" className="cursor-pointer">Individuais</TabsTrigger>
                <TabsTrigger value="demandas" className="cursor-pointer">Por Demanda</TabsTrigger>
                <TabsTrigger value="escritorio" className="cursor-pointer">Escritório</TabsTrigger>
              </TabsList>

              <TabsContent value="individuais" className="space-y-4">
                <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Metas Mensais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Processos Finalizados</span>
                          <span className="text-sm font-medium">12/15</span>
                        </div>
                        <Progress value={80} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Novos Clientes</span>
                          <span className="text-sm font-medium">8/10</span>
                        </div>
                        <Progress value={80} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Receita (R$)</span>
                          <span className="text-sm font-medium">45.000/50.000</span>
                        </div>
                        <Progress value={90} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Definir Nova Meta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="meta-tipo">Tipo de Meta</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="processos">Processos</SelectItem>
                            <SelectItem value="clientes">Clientes</SelectItem>
                            <SelectItem value="receita">Receita</SelectItem>
                            <SelectItem value="audiencias">Audiências</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meta-valor">Valor da Meta</Label>
                        <Input id="meta-valor" placeholder="Ex: 20" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meta-periodo">Período</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full">Criar Meta</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="demandas" className="space-y-4">
                <DemandGoalsConfig />
              </TabsContent>

              <TabsContent value="escritorio" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Metas do Escritório
                    </CardTitle>
                    <CardDescription>
                      Objetivos gerais e indicadores de desempenho
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-medium">Indicadores Financeiros</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Faturamento Mensal</span>
                              <span>R$ 180.000 / R$ 200.000</span>
                            </div>
                            <Progress value={90} className="mt-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Margem de Lucro</span>
                              <span>68% / 70%</span>
                            </div>
                            <Progress value={97} className="mt-1" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">Indicadores Operacionais</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Novos Processos</span>
                              <span>45 / 50</span>
                            </div>
                            <Progress value={90} className="mt-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Satisfação Clientes</span>
                              <span>92% / 95%</span>
                            </div>
                            <Progress value={97} className="mt-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
    </div>
  );
};

export default Metas;
