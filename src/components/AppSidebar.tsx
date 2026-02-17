import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  UserPlus,
  BarChart3,
  Briefcase,
  Plus,
  ChevronDown,
  Settings,
  FileText,
  History,
  LayoutTemplate,
  Trophy,
  Timer,
  Flame,
  Calendar,
} from "lucide-react";
import { useGestor } from "@/contexts/GestorContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import VCDLogo from "./VCDLogo";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { agencia } = useGestor();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const menuItems = {
    main: [
      { title: "Dashboard", icon: Home, path: "/dashboard" },
      { title: "Gerencial", icon: BarChart3, path: "/gerencial" },
      { title: "Controle", icon: FileText, path: "/controle" },
      { title: "Calendário", icon: Calendar, path: "/calendario" },
      { title: "Produtividade", icon: Timer, path: "/produtividade" },
      { title: "Previsão Saldo", icon: Flame, path: "/previsao-saldo" },
      { title: "Conquistas", icon: Trophy, path: "/conquistas" },
    ],
    clientes: [
      { title: "Ver Clientes", icon: Users, path: "/clientes" },
      { title: "Novo Cliente", icon: Plus, path: "/novo-cliente" },
    ],
    relatorios: [
      { title: "Novo Relatório", icon: Plus, path: "/relatorio-cliente" },
      { title: "Modelos", icon: LayoutTemplate, path: "/modelos" },
      { title: "Histórico", icon: History, path: "/historico" },
    ],
    gestores: [
      { title: "Ver Gestores", icon: Briefcase, path: "/gestores" },
      { title: "Novo Gestor", icon: UserPlus, path: "/novo-gestor" },
    ],
    config: [
      { title: "Configurações", icon: Settings, path: "/configuracoes" },
    ],
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      {/* Header */}
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          {agencia?.logo_url ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-primary/20">
                <img src={agencia.logo_url} alt={agencia.nome} className="h-full w-full object-contain" />
              </div>
              {!isCollapsed && (
                <span className="font-bold text-sm truncate max-w-[150px] text-foreground">
                  {agencia.nome}
                </span>
              )}
            </div>
          ) : (
            <VCDLogo size="sm" showText={!isCollapsed} />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.main.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200",
                      isActive(item.path) &&
                      "bg-primary/10 text-primary border-l-2 border-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Clientes */}
        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel
              asChild
              className={cn("cursor-pointer", isCollapsed && "sr-only")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <span>Clientes</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.clientes.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={isActive(item.path)}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-200",
                          isActive(item.path) &&
                          "bg-primary/10 text-primary border-l-2 border-primary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Relatórios */}
        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel
              asChild
              className={cn("cursor-pointer", isCollapsed && "sr-only")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <span>Relatórios</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.relatorios.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={isActive(item.path)}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-200",
                          isActive(item.path) &&
                          "bg-primary/10 text-primary border-l-2 border-primary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroupLabel
              asChild
              className={cn("cursor-pointer", isCollapsed && "sr-only")}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <span>Gestores</span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.gestores.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={isActive(item.path)}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-200",
                          isActive(item.path) &&
                          "bg-primary/10 text-primary border-l-2 border-primary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

      </SidebarContent>

      {/* Footer - Configurações */}
      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu>
          {menuItems.config.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                onClick={() => navigate(item.path)}
                isActive={isActive(item.path)}
                tooltip={item.title}
                className={cn(
                  "transition-all duration-200",
                  isActive(item.path) &&
                  "bg-primary/10 text-primary border-l-2 border-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
