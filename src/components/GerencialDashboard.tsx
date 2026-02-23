import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  Building2,
  ClipboardList,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  FileText,
  UserPlus,
  CalendarDays,
  Bug,
  ShieldAlert,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import VCDLogo from "./VCDLogo";
import ProgressBar from "./ProgressBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGestor } from "@/contexts/GestorContext";

interface GestorStats {
  id: string;
  nome: string;
  totalClientes: number;
  checklistsPreenchidos: number;
  itensPendentes: number;
}

const GerencialDashboard = () => {
  const navigate = useNavigate();
  const { gestor } = useGestor();
  const agencyId = gestor?.agencia_id ?? null;
  const last30Date = format(subDays(new Date(), 30), "yyyy-MM-dd");
  const last7Iso = subDays(new Date(), 7).toISOString();
  const last24Iso = subDays(new Date(), 1).toISOString();

  const { data: gestores } = useQuery({
    queryKey: ["gestores", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const { data, error } = await supabase.from("gestores").select("*").eq("agencia_id", agencyId);
      if (error) throw error;
      return data;
    },
    enabled: !!agencyId,
  });

  const { data: clientes } = useQuery({
    queryKey: ["clientes-all", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const { data, error } = await supabase.from("clientes").select("*, gestores(nome)").eq("agencia_id", agencyId);
      if (error) throw error;
      return data;
    },
    enabled: !!agencyId,
  });

  const { data: relatorios } = useQuery({
    queryKey: ["relatorios-all-gerencial", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const { data: clientRows, error: clientError } = await supabase
        .from("clientes")
        .select("id")
        .eq("agencia_id", agencyId);
      if (clientError) throw clientError;
      const clientIds = (clientRows || []).map((c) => c.id);
      if (clientIds.length === 0) return [];

      const { data, error } = await supabase
        .from("relatorios")
        .select("id, cliente_id, data, created_at")
        .in("cliente_id", clientIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!agencyId,
  });

  const { data: novosGestores } = useQuery({
    queryKey: ["novos-gestores-gerencial", agencyId, last30Date],
    queryFn: async () => {
      if (!agencyId) return [];
      const { data, error } = await supabase
        .from("gestores")
        .select("id, nome, created_at")
        .eq("agencia_id", agencyId)
        .gte("created_at", `${last30Date}T00:00:00`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!agencyId,
  });

  const { data: checklistsMes } = useQuery({
    queryKey: ["checklists-mes", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const now = new Date();
      const start = format(startOfMonth(now), "yyyy-MM-dd");
      const end = format(endOfMonth(now), "yyyy-MM-dd");
      const { data: clientRows, error: clientError } = await supabase.from("clientes").select("id").eq("agencia_id", agencyId);
      if (clientError) throw clientError;
      const clientIds = (clientRows || []).map((c) => c.id);
      if (clientIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .in("cliente_id", clientIds)
        .gte("data", start)
        .lte("data", end);
      
      if (error) throw error;
      return data;
    },
    enabled: !!agencyId,
  });

  const { data: appErrors } = useQuery({
    queryKey: ["app-errors-gerencial", agencyId, last7Iso],
    queryFn: async () => {
      if (!agencyId) return [];
      const { data, error } = await supabase
        .from("app_errors")
        .select("id, cliente_id, message, route, error_type, created_at")
        .eq("agencia_id", agencyId)
        .gte("created_at", last7Iso)
        .order("created_at", { ascending: false })
        .limit(300);

      if (error) throw error;
      return data || [];
    },
    enabled: !!agencyId,
  });

  // Calculate KPIs
  const totalGestores = gestores?.length || 0;
  const totalClientes = clientes?.length || 0;
  const totalChecklists = checklistsMes?.length || 0;
  const totalRelatorios = relatorios?.length || 0;
  const novosUsuarios30d = novosGestores?.length || 0;
  const totalErrors7d = appErrors?.length || 0;
  const totalErrors24h = (appErrors || []).filter((e) => e.created_at >= last24Iso).length;
  
  const totalPendentes = checklistsMes?.reduce((acc, checklist) => {
    const fields = [
      checklist.pagamento_ok,
      checklist.conta_sem_bloqueios,
      checklist.saldo_suficiente,
      checklist.pixel_tag_instalados,
      checklist.conversoes_configuradas,
      checklist.integracao_crm,
      checklist.criativos_atualizados,
      checklist.cta_claro,
      checklist.teste_ab_ativo,
    ];
    return acc + fields.filter((f) => !f).length;
  }, 0) || 0;

  const relatorios30d = (relatorios || []).filter((r) => {
    const rawDate = r.data || r.created_at;
    if (!rawDate) return false;
    const dt = typeof rawDate === "string" ? parseISO(rawDate) : new Date(rawDate);
    return dt >= subDays(new Date(), 30);
  });

  const reportsByClient = (clientes || [])
    .map((cliente) => {
      const rows = (relatorios || []).filter((r) => r.cliente_id === cliente.id);
      const rows30d = relatorios30d.filter((r) => r.cliente_id === cliente.id);
      const latest = rows
        .map((r) => (r.data || r.created_at ? new Date((r.data || r.created_at) as string) : null))
        .filter(Boolean)
        .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] as Date | undefined;
      return {
        id: cliente.id,
        nome: cliente.nome,
        total: rows.length,
        total30d: rows30d.length,
        latest,
      };
    })
    .sort((a, b) => b.total30d - a.total30d || b.total - a.total)
    .slice(0, 10);

  const errorByClient = (clientes || [])
    .map((cliente) => {
      const incidents = (appErrors || []).filter((e) => e.cliente_id === cliente.id);
      const incidents24h = incidents.filter((e) => e.created_at >= last24Iso).length;
      const latest = incidents[0]?.created_at ? parseISO(incidents[0].created_at) : null;
      return {
        id: cliente.id,
        nome: cliente.nome,
        incidents: incidents.length,
        incidents24h,
        latest,
      };
    })
    .filter((item) => item.incidents > 0)
    .sort((a, b) => b.incidents24h - a.incidents24h || b.incidents - a.incidents)
    .slice(0, 8);

  const impactedClients7d = new Set((appErrors || []).map((e) => e.cliente_id).filter(Boolean)).size;
  const latestErrors = (appErrors || []).slice(0, 8);

  // Calculate stats per gestor
  const gestorStats: GestorStats[] = gestores?.map((gestor) => {
    const gestorClientes = clientes?.filter((c) => c.gestor_id === gestor.id) || [];
    const gestorClienteIds = gestorClientes.map((c) => c.id);
    const gestorChecklists = checklistsMes?.filter((ch) => 
      gestorClienteIds.includes(ch.cliente_id)
    ) || [];
    
    const pendentes = gestorChecklists.reduce((acc, checklist) => {
      const fields = [
        checklist.pagamento_ok,
        checklist.conta_sem_bloqueios,
        checklist.saldo_suficiente,
        checklist.pixel_tag_instalados,
        checklist.conversoes_configuradas,
        checklist.integracao_crm,
        checklist.criativos_atualizados,
        checklist.cta_claro,
        checklist.teste_ab_ativo,
      ];
      return acc + fields.filter((f) => !f).length;
    }, 0);

    return {
      id: gestor.id,
      nome: gestor.nome,
      totalClientes: gestorClientes.length,
      checklistsPreenchidos: gestorChecklists.length,
      itensPendentes: pendentes,
    };
  }) || [];

  const getStatusColor = (pendentes: number) => {
    if (pendentes === 0) return "bg-green-500";
    if (pendentes <= 5) return "bg-primary";
    if (pendentes <= 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusLabel = (pendentes: number) => {
    if (pendentes === 0) return "Excelente";
    if (pendentes <= 5) return "Bom";
    if (pendentes <= 10) return "Atenção";
    return "Crítico";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <VCDLogo size="sm" />
          <div className="h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <span className="text-muted-foreground text-sm">Dashboard Gerencial</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Visão Executiva
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalGestores}</p>
              <p className="text-sm text-muted-foreground">Gestores</p>
            </div>

            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalClientes}</p>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
            </div>

            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalRelatorios}</p>
              <p className="text-sm text-muted-foreground">Relatórios (total)</p>
            </div>

            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-violet-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{novosUsuarios30d}</p>
              <p className="text-sm text-muted-foreground">Novos usuários (30d)</p>
            </div>

            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Bug className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalErrors24h}</p>
              <p className="text-sm text-muted-foreground">Bugs (24h)</p>
            </div>

            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{impactedClients7d}</p>
              <p className="text-sm text-muted-foreground">Clientes impactados (7d)</p>
            </div>

            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalChecklists}</p>
              <p className="text-sm text-muted-foreground">Checklists (mês)</p>
            </div>

            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalPendentes}</p>
              <p className="text-sm text-muted-foreground">Itens Pendentes</p>
            </div>
          </motion.div>

          {/* Incident panel */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
            <div className="vcd-card p-6 xl:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Saúde do sistema</h2>
                </div>
                <span className="text-xs text-muted-foreground">janela 7 dias</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Incidentes (24h)</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalErrors24h}</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Incidentes (7d)</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{totalErrors7d}</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-background/50 p-3">
                  <p className="text-xs text-muted-foreground">Clientes impactados</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{impactedClients7d}</p>
                </div>
              </div>

              <div className="space-y-2">
                {errorByClient.length > 0 ? (
                  errorByClient.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{client.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.latest ? `Último incidente: ${format(client.latest, "dd/MM HH:mm")}` : "Sem data"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{client.incidents}</p>
                        <p className="text-xs text-muted-foreground">{client.incidents24h} nas últimas 24h</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <p className="text-sm text-emerald-300">Sem bugs registrados nos últimos 7 dias.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="vcd-card p-6 xl:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <Bug className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Últimos incidentes</h2>
              </div>
              {latestErrors.length > 0 ? (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {latestErrors.map((error) => (
                    <div key={error.id} className="rounded-lg border border-border/40 bg-background/50 p-3">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{error.message}</p>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{error.route || "Rota não identificada"}</span>
                        <span>{format(parseISO(error.created_at), "dd/MM HH:mm")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum incidente recente.</p>
              )}
            </div>
          </motion.div>

          {/* New users + Agency production */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Novos usuários</h2>
                <span className="text-xs text-muted-foreground">últimos 30 dias</span>
              </div>
              {novosGestores && novosGestores.length > 0 ? (
                <div className="space-y-3">
                  {novosGestores.slice(0, 8).map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 px-3 py-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {u.nome?.substring(0, 2).toUpperCase() || "US"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-foreground truncate">{u.nome}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {u.created_at ? format(parseISO(u.created_at), "dd/MM/yyyy") : "-"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum novo usuário no período.</p>
              )}
            </div>

            <div className="vcd-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Produção da agência</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Relatórios (30 dias)</span>
                  <span className="font-semibold text-foreground">{relatorios30d.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Relatórios (total)</span>
                  <span className="font-semibold text-foreground">{totalRelatorios}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Clientes com relatório</span>
                  <span className="font-semibold text-foreground">
                    {reportsByClient.filter((c) => c.total > 0).length} / {totalClientes}
                  </span>
                </div>
                <div className="pt-2">
                  <ProgressBar
                    value={totalClientes > 0 ? (reportsByClient.filter((c) => c.total > 0).length / totalClientes) * 100 : 0}
                    label="Cobertura de clientes com relatórios"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gestores Table */}
          <motion.div variants={itemVariants} className="vcd-card overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Visão por Gestor</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Gestor</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Clientes</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Checklists</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Pendentes</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {gestorStats.map((gestor, index) => (
                    <motion.tr
                      key={gestor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/clientes?gestor=${gestor.id}`)}
                    >
                      <td className="p-4">
                        <span className="font-medium text-foreground">{gestor.nome}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-foreground">{gestor.totalClientes}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-foreground">{gestor.checklistsPreenchidos}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${gestor.itensPendentes > 10 ? 'text-red-500' : gestor.itensPendentes > 5 ? 'text-yellow-500' : 'text-foreground'}`}>
                          {gestor.itensPendentes}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(gestor.itensPendentes)} text-background`}>
                          {getStatusLabel(gestor.itensPendentes)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <ChevronRight className="w-5 h-5 text-muted-foreground inline" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Reports by client */}
          <motion.div variants={itemVariants} className="vcd-card overflow-hidden mt-6">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Relatórios por cliente</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">30 dias</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Último relatório</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {reportsByClient.length > 0 ? (
                    reportsByClient.map((cliente, index) => (
                      <motion.tr
                        key={cliente.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="border-b border-border/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/cliente/${cliente.id}/historico`)}
                      >
                        <td className="p-4 font-medium text-foreground">{cliente.nome}</td>
                        <td className="p-4 text-center text-foreground">{cliente.total30d}</td>
                        <td className="p-4 text-center text-foreground">{cliente.total}</td>
                        <td className="p-4 text-center text-muted-foreground">
                          {cliente.latest ? format(cliente.latest, "dd/MM/yyyy") : "Sem envio"}
                        </td>
                        <td className="p-4 text-right">
                          <ChevronRight className="w-5 h-5 text-muted-foreground inline" />
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        Nenhum relatório encontrado para os clientes da sua agência.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default GerencialDashboard;
