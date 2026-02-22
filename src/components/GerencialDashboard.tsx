import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Building2, ClipboardList, AlertCircle, ChevronRight, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import VCDLogo from "./VCDLogo";
import ProgressBar from "./ProgressBar";
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

  // Calculate KPIs
  const totalGestores = gestores?.length || 0;
  const totalClientes = clientes?.length || 0;
  const totalChecklists = checklistsMes?.length || 0;
  
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
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        </motion.div>
      </main>
    </div>
  );
};

export default GerencialDashboard;
