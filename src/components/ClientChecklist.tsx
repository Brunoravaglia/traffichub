import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CreditCard, BarChart3, Palette, User, History, Save, Check, FileText, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EditClientForm from "./EditClientForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import VCDLogo from "./VCDLogo";
import ProgressBar from "./ProgressBar";
import ChecklistCard from "./ChecklistCard";
import PendenciasCard from "./PendenciasCard";
import ReportCalendar from "./ReportCalendar";
import { cn } from "@/lib/utils";

interface ChecklistData {
  id?: string;
  cliente_id: string;
  data: string;
  pagamento_ok: boolean;
  conta_sem_bloqueios: boolean;
  saldo_suficiente: boolean;
  pixel_tag_instalados: boolean;
  conversoes_configuradas: boolean;
  integracao_crm: boolean;
  criativos_atualizados: boolean;
  cta_claro: boolean;
  teste_ab_ativo: boolean;
  pendencias: string;
}

const ClientChecklist = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const { data: cliente } = useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select(`*, gestores(nome)`)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: checklistData, refetch: refetchChecklist } = useQuery({
    queryKey: ["checklist", id, format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("cliente_id", id)
        .eq("data", dateStr)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Query to get all filled dates for the calendar
  const { data: filledDatesData } = useQuery({
    queryKey: ["filledDates", id, format(calendarMonth, "yyyy-MM")],
    queryFn: async () => {
      const monthStart = format(startOfMonth(calendarMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(calendarMonth), "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("checklists")
        .select("data")
        .eq("cliente_id", id)
        .gte("data", monthStart)
        .lte("data", monthEnd);

      if (error) throw error;
      return data?.map(d => parseISO(d.data)) || [];
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (checklistData) {
      setChecklist(checklistData);
      setHasUnsavedChanges(false);
      setIsSaved(true);
    } else if (id) {
      setChecklist({
        cliente_id: id,
        data: format(selectedDate, "yyyy-MM-dd"),
        pagamento_ok: false,
        conta_sem_bloqueios: false,
        saldo_suficiente: false,
        pixel_tag_instalados: false,
        conversoes_configuradas: false,
        integracao_crm: false,
        criativos_atualizados: false,
        cta_claro: false,
        teste_ab_ativo: false,
        pendencias: "",
      });
      setHasUnsavedChanges(false);
      setIsSaved(false);
    }
  }, [checklistData, id, selectedDate]);

  const saveChecklistMutation = useMutation({
    mutationFn: async (data: Partial<ChecklistData>) => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { error } = await supabase
        .from("checklists")
        .upsert(
          {
            cliente_id: id,
            data: dateStr,
            ...data,
          },
          { onConflict: "cliente_id,data" }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      refetchChecklist();
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["filledDates", id] });
      setHasUnsavedChanges(false);
      setIsSaved(true);
      toast({
        title: "Relatório salvo!",
        description: `Checklist de ${format(selectedDate, "dd/MM/yyyy")} salvo com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleChecklistChange = (field: keyof ChecklistData, value: boolean | string) => {
    if (!checklist) return;

    const updatedChecklist = { ...checklist, [field]: value };
    setChecklist(updatedChecklist);
    setHasUnsavedChanges(true);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!checklist) return;
    const { id: _, ...dataToSave } = checklist;
    saveChecklistMutation.mutate(dataToSave);
  };

  const handleExport = () => {
    if (!cliente || !checklist) return;

    const content = `
RELATÓRIO DE CHECKLIST
======================

Cliente: ${cliente.nome}
Gestor: ${cliente.gestores?.nome}
Data: ${format(selectedDate, "dd/MM/yyyy")}

FATURAMENTO
-----------
• Pagamento OK: ${checklist.pagamento_ok ? "✓" : "✗"}
• Conta sem bloqueios: ${checklist.conta_sem_bloqueios ? "✓" : "✗"}
• Saldo suficiente: ${checklist.saldo_suficiente ? "✓" : "✗"}

RASTREAMENTO
------------
• Pixel/Tag instalados: ${checklist.pixel_tag_instalados ? "✓" : "✗"}
• Conversões configuradas: ${checklist.conversoes_configuradas ? "✓" : "✗"}
• Integração CRM: ${checklist.integracao_crm ? "✓" : "✗"}

CRIATIVOS
---------
• Criativos atualizados: ${checklist.criativos_atualizados ? "✓" : "✗"}
• CTA claro: ${checklist.cta_claro ? "✓" : "✗"}
• Teste A/B ativo: ${checklist.teste_ab_ativo ? "✓" : "✗"}

PENDÊNCIAS
----------
${checklist.pendencias || "Nenhuma pendência registrada."}

---
Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}
Você Digital - Checklist do Gestor de Tráfego
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${cliente.nome.toLowerCase().replace(/\s+/g, "-")}-${format(selectedDate, "yyyy-MM-dd")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório exportado!",
      description: "O arquivo foi baixado com sucesso.",
    });
  };

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
            onClick={() => navigate("/clientes")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <VCDLogo size="sm" />
          <div className="flex-1" />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-border hover:bg-primary/10 hover:text-primary mr-2"
              >
                <Settings className="w-4 h-4 mr-2" />
                Editar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-foreground">
                  Editar Cliente
                </DialogTitle>
              </DialogHeader>
              <EditClientForm
                clienteId={id!}
                onClose={() => {}}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["cliente", id] })}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/cliente/${id}/novo-relatorio`)}
            className="border-border hover:bg-primary/10 hover:text-primary mr-2"
          >
            <FileText className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/cliente/${id}/historico`)}
            className="border-border hover:bg-primary/10 hover:text-primary"
          >
            <History className="w-4 h-4 mr-2" />
            Histórico
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 bg-secondary border-border hover:bg-secondary/80"
                      >
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Progress */}
              <div className="w-full md:w-48">
                <ProgressBar progress={progress} size="lg" />
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checklist Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <ChecklistCard
                  title="Faturamento"
                  icon={CreditCard}
                  delay={0.1}
                  items={[
                    {
                      id: "pagamento_ok",
                      label: "Pagamento OK",
                      checked: checklist.pagamento_ok,
                      onChange: (v) => handleChecklistChange("pagamento_ok", v),
                    },
                    {
                      id: "conta_sem_bloqueios",
                      label: "Conta sem bloqueios",
                      checked: checklist.conta_sem_bloqueios,
                      onChange: (v) => handleChecklistChange("conta_sem_bloqueios", v),
                    },
                    {
                      id: "saldo_suficiente",
                      label: "Saldo suficiente",
                      checked: checklist.saldo_suficiente,
                      onChange: (v) => handleChecklistChange("saldo_suficiente", v),
                    },
                  ]}
                />

                <ChecklistCard
                  title="Rastreamento"
                  icon={BarChart3}
                  delay={0.2}
                  items={[
                    {
                      id: "pixel_tag_instalados",
                      label: "Pixel / Tag instalados",
                      checked: checklist.pixel_tag_instalados,
                      onChange: (v) => handleChecklistChange("pixel_tag_instalados", v),
                    },
                    {
                      id: "conversoes_configuradas",
                      label: "Conversões configuradas",
                      checked: checklist.conversoes_configuradas,
                      onChange: (v) => handleChecklistChange("conversoes_configuradas", v),
                    },
                    {
                      id: "integracao_crm",
                      label: "Integração com CRM funcionando",
                      checked: checklist.integracao_crm,
                      onChange: (v) => handleChecklistChange("integracao_crm", v),
                    },
                  ]}
                />

                <ChecklistCard
                  title="Criativos"
                  icon={Palette}
                  delay={0.3}
                  items={[
                    {
                      id: "criativos_atualizados",
                      label: "Criativos atualizados",
                      checked: checklist.criativos_atualizados,
                      onChange: (v) => handleChecklistChange("criativos_atualizados", v),
                    },
                    {
                      id: "cta_claro",
                      label: "CTA claro",
                      checked: checklist.cta_claro,
                      onChange: (v) => handleChecklistChange("cta_claro", v),
                    },
                    {
                      id: "teste_ab_ativo",
                      label: "Teste A/B ativo",
                      checked: checklist.teste_ab_ativo,
                      onChange: (v) => handleChecklistChange("teste_ab_ativo", v),
                    },
                  ]}
                />

                <PendenciasCard
                  value={checklist.pendencias}
                  onChange={(v) => handleChecklistChange("pendencias", v)}
                  delay={0.4}
                />
              </div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={saveChecklistMutation.isPending || (!hasUnsavedChanges && isSaved)}
                  className={cn(
                    "w-full h-14 text-lg font-semibold transition-all duration-200",
                    isSaved && !hasUnsavedChanges
                      ? "bg-green-600 hover:bg-green-600 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow hover:scale-[1.02]"
                  )}
                >
                  {saveChecklistMutation.isPending ? (
                    <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : isSaved && !hasUnsavedChanges ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Salvo
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Salvar Relatório
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Calendar Sidebar */}
            <div className="lg:col-span-1">
              <ReportCalendar
                currentMonth={calendarMonth}
                onMonthChange={setCalendarMonth}
                filledDates={filledDatesData || []}
                onExport={handleExport}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientChecklist;