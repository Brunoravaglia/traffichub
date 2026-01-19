import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Search, DollarSign, Eye, MousePointer, Target, TrendingUp, Award, Save, Edit3, Wallet, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import VCDLogo from "@/components/VCDLogo";
import RelatorioPDFExport from "@/components/RelatorioPDFExport";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

const NovoRelatorio = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingReportId, setExistingReportId] = useState<string | null>(null);
  const [editCount, setEditCount] = useState(0);

  // Google Ads metrics
  const [investimentoGoogle, setInvestimentoGoogle] = useState("");
  const [impressoesGoogle, setImpressoesGoogle] = useState("");
  const [cliquesGoogle, setCliquesGoogle] = useState("");
  const [conversoesGoogle, setConversoesGoogle] = useState("");
  const [topoPesquisas, setTopoPesquisas] = useState("");
  const [taxaSuperacao, setTaxaSuperacao] = useState("");
  const [palavrasChaves, setPalavrasChaves] = useState("");

  // Facebook/Meta metrics
  const [investimentoFacebook, setInvestimentoFacebook] = useState("");
  const [impressoesFacebook, setImpressoesFacebook] = useState("");
  const [cliquesFacebook, setCliquesFacebook] = useState("");
  const [conversoesFacebook, setConversoesFacebook] = useState("");
  const [alcanceFacebook, setAlcanceFacebook] = useState("");

  // Balance info (manual input)
  const [saldoGoogle, setSaldoGoogle] = useState("");
  const [diasGoogle, setDiasGoogle] = useState("");
  const [saldoMeta, setSaldoMeta] = useState("");
  const [diasMeta, setDiasMeta] = useState("");

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

  // Check for existing report on date change
  const { data: existingReport } = useQuery({
    queryKey: ["relatorio", id, format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("relatorios")
        .select("*")
        .eq("cliente_id", id)
        .eq("data", dateStr)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Load existing report data when found
  useEffect(() => {
    if (existingReport) {
      setIsEditing(true);
      setExistingReportId(existingReport.id);
      setEditCount(existingReport.edit_count || 0);
      setInvestimentoGoogle(existingReport.investimento_google?.toString() || "");
      setImpressoesGoogle(existingReport.impressoes_google?.toString() || "");
      setCliquesGoogle(existingReport.cliques_google?.toString() || "");
      setConversoesGoogle(existingReport.conversoes_google?.toString() || "");
      setTopoPesquisas(existingReport.topo_pesquisas?.toString() || "");
      setTaxaSuperacao(existingReport.taxa_superacao?.toString() || "");
      setPalavrasChaves(existingReport.top_palavras_chaves?.join(", ") || "");
      setInvestimentoFacebook(existingReport.investimento_facebook?.toString() || "");
      setImpressoesFacebook(existingReport.impressoes_facebook?.toString() || "");
      setCliquesFacebook(existingReport.cliques_facebook?.toString() || "");
      setConversoesFacebook(existingReport.conversoes_facebook?.toString() || "");
      setAlcanceFacebook(existingReport.alcance_facebook?.toString() || "");
    } else {
      setIsEditing(false);
      setExistingReportId(null);
      setEditCount(0);
      // Reset form
      setInvestimentoGoogle("");
      setImpressoesGoogle("");
      setCliquesGoogle("");
      setConversoesGoogle("");
      setTopoPesquisas("");
      setTaxaSuperacao("");
      setPalavrasChaves("");
      setInvestimentoFacebook("");
      setImpressoesFacebook("");
      setCliquesFacebook("");
      setConversoesFacebook("");
      setAlcanceFacebook("");
    }
  }, [existingReport]);

  const saveRelatorioMutation = useMutation({
    mutationFn: async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const palavrasArray = palavrasChaves
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const reportData = {
        cliente_id: id,
        data: dateStr,
        investimento_google: parseFloat(investimentoGoogle) || 0,
        impressoes_google: parseInt(impressoesGoogle) || 0,
        cliques_google: parseInt(cliquesGoogle) || 0,
        conversoes_google: parseInt(conversoesGoogle) || 0,
        topo_pesquisas: parseFloat(topoPesquisas) || 0,
        taxa_superacao: parseFloat(taxaSuperacao) || 0,
        top_palavras_chaves: palavrasArray,
        investimento_facebook: parseFloat(investimentoFacebook) || 0,
        impressoes_facebook: parseInt(impressoesFacebook) || 0,
        cliques_facebook: parseInt(cliquesFacebook) || 0,
        conversoes_facebook: parseInt(conversoesFacebook) || 0,
        alcance_facebook: parseInt(alcanceFacebook) || 0,
        ...(isEditing && {
          edited_at: new Date().toISOString(),
          edit_count: editCount + 1,
        }),
      };

      if (existingReportId) {
        const { error } = await supabase
          .from("relatorios")
          .update(reportData)
          .eq("id", existingReportId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("relatorios")
          .insert(reportData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relatorios"] });
      queryClient.invalidateQueries({ queryKey: ["relatorio", id] });
      toast({
        title: isEditing ? "Relatório atualizado!" : "Relatório salvo!",
        description: isEditing 
          ? `Edição #${editCount + 1} registrada para auditoria.`
          : "As métricas foram salvas com sucesso.",
      });
      setShowPreview(true);
      if (isEditing) {
        setEditCount(editCount + 1);
      }
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveRelatorioMutation.mutate();
  };

  if (!cliente) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const relatorioData = {
    data: format(selectedDate, "yyyy-MM-dd"),
    investimento_google: parseFloat(investimentoGoogle) || 0,
    impressoes_google: parseInt(impressoesGoogle) || 0,
    cliques_google: parseInt(cliquesGoogle) || 0,
    conversoes_google: parseInt(conversoesGoogle) || 0,
    topo_pesquisas: parseFloat(topoPesquisas) || 0,
    taxa_superacao: parseFloat(taxaSuperacao) || 0,
    top_palavras_chaves: palavrasChaves
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0),
    investimento_facebook: parseFloat(investimentoFacebook) || 0,
    impressoes_facebook: parseInt(impressoesFacebook) || 0,
    cliques_facebook: parseInt(cliquesFacebook) || 0,
    conversoes_facebook: parseInt(conversoesFacebook) || 0,
    alcance_facebook: parseInt(alcanceFacebook) || 0,
    edited_at: isEditing ? new Date().toISOString() : null,
    edit_count: isEditing ? editCount + 1 : 0,
    // Balance info (manual)
    saldo_google: saldoGoogle ? parseFloat(saldoGoogle) : null,
    dias_google: diasGoogle ? parseInt(diasGoogle) : null,
    saldo_meta: saldoMeta ? parseFloat(saldoMeta) : null,
    dias_meta: diasMeta ? parseInt(diasMeta) : null,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/cliente/${id}`)}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <VCDLogo size="sm" />
          {isEditing && (
            <Badge variant="outline" className="ml-4 border-orange-500/50 text-orange-500 flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              Modo Edição
            </Badge>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isEditing ? "Editar Relatório de Métricas" : "Novo Relatório de Métricas"}
            </h1>
            <p className="text-muted-foreground">
              {cliente.nome} - Preencha os dados de performance
            </p>
            {isEditing && editCount > 0 && (
              <p className="text-sm text-orange-500 mt-2">
                Este relatório já foi editado {editCount} vez(es)
              </p>
            )}
          </div>

          {showPreview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                variant="outline"
                className="mb-6"
                onClick={() => setShowPreview(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Formulário
              </Button>
              <RelatorioPDFExport cliente={cliente} relatorio={relatorioData} />
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSave}
              className="space-y-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Date Selector */}
              <div className="vcd-card">
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Período do Relatório
                  </h2>
                  {isEditing && (
                    <Badge variant="secondary" className="ml-auto">
                      Relatório existente
                    </Badge>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full md:w-auto h-12 justify-start text-left font-normal bg-secondary border-border hover:bg-secondary/80"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-card border-border"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Google Ads Section */}
              <div className="vcd-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#4285f4]/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-[#4285f4]" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Google Ads
                  </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <InputField
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Investimento (R$)"
                    value={investimentoGoogle}
                    onChange={setInvestimentoGoogle}
                    type="number"
                    placeholder="0.00"
                  />
                  <InputField
                    icon={<Eye className="w-4 h-4" />}
                    label="Impressões"
                    value={impressoesGoogle}
                    onChange={setImpressoesGoogle}
                    type="number"
                    placeholder="0"
                  />
                  <InputField
                    icon={<MousePointer className="w-4 h-4" />}
                    label="Cliques"
                    value={cliquesGoogle}
                    onChange={setCliquesGoogle}
                    type="number"
                    placeholder="0"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <InputField
                    icon={<Target className="w-4 h-4" />}
                    label="Conversões"
                    value={conversoesGoogle}
                    onChange={setConversoesGoogle}
                    type="number"
                    placeholder="0"
                  />
                  <InputField
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Topo das Pesquisas (%)"
                    value={topoPesquisas}
                    onChange={setTopoPesquisas}
                    type="number"
                    placeholder="0"
                  />
                  <InputField
                    icon={<Award className="w-4 h-4" />}
                    label="Taxa de Superação (%)"
                    value={taxaSuperacao}
                    onChange={setTaxaSuperacao}
                    type="number"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Top 3 Palavras-Chave (separadas por vírgula)
                  </label>
                  <Input
                    value={palavrasChaves}
                    onChange={(e) => setPalavrasChaves(e.target.value)}
                    placeholder="Ex: palavra1, palavra2, palavra3"
                    className="h-12 bg-secondary border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Facebook/Meta Section */}
              <div className="vcd-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#1877f2]/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[#1877f2]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Meta Ads (Facebook/Instagram)
                  </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <InputField
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Investimento (R$)"
                    value={investimentoFacebook}
                    onChange={setInvestimentoFacebook}
                    type="number"
                    placeholder="0.00"
                  />
                  <InputField
                    icon={<Eye className="w-4 h-4" />}
                    label="Impressões"
                    value={impressoesFacebook}
                    onChange={setImpressoesFacebook}
                    type="number"
                    placeholder="0"
                  />
                  <InputField
                    icon={<MousePointer className="w-4 h-4" />}
                    label="Cliques"
                    value={cliquesFacebook}
                    onChange={setCliquesFacebook}
                    type="number"
                    placeholder="0"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <InputField
                    icon={<Target className="w-4 h-4" />}
                    label="Conversões"
                    value={conversoesFacebook}
                    onChange={setConversoesFacebook}
                    type="number"
                    placeholder="0"
                  />
                  <InputField
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="Alcance"
                    value={alcanceFacebook}
                    onChange={setAlcanceFacebook}
                    type="number"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Balance Section - Optional */}
              <div className="vcd-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Saldo das Contas
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Deixe em branco para clientes recorrentes/cartão
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Google Balance */}
                  <div className="space-y-4 p-4 rounded-xl bg-[#4285f4]/5 border border-[#4285f4]/20">
                    <p className="text-sm font-medium text-[#4285f4] flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Google Ads
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        icon={<Wallet className="w-4 h-4" />}
                        label="Saldo (R$)"
                        value={saldoGoogle}
                        onChange={setSaldoGoogle}
                        type="number"
                        placeholder="0.00"
                      />
                      <InputField
                        icon={<Clock className="w-4 h-4" />}
                        label="Dias p/ Recarga"
                        value={diasGoogle}
                        onChange={setDiasGoogle}
                        type="number"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Meta Balance */}
                  <div className="space-y-4 p-4 rounded-xl bg-[#1877f2]/5 border border-[#1877f2]/20">
                    <p className="text-sm font-medium text-[#1877f2] flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Meta Ads
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        icon={<Wallet className="w-4 h-4" />}
                        label="Saldo (R$)"
                        value={saldoMeta}
                        onChange={setSaldoMeta}
                        type="number"
                        placeholder="0.00"
                      />
                      <InputField
                        icon={<Clock className="w-4 h-4" />}
                        label="Dias p/ Recarga"
                        value={diasMeta}
                        onChange={setDiasMeta}
                        type="number"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={saveRelatorioMutation.isPending}
                className={cn(
                  "w-full h-14 text-lg font-semibold transition-all duration-200 hover:scale-[1.02]",
                  isEditing 
                    ? "bg-orange-500 hover:bg-orange-600 text-white" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow"
                )}
              >
                {saveRelatorioMutation.isPending ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isEditing ? <Edit3 className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    {isEditing ? "Atualizar Relatório" : "Salvar e Visualizar Relatório"}
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </motion.div>
      </main>
    </div>
  );
};

interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}

const InputField = ({
  icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: InputFieldProps) => {
  // For numeric inputs, we want empty field by default with placeholder showing "0"
  const isNumeric = type === "number";
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isNumeric) {
      // Allow empty, digits, and decimal point only
      if (newValue === "" || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
        onChange(newValue);
      }
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        {label}
      </label>
      <Input
        type="text"
        inputMode={isNumeric ? "decimal" : "text"}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-12 bg-secondary border-border focus:border-primary"
      />
    </div>
  );
};

export default NovoRelatorio;
