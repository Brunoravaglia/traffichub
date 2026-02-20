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
  Sparkles,
  Link2,
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
  const { agencia, gestor } = useGestor();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const menuItems = {
    main: [
      { title: "Dashboard", icon: Home, path: "/dashboard" },
      { title: "Gerencial", icon: BarChart3, path: "/gerencial" },
      { title: "Calendário", icon: Calendar, path: "/calendario" },
      { title: "Produtividade", icon: Timer, path: "/produtividade" },
      { title: "Previsão Saldo", icon: Flame, path: "/previsao-saldo" },
    ],
    gestao: [
      { title: "Clientes", icon: Users, path: "/clientes" },
      { title: "Controle & Checklist", icon: FileText, path: "/controle" },
      { title: "Relatórios & Modelos", icon: LayoutTemplate, path: "/modelos" },
      { title: "Histórico", icon: History, path: "/historico" },
      { title: "Gestores", icon: Briefcase, path: "/gestores" },
      { title: "Conquistas", icon: Trophy, path: "/conquistas" },
    ],
    ferramentas: [
      { title: "Todas Ferramentas", icon: Sparkles, path: "/utilidades" },
      { title: "Simulador Meta", icon: BarChart3, path: "/utilidades/simulador-meta" },
      { title: "Simulador Funil", icon: LayoutTemplate, path: "/utilidades/simulador-funil" },
      { title: "Gerador de UTMs", icon: Link2, path: "/utilidades/gerador-utm" },
      { title: "Headlines", icon: FileText, path: "/utilidades/gerador-headlines" },
    ],
    config: [
      { title: "Configuração Pessoal", icon: Settings, path: "/configuracoes" },
    ],
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      {/* Header */}
      <SidebarHeader
        className="border-b border-border/50 p-4"
        style={{ borderBottomColor: agencia?.cor_secundaria ? `${agencia.cor_secundaria}44` : undefined }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {agencia?.logo_url ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-primary/20 bg-white/50 backdrop-blur-sm">
                <img
                  src={agencia.logo_black_url || agencia.logo_url}
                  alt={agencia.nome}
                  className="h-full w-full object-contain"
                />
              </div>
              {!isCollapsed && (
                <span className="font-bold text-sm truncate max-w-[150px] text-foreground">
                  {agencia.nome}
                </span>
              )}
            </div>
          ) : (
            <VCDLogo size="lg" showText={false} />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2 gap-2 overflow-y-auto">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", isCollapsed && "sr-only")}>
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

        {/* Gestão */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", isCollapsed && "sr-only")}>
            Gestão & Operação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.gestao.map((item) => (
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

        {/* Ferramentas */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", isCollapsed && "sr-only")}>
            Ferramentas & Úteis
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.ferramentas.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={false} // Will navigate out of dashboard
                    tooltip={item.title}
                    className="transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* Footer - Configuracoes */}
      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu>
          {gestor?.is_admin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigate("/agencia/configuracoes")}
                isActive={isActive("/agencia/configuracoes")}
                tooltip="Configurações da Agência"
                className={cn(
                  "transition-all duration-200",
                  isActive("/agencia/configuracoes") &&
                  "bg-primary/10 text-primary border-l-2 border-primary"
                )}
              >
                <div
                  className="h-4 w-4 rounded-full flex items-center justify-center border border-primary/30"
                  style={{ backgroundColor: agencia?.cor_primaria ? `${agencia.cor_primaria}22` : undefined }}
                >
                  <Settings className="h-3 w-3 text-primary" style={{ color: agencia?.cor_primaria || undefined }} />
                </div>
                <span>Config. Agência</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

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
