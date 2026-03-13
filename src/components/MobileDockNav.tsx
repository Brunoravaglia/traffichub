import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  Calendar,
  ChevronDown,
  FileText,
  Flame,
  History,
  Home,
  Link2,
  Menu,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Timer,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { useGestor } from "@/contexts/GestorContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const MobileDockNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { gestor } = useGestor();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = useMemo(
    () => [
      {
        label: "Home",
        path: "/dashboard",
        icon: Home,
        active: (pathname: string) => pathname === "/dashboard" || pathname === "/",
      },
      {
        label: "Relatórios",
        path: "/modelos",
        icon: FileText,
        active: (pathname: string) =>
          pathname.startsWith("/modelos") ||
          pathname.includes("/relatorio") ||
          pathname.includes("/enviar-relatorio"),
      },
      {
        label: "Clientes",
        path: "/clientes",
        icon: Users,
        active: (pathname: string) => pathname.startsWith("/clientes") || pathname.startsWith("/cliente/"),
      },
      {
        label: "Agenda",
        path: "/calendario",
        icon: Calendar,
        active: (pathname: string) => pathname.startsWith("/calendario"),
      },
      {
        label: "Menu",
        path: "#menu",
        icon: Menu,
        active: () => false,
        action: () => setIsMenuOpen(true),
      },
    ],
    []
  );

  const menuSections = useMemo(
    () => [
      {
        key: "performance",
        title: "Performance",
        defaultOpen: true,
        items: [
          { label: "Home Dashboard", path: "/dashboard", icon: Home },
          { label: "Visão Gerencial", path: "/gerencial", icon: BarChart3 },
          { label: "Checklist de Setup", path: "/controle", icon: FileText },
        ],
      },
      {
        key: "relatorios",
        title: "Relatórios",
        defaultOpen: true,
        items: [
          { label: "Gerar Relatórios", path: "/modelos", icon: Sparkles },
          { label: "Meus Clientes", path: "/clientes", icon: Users },
          { label: "Histórico de Envios", path: "/historico", icon: History },
        ],
      },
      {
        key: "operacao",
        title: "Operação",
        defaultOpen: false,
        items: [
          { label: "Calendário", path: "/calendario", icon: Calendar },
          { label: "Produtividade", path: "/produtividade", icon: Timer },
          { label: "Previsão Saldo", path: "/previsao-saldo", icon: Flame },
        ],
      },
      {
        key: "equipe",
        title: "Equipe",
        defaultOpen: false,
        items: [
          { label: "Gestores", path: "/gestores", icon: Briefcase },
          { label: "Conquistas", path: "/conquistas", icon: Trophy },
        ],
      },
      {
        key: "ferramentas",
        title: "Ferramentas",
        defaultOpen: false,
        items: [
          { label: "Todas Ferramentas", path: "/ferramentas", icon: Plus },
          { label: "Simulador Meta", path: "/ferramentas/simulador-meta", icon: BarChart3 },
          { label: "Gerador de UTMs", path: "/ferramentas/gerador-utm", icon: Link2 },
        ],
      },
      {
        key: "config",
        title: "Configurações",
        defaultOpen: false,
        items: [
          ...(gestor?.is_admin
            ? [{ label: "Config. Agência", path: "/agencia/configuracoes", icon: Settings }]
            : []),
          { label: "Configuração Pessoal", path: "/configuracoes", icon: Settings },
        ],
      },
    ],
    [gestor?.is_admin]
  );

  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => item.path !== "#menu" && item.active(location.pathname))
  );
  const highlightedIndex = isMenuOpen ? navItems.length - 1 : activeIndex;

  const navigateTo = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
        <nav
          className="pointer-events-auto relative flex items-center gap-1 rounded-[28px] border border-white/10 bg-[#07140f]/85 px-2 py-2 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          aria-label="Navegação mobile"
        >
          <div
            className="pointer-events-none absolute top-2 bottom-2 z-0 rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,rgba(4,139,71,0.42),rgba(22,218,113,0.2))] shadow-[0_0_28px_rgba(22,218,113,0.2),0_0_56px_rgba(22,218,113,0.08)] transition-[transform,box-shadow,background] duration-700 [transition-timing-function:cubic-bezier(0.2,1.2,0.32,1)]"
            style={{
              width: "52px",
              transform: `translateX(${highlightedIndex * 56}px)`,
            }}
          />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path !== "#menu" && item.active(location.pathname);

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => (item.action ? item.action() : navigate(item.path))}
                className={cn(
                  "relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-[20px] transition-all duration-500 [transition-timing-function:cubic-bezier(0.2,1.2,0.32,1)]",
                  isActive || (isMenuOpen && item.path === "#menu") ? "text-[#16DA71]" : "text-[#8FA399]"
                )}
                aria-label={item.label}
                title={item.label}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.2,1.2,0.32,1)]",
                    isActive || (isMenuOpen && item.path === "#menu") ? "scale-[1.08]" : "scale-100"
                  )}
                  strokeWidth={1.8}
                />
              </button>
            );
          })}
        </nav>
      </div>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent
          side="bottom"
          className="h-[min(84dvh,760px)] max-h-[84dvh] overflow-hidden rounded-t-[28px] border-white/10 bg-[#07140f]/95 px-0 pt-0 text-white backdrop-blur-2xl"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/10" />
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <div>
              <SheetTitle className="text-left text-lg font-semibold text-white">Navegação</SheetTitle>
              <p className="text-sm text-[#8FA399]">Acesso completo às seções do sistema</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(false)}
              className="h-10 w-10 rounded-2xl border border-white/10 bg-white/[0.03] text-[#8FA399]"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="max-h-[calc(84dvh-164px)] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)]">
            <div className="space-y-3">
              {menuSections.map((section) => (
                <Collapsible key={section.key} defaultOpen={section.defaultOpen} className="rounded-3xl border border-white/8 bg-white/[0.02] px-3 py-2">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-2xl px-2 py-3 text-left">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8FA399]">{section.title}</span>
                    <ChevronDown className="h-4 w-4 text-[#8FA399] transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pb-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname.startsWith(item.path);
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => navigateTo(item.path)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                            isActive
                              ? "bg-[#0c2b1c] text-[#16DA71] ring-1 ring-[#16DA71]/20"
                              : "text-white/90 hover:bg-white/[0.04]"
                          )}
                        >
                          <Icon className={cn("h-4 w-4", isActive ? "text-[#16DA71]" : "text-[#8FA399]")} />
                          <span className="text-[15px] font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>

          <div className="border-t border-white/8 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-medium text-white">Aparência</span>
                <span className="block text-xs text-[#8FA399]">Alternar entre tema escuro e claro</span>
              </span>
              {theme === "dark" ? <Sun className="h-5 w-5 text-[#8FA399]" /> : <Moon className="h-5 w-5 text-[#8FA399]" />}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileDockNav;
