
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AutoPublicationFetcher } from "@/components/Publications/AutoPublicationFetcher";
import { BookOpen, Search } from "lucide-react";

export default function Publicacoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const mockPublications = [
    {
      id: "1",
      processNumber: "1234567-89.2023.8.26.0001",
      title: "Citação - João Silva vs. Empresa XYZ Ltda",
      content: "Fica o requerido citado para apresentar contestação no prazo de 15 dias...",
      date: "2023-12-15",
      tags: ["citacao", "urgente"],
      status: "pending" as const
    },
    {
      id: "2", 
      processNumber: "9876543-21.2023.8.26.0002",
      title: "Sentença - Maria Santos vs. Banco ABC",
      content: "Julgo procedente o pedido para condenar o réu ao pagamento de...",
      date: "2023-12-14",
      tags: ["sentenca", "procedente"],
      status: "processed" as const
    }
  ];

  const filteredPublications = mockPublications.filter(pub =>
    pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pub.processNumber.includes(searchTerm) ||
    (selectedTags.length === 0 || selectedTags.some(tag => pub.tags.includes(tag)))
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Publicações</h1>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Busca Automática de Publicações</CardTitle>
                  <CardDescription>
                    Configure a busca automática por publicações usando números CNJ de processos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AutoPublicationFetcher />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Publicações Encontradas
                    <div className="flex gap-2">
                      <Input
                        placeholder="Buscar publicações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPublications.map((publication) => (
                      <Card key={publication.id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{publication.title}</CardTitle>
                              <CardDescription>
                                Processo: {publication.processNumber} • {publication.date}
                              </CardDescription>
                            </div>
                            <Badge variant={publication.status === 'processed' ? 'default' : 'secondary'}>
                              {publication.status === 'processed' ? 'Processada' : 'Pendente'}
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {publication.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {publication.content}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Ver Detalhes
                            </Button>
                            <Button size="sm">
                              Agendar Prazo
                            </Button>
                            <Button size="sm" variant="secondary">
                              Agendar Audiência
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
