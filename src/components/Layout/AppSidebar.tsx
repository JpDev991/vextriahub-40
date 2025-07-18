import { useState } from "react";
import { 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  BookOpen,
  Settings,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Tag,
  BarChart3,
  UserPlus,
  CalendarDays,
  DollarSign,
  Target,
  UsersIcon,
  MessageSquareText,
  Shield,
  Building2,
  AlertCircle
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { usePlanFeatures } from '@/hooks/usePlanFeatures';

const menuItems = [
  { title: "Início", url: "/dashboard", icon: Home },
  { title: "Processos", url: "/processos", icon: FileText },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "CRM", url: "/crm", icon: UserPlus },
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
  { title: "Audiências", url: "/audiencias", icon: Calendar },
  { title: "Equipe", url: "/equipe", icon: UsersIcon },
  { title: "Atendimentos", url: "/atendimentos", icon: UserCheck },
  { title: "Tarefas", url: "/tarefas", icon: Calendar },
  { title: "Prazos", url: "/prazos", icon: AlertCircle },
  { title: "Publicações", url: "/publicacoes", icon: BookOpen },
  { title: "Consultivo", url: "/consultivo", icon: MessageSquareText },
  { title: "Gráficos", url: "/graficos", icon: BarChart3 },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Etiquetas", url: "/etiquetas", icon: Tag },
];

const bottomItems = [
  { title: "Perfil", url: "/perfil", icon: UserCircle },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { logout } = useAuth();
  const { toast } = useToast();
  const { canViewAdmin, canManageOffice } = usePermissions();
  const { isSuperAdmin } = useAuth();

  const handleLogout = () => {
    console.log("Logout clicado - AppSidebar");
    
    // Usar a função logout do contexto
    logout();
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2.5 md:py-2 rounded-lg transition-all duration-200 text-sm md:text-base w-full ${
      isActive 
        ? "bg-primary text-primary-foreground font-medium shadow-sm" 
        : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
    }`;

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-sidebar-border">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center">
              <span className="text-lg md:text-xl font-bold text-primary">VextriaHub</span>
            </div>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8"
              onClick={toggleSidebar}
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3 md:h-4 md:w-4" /> : <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />}
            </Button>
          )}
        </div>

        <SidebarContent className="flex-1 px-2 md:px-3">
          <SidebarGroup>
            <SidebarGroupLabel className={`text-xs md:text-sm px-2 ${(isCollapsed && !isMobile) ? "sr-only" : ""}`}>
              Menu Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink to={item.url} end className={getNavClasses}>
                        <item.icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        {(!isCollapsed || isMobile) && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-3 md:my-4" />

          {/* Menu de Administração */}
          {(canViewAdmin || canManageOffice) && (
            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs md:text-sm px-2 ${(isCollapsed && !isMobile) ? "sr-only" : ""}`}>
                Administração
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {canViewAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="p-0">
                        <NavLink to="/admin" className={getNavClasses}>
                          <Shield className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                          {(!isCollapsed || isMobile) && <span className="truncate">
                            {isSuperAdmin ? 'Admin Global' : 'Administração'}
                          </span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {canManageOffice && !isSuperAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className="p-0">
                        <NavLink to="/escritorio" className={getNavClasses}>
                          <Building2 className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                          {(!isCollapsed || isMobile) && <span className="truncate">Meu Escritório</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {(canViewAdmin || canManageOffice) && <Separator className="my-3 md:my-4" />}

          <SidebarGroup>
            <SidebarGroupLabel className={`text-xs md:text-sm px-2 ${(isCollapsed && !isMobile) ? "sr-only" : ""}`}>
              Configurações
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="p-0">
                      <NavLink to={item.url} className={getNavClasses}>
                        <item.icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                        {(!isCollapsed || isMobile) && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <div className="p-3 md:p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-sm md:text-base p-2 md:p-3"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
            {(!isCollapsed || isMobile) && <span className="ml-2 truncate">Sair</span>}
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}
