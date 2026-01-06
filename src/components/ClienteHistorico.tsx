import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, CheckCircle2, AlertCircle, Eye, Filter, Plus, ClipboardList, TrendingUp, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VCDLogo from "./VCDLogo";
import ProgressBar from "./ProgressBar";

const ClienteHistorico = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [periodoFiltro, setPeriodoFiltro] = useState("30");

  const { data: cliente } = useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*, gestores(nome)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: checklists } = useQuery({
    queryKey: ["historico-checklists", id, periodoFiltro],
    queryFn: async () => {
      const diasAtras = parseInt(periodoFiltro);
      const dataLimite = format(subDays(new Date(), diasAtras), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("cliente_id", id)
        .gte("data", dataLimite)
        .order("data", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: allChecklists } = useQuery({
    queryKey: ["all-checklists", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("cliente_id", id)
        .order("data", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const calculateProgress = (checklist: any) => {
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
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const getStatusInfo = (progress: number) => {
    if (progress === 100) return { label: "Completo", color: "bg-green-500", icon: CheckCircle2 };
    if (progress >= 70) return { label: "Bom", color: "bg-primary", icon: CheckCircle2 };
    if (progress >= 40) return { label: "Atenção", color: "bg-yellow-500", icon: AlertCircle };
    return { label: "Crítico", color: "bg-red-500", icon: AlertCircle };
  };

  const getPendentesCount = (checklist: any) => {
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
    return fields.filter((f) => !f).length;
  };

  const isToday = (dateStr: string) => {
    return dateStr === format(new Date(), "yyyy-MM-dd");
  };

  // Calculate KPIs
  const totalRelatorios = allChecklists?.length || 0;
  const now = new Date();
  const mesAtual = allChecklists?.filter((c) => {
    const data = parseISO(c.data);
    return data >= startOfMonth(now) && data <= endOfMonth(now);
  }).length || 0;

  const ultimoRelatorio = allChecklists?.[0];
  const ultimoProgress = ultimoRelatorio ? calculateProgress(ultimoRelatorio) : 0;
  
  const totalPendentes = allChecklists?.reduce((acc, c) => acc + getPendentesCount(c), 0) || 0;
  const mediaProgress = allChecklists?.length 
    ? Math.round(allChecklists.reduce((acc, c) => acc + calculateProgress(c), 0) / allChecklists.length)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  if (!cliente) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/clientes")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <VCDLogo size="sm" />
          <div className="flex-1" />
          <Button
            onClick={() => navigate(`/cliente/${id}`)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Relatório
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Client Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="vcd-card mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">{cliente.nome}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                    {cliente.gestores?.nome}
                  </span>
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Dashboard do Cliente
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="vcd-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalRelatorios}</p>
              <p className="text-sm text-muted-foreground">Total Relatórios</p>
            </div>

            <div className="vcd-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{mesAtual}</p>
              <p className="text-sm text-muted-foreground">Este Mês</p>
            </div>

            <div className="vcd-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{mediaProgress}%</p>
              <p className="text-sm text-muted-foreground">Média Progresso</p>
            </div>

            <div className="vcd-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{ultimoProgress}%</p>
              <p className="text-sm text-muted-foreground">Último Relatório</p>
            </div>
          </motion.div>

          {/* Timeline Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <h2 className="text-lg font-semibold text-foreground">Histórico de Relatórios</h2>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                <SelectTrigger className="w-[160px] bg-secondary border-border">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="15">Últimos 15 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border/50 hidden md:block" />

            {checklists && checklists.length > 0 ? (
              checklists.map((checklist, index) => {
                const progress = calculateProgress(checklist);
                const status = getStatusInfo(progress);
                const StatusIcon = status.icon;
                const pendentes = getPendentesCount(checklist);
                const today = isToday(checklist.data);

                return (
                  <motion.div
                    key={checklist.id}
                    variants={itemVariants}
                    className="relative pl-0 md:pl-16 mb-4"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-4 w-4 h-4 rounded-full ${status.color} hidden md:block ring-4 ring-background`} />

                    {/* Card */}
                    <div className={`vcd-card-hover group ${today ? 'ring-2 ring-primary/50' : ''}`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Date */}
                        <div className="flex items-center gap-3 md:w-32">
                          <Calendar className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {format(parseISO(checklist.data), "dd/MM")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(checklist.data), "EEEE", { locale: ptBR })}
                            </p>
                          </div>
                          {today && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary text-background">
                              Hoje
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="flex-1">
                          <ProgressBar progress={progress} size="sm" />
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color} text-background`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          {pendentes > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {pendentes} pendente{pendentes > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* View Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/cliente/${id}/relatorio/${checklist.data}`)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </div>

                      {/* Pendencias Preview */}
                      {checklist.pendencias && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            <span className="font-medium text-foreground">Observações:</span> {checklist.pendencias}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                variants={itemVariants}
                className="vcd-card text-center py-12"
              >
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum relatório encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Não há relatórios no período selecionado.
                </p>
                <Button
                  onClick={() => navigate(`/cliente/${id}`)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Criar Relatório de Hoje
                </Button>
              </motion.div>
            )}
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default ClienteHistorico;
