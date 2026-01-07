import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Download, Save, TrendingUp, Target, MousePointerClick, Eye, Users, DollarSign, Award, Search } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VCDLogo from "./VCDLogo";
import ReportPDF from "./ReportPDF";

const ReportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showPDF, setShowPDF] = useState(false);

  // Form state
  const [googleMetrics, setGoogleMetrics] = useState({
    investimento: 0,
    impressoes: 0,
    cliques: 0,
    conversoes: 0,
    topoPesquisas: 0,
    taxaSuperacao: 0,
    topPalavras: ["", "", ""],
  });

  const [facebookMetrics, setFacebookMetrics] = useState({
    investimento: 0,
    cliques: 0,
    conversoes: 0,
    alcance: 0,
    impressoes: 0,
  });

  // Fetch client
  const { data: cliente, isLoading: loadingCliente } = useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*, gestores(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch existing report for today
  const { data: existingReport } = useQuery({
    queryKey: ["relatorio", id, new Date().toISOString().split("T")[0]],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("relatorios")
        .select("*")
        .eq("cliente_id", id)
        .eq("data", today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Load existing report data
  useEffect(() => {
    if (existingReport) {
      setGoogleMetrics({
        investimento: Number(existingReport.investimento_google) || 0,
        impressoes: existingReport.impressoes_google || 0,
        cliques: existingReport.cliques_google || 0,
        conversoes: existingReport.conversoes_google || 0,
        topoPesquisas: Number(existingReport.topo_pesquisas) || 0,
        taxaSuperacao: Number(existingReport.taxa_superacao) || 0,
        topPalavras: existingReport.top_palavras_chaves || ["", "", ""],
      });
      setFacebookMetrics({
        investimento: Number(existingReport.investimento_facebook) || 0,
        cliques: existingReport.cliques_facebook || 0,
        conversoes: existingReport.conversoes_facebook || 0,
        alcance: existingReport.alcance_facebook || 0,
        impressoes: existingReport.impressoes_facebook || 0,
      });
    }
  }, [existingReport]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const reportData = {
        cliente_id: id,
        data: today,
        investimento_google: googleMetrics.investimento,
        impressoes_google: googleMetrics.impressoes,
        cliques_google: googleMetrics.cliques,
        conversoes_google: googleMetrics.conversoes,
        topo_pesquisas: googleMetrics.topoPesquisas,
        taxa_superacao: googleMetrics.taxaSuperacao,
        top_palavras_chaves: googleMetrics.topPalavras.filter(p => p.trim() !== ""),
        investimento_facebook: facebookMetrics.investimento,
        cliques_facebook: facebookMetrics.cliques,
        conversoes_facebook: facebookMetrics.conversoes,
        alcance_facebook: facebookMetrics.alcance,
        impressoes_facebook: facebookMetrics.impressoes,
      };

      if (existingReport?.id) {
        const { error } = await supabase
          .from("relatorios")
          .update(reportData)
          .eq("id", existingReport.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("relatorios").insert(reportData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Relatório salvo com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["relatorio"] });
    },
    onError: () => {
      toast.error("Erro ao salvar relatório");
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleExportPDF = () => {
    saveMutation.mutate();
    setShowPDF(true);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loadingCliente) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showPDF) {
    return (
      <ReportPDF
        cliente={cliente}
        googleMetrics={googleMetrics}
        facebookMetrics={facebookMetrics}
        onClose={() => setShowPDF(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full hover:bg-primary/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <VCDLogo size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={saveMutation.isPending}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="max-w-4xl mx-auto"
        >
          {/* Title */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Relatório de Performance</h1>
            </div>
            <p className="text-muted-foreground">
              Cliente: <span className="text-foreground font-medium">{cliente?.nome}</span>
              {cliente?.gestores && (
                <span className="ml-4">
                  Gestor: <span className="text-foreground font-medium">{cliente.gestores.nome}</span>
                </span>
              )}
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="google" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="google" className="gap-2">
                  <Search className="w-4 h-4" />
                  Google Ads
                </TabsTrigger>
                <TabsTrigger value="facebook" className="gap-2">
                  <Users className="w-4 h-4" />
                  Facebook Ads
                </TabsTrigger>
              </TabsList>

              {/* Google Ads Tab */}
              <TabsContent value="google" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Investimento */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <Label className="text-lg font-medium">Investimento</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="R$ 0,00"
                      value={googleMetrics.investimento || ""}
                      onChange={(e) =>
                        setGoogleMetrics({ ...googleMetrics, investimento: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>

                  {/* Impressões */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-primary" />
                      </div>
                      <Label className="text-lg font-medium">Impressões</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={googleMetrics.impressoes || ""}
                      onChange={(e) =>
                        setGoogleMetrics({ ...googleMetrics, impressoes: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>

                  {/* Cliques */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MousePointerClick className="w-5 h-5 text-primary" />
                      </div>
                      <Label className="text-lg font-medium">Cliques</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={googleMetrics.cliques || ""}
                      onChange={(e) =>
                        setGoogleMetrics({ ...googleMetrics, cliques: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>

                  {/* Conversões */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <Label className="text-lg font-medium">Conversões</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={googleMetrics.conversoes || ""}
                      onChange={(e) =>
                        setGoogleMetrics({ ...googleMetrics, conversoes: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>

                  {/* Topo das Pesquisas */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <Label className="text-lg font-medium">Topo das Pesquisas (%)</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0%"
                      value={googleMetrics.topoPesquisas || ""}
                      onChange={(e) =>
                        setGoogleMetrics({ ...googleMetrics, topoPesquisas: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>

                  {/* Taxa de Superação */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <Label className="text-lg font-medium">Taxa de Superação (%)</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0%"
                      value={googleMetrics.taxaSuperacao || ""}
                      onChange={(e) =>
                        setGoogleMetrics({ ...googleMetrics, taxaSuperacao: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>
                </div>

                {/* Top 3 Palavras-Chave */}
                <div className="vcd-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Search className="w-5 h-5 text-primary" />
                    </div>
                    <Label className="text-lg font-medium">Top 3 Palavras-Chave</Label>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {googleMetrics.topPalavras.map((palavra, index) => (
                      <div key={index} className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">
                          #{index + 1}
                        </span>
                        <Input
                          placeholder={`Palavra ${index + 1}`}
                          value={palavra}
                          onChange={(e) => {
                            const newPalavras = [...googleMetrics.topPalavras];
                            newPalavras[index] = e.target.value;
                            setGoogleMetrics({ ...googleMetrics, topPalavras: newPalavras });
                          }}
                          className="vcd-input pl-10"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Facebook Ads Tab */}
              <TabsContent value="facebook" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Investimento */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-500" />
                      </div>
                      <Label className="text-lg font-medium">Investimento</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="R$ 0,00"
                      value={facebookMetrics.investimento || ""}
                      onChange={(e) =>
                        setFacebookMetrics({ ...facebookMetrics, investimento: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>

                  {/* Cliques */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <MousePointerClick className="w-5 h-5 text-blue-500" />
                      </div>
                      <Label className="text-lg font-medium">Cliques</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={facebookMetrics.cliques || ""}
                      onChange={(e) =>
                        setFacebookMetrics({ ...facebookMetrics, cliques: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>

                  {/* Conversões */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-500" />
                      </div>
                      <Label className="text-lg font-medium">Conversões</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={facebookMetrics.conversoes || ""}
                      onChange={(e) =>
                        setFacebookMetrics({ ...facebookMetrics, conversoes: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>

                  {/* Alcance */}
                  <div className="vcd-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-500" />
                      </div>
                      <Label className="text-lg font-medium">Alcance</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={facebookMetrics.alcance || ""}
                      onChange={(e) =>
                        setFacebookMetrics({ ...facebookMetrics, alcance: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>

                  {/* Impressões */}
                  <div className="vcd-card md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-blue-500" />
                      </div>
                      <Label className="text-lg font-medium">Impressões</Label>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={facebookMetrics.impressoes || ""}
                      onChange={(e) =>
                        setFacebookMetrics({ ...facebookMetrics, impressoes: Number(e.target.value) })
                      }
                      className="vcd-input text-lg"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ReportForm;
