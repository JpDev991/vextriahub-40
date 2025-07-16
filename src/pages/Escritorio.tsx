import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import { AppHeader } from "@/components/Layout/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionGuard } from "@/components/Auth/PermissionGuard";
import { OfficeSettings } from "@/components/Office/OfficeSettings";
import { UserManagement } from "@/components/Office/UserManagement";
import { Building2, Users, Settings } from "lucide-react";

const Escritorio = () => {
  return (
    <PermissionGuard permission="canManageOffice">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Gerenciar Escritório
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Gerencie as configurações e usuários do seu escritório
                </p>
              </div>

              <Tabs defaultValue="configuracoes" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="configuracoes" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </TabsTrigger>
                  <TabsTrigger value="usuarios" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Usuários
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="configuracoes" className="space-y-6">
                  <OfficeSettings />
                </TabsContent>

                <TabsContent value="usuarios" className="space-y-6">
                  <UserManagement />
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </PermissionGuard>
  );
};

export default Escritorio;