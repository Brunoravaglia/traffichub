import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, CreditCard, BarChart3, Palette, FileText, Lock, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import VCDLogo from "./VCDLogo";
import ProgressBar from "./ProgressBar";

const RelatorioView = () => {
  const { id, data } = useParams<{ id: string; data: string }>();
  const navigate = useNavigate();

  const { data: cliente } = useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      const { data: clienteData, error } = await supabase
        .from("clientes")
        .select("*, gestores(nome)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return clienteData;
    },
    enabled: !!id,
  });

  const { data: checklist } = useQuery({
    queryKey: ["relatorio", id, data],
    queryFn: async () => {
      const { data: checklistData, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("cliente_id", id)
        .eq("data", data)
        .maybeSingle();

      if (error) throw error;
      return checklistData;
    },
    enabled: !!id && !!data,
  });

  const calculateProgress = () => {
    if (!checklist) return 0;
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

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const ChecklistItemReadOnly = ({ label, checked }: { label: string; checked: boolean }) => (
    <motion.div
      variants={itemVariants}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        checked ? 'bg-primary/10' : 'bg-red-500/10'
      }`}
    >
      {checked ? (
        <CheckCircle2 className="w-5 h-5 text-primary" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
      <span className={`text-sm ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </motion.div>
  );

  if (!cliente || !checklist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/cliente/${id}/historico`)}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <VCDLogo size="sm" />
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-sm">
            <Lock className="w-4 h-4" />
            Somente Leitura
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Client Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="vcd-card mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Client Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">{cliente.nome}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                    {cliente.gestores?.nome}
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    {format(parseISO(data!), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="w-full md:w-48">
                <ProgressBar progress={progress} size="lg" />
              </div>
            </div>
          </motion.div>

          {/* Checklist Cards - Read Only */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Faturamento */}
            <motion.div variants={itemVariants} className="vcd-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Faturamento</h3>
              </div>
              <div className="space-y-2">
                <ChecklistItemReadOnly label="Pagamento OK" checked={checklist.pagamento_ok} />
                <ChecklistItemReadOnly label="Conta sem bloqueios" checked={checklist.conta_sem_bloqueios} />
                <ChecklistItemReadOnly label="Saldo suficiente" checked={checklist.saldo_suficiente} />
              </div>
            </motion.div>

            {/* Rastreamento */}
            <motion.div variants={itemVariants} className="vcd-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Rastreamento</h3>
              </div>
              <div className="space-y-2">
                <ChecklistItemReadOnly label="Pixel / Tag instalados" checked={checklist.pixel_tag_instalados} />
                <ChecklistItemReadOnly label="Conversões configuradas" checked={checklist.conversoes_configuradas} />
                <ChecklistItemReadOnly label="Integração com CRM funcionando" checked={checklist.integracao_crm} />
              </div>
            </motion.div>

            {/* Criativos */}
            <motion.div variants={itemVariants} className="vcd-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Criativos</h3>
              </div>
              <div className="space-y-2">
                <ChecklistItemReadOnly label="Criativos atualizados" checked={checklist.criativos_atualizados} />
                <ChecklistItemReadOnly label="CTA claro" checked={checklist.cta_claro} />
                <ChecklistItemReadOnly label="Teste A/B ativo" checked={checklist.teste_ab_ativo} />
              </div>
            </motion.div>

            {/* Pendências */}
            <motion.div variants={itemVariants} className="vcd-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Pendências</h3>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 min-h-[100px]">
                {checklist.pendencias ? (
                  <p className="text-foreground whitespace-pre-wrap">{checklist.pendencias}</p>
                ) : (
                  <p className="text-muted-foreground italic">Nenhuma observação registrada.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default RelatorioView;
