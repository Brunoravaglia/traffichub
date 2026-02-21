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
    analise: [
      { title: "Home Dashboard", icon: Home, path: "/dashboard" },
      { title: "Visão Gerencial", icon: BarChart3, path: "/gerencial" },
      { title: "Checklist de Setup", icon: FileText, path: "/controle" },
    ],
    relatorios: [
      { title: "Gerar Relatórios", icon: Sparkles, path: "/modelos" },
      { title: "Meus Clientes", icon: Users, path: "/clientes" },
      { title: "Histórico de Envios", icon: History, path: "/historico" },
    ],
    operacao: [
      { title: "Calendário", icon: Calendar, path: "/calendario" },
      { title: "Produtividade", icon: Timer, path: "/produtividade" },
      { title: "Previsão Saldo", icon: Flame, path: "/previsao-saldo" },
    ],
    equipe: [
      { title: "Gestores", icon: Briefcase, path: "/gestores" },
      { title: "Conquistas", icon: Trophy, path: "/conquistas" },
    ],
    ferramentas: [
      { title: "Todas Ferramentas", icon: Plus, path: "/ferramentas" },
      { title: "Simulador Meta", icon: BarChart3, path: "/ferramentas/simulador-meta" },
      { title: "Gerador de UTMs", icon: Link2, path: "/ferramentas/gerador-utm" },
    ],
    config: [
      { title: "Configuração Pessoal", icon: Settings, path: "/configuracoes" },
    ],
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      {/* Header */}
      <SidebarHeader
        className="px-6 py-8 border-b border-border/10"
        style={{ borderBottomColor: agencia?.cor_secundaria ? `${agencia.cor_secundaria}44` : undefined }}
      >
        <div className="flex items-center justify-center w-full py-2">
          {agencia?.logo_url ? (
            <img
              src={agencia.logo_url}
              alt={agencia.nome}
              className="max-h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          ) : (
            <VCDLogo size="lg" showText={true} />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-6 gap-4 overflow-y-auto">
        {/* Análise */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-4 mb-3", isCollapsed && "sr-only")}>
            Performance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-3">
              {menuItems.analise.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200 h-11 rounded-xl mb-1",
                      isActive(item.path)
                        ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive(item.path) ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Relatórios Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-4 mb-2", isCollapsed && "sr-only")}>
            Relatórios
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {menuItems.relatorios.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200 h-10 rounded-lg mb-1",
                      isActive(item.path)
                        ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive(item.path) ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Operação */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-4 mb-2", isCollapsed && "sr-only")}>
            Operação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {menuItems.operacao.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200 h-10 rounded-lg mb-1",
                      isActive(item.path)
                        ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive(item.path) ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Equipe */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] px-4 mb-2", isCollapsed && "sr-only")}>
            Equipe
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-4">
              {menuItems.equipe.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200 h-10 rounded-lg mb-1",
                      isActive(item.path)
                        ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive(item.path) ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Utilitários */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-4">
              <SidebarMenuItem>
                <div className="px-2 py-4">
                  <div className="h-px bg-white/[0.05] w-full" />
                </div>
              </SidebarMenuItem>
              {menuItems.ferramentas.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={false}
                    tooltip={item.title}
                    className="transition-all duration-200 h-9 rounded-lg mb-1 text-muted-foreground/70 hover:bg-white/[0.03] hover:text-foreground"
                  >
                    <item.icon className="h-4 w-4 opacity-50" />
                    <span className="text-xs">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - Configuracoes */}
      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu className="gap-2">
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
