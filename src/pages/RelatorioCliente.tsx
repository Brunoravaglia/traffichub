import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  CalendarIcon,
  Download,
  Eye,
  Image,
  Plus,
  Save,
  Trash2,
  Upload,
  MousePointer,
  MessageSquare,
  DollarSign,
  Target,
  TrendingUp,
  Mail,
  Users,
  BarChart3,
} from "lucide-react";
import VCDLogo from "@/components/VCDLogo";
import { cn } from "@/lib/utils";

interface Creative {
  id: string;
  url: string;
  name: string;
  platform: "google" | "meta";
}

interface RankingCreative {
  id: string;
  url: string;
  result: string;
  position: 1 | 2 | 3;
}

interface ReportData {
  objetivos: string[];
  google: {
    cliques: number;
    impressoes: number;
    contatos: number;
    investido: number;
    custoPorLead: number;
    cpm: number;
  };
  meta: {
    impressoes: number;
    engajamento: number;
    conversas: number;
    investido: number;
    custoPorLead: number;
    cpm: number;
    custoPorSeguidor: number;
  };
  resumo: string;
  criativos: Creative[];
  criativosRanking: RankingCreative[];
  showRanking: boolean;
  metricsConfig: {
    showGoogleCustoPorLead: boolean;
    showGoogleCpm: boolean;
    showMetaCustoPorLead: boolean;
    showMetaCpm: boolean;
    showMetaCustoPorSeguidor: boolean;
  };
  sectionsConfig: {
    showObjetivos: boolean;
    showGoogleAds: boolean;
    showMetaAds: boolean;
    showCriativosGoogle: boolean;
    showCriativosMeta: boolean;
    showResumo: boolean;
  };
}

const defaultReportData: ReportData = {
  objetivos: [
    "Aumentar a visibilidade e reconhecimento da marca",
    "Aumentar o Número de Leads Qualificados",
  ],
  google: { cliques: 0, impressoes: 0, contatos: 0, investido: 0, custoPorLead: 0, cpm: 0 },
  meta: { impressoes: 0, engajamento: 0, conversas: 0, investido: 0, custoPorLead: 0, cpm: 0, custoPorSeguidor: 0 },
  resumo: "",
  criativos: [],
  criativosRanking: [],
  showRanking: false,
  metricsConfig: {
    showGoogleCustoPorLead: true,
    showGoogleCpm: false,
    showMetaCustoPorLead: true,
    showMetaCpm: false,
    showMetaCustoPorSeguidor: false,
  },
  sectionsConfig: {
    showObjetivos: true,
    showGoogleAds: true,
    showMetaAds: true,
    showCriativosGoogle: true,
    showCriativosMeta: true,
    showResumo: true,
  },
};

const RelatorioCliente = () => {
  const { id: clienteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pdfRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rankingInputRef = useRef<HTMLInputElement>(null);

  const [isPreview, setIsPreview] = useState(false);
  const [periodoInicio, setPeriodoInicio] = useState<Date>(new Date());
  const [periodoFim, setPeriodoFim] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<ReportData>(defaultReportData);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingRanking, setUploadingRanking] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<"google" | "meta">("google");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch client data
  const { data: cliente, isLoading: clienteLoading } = useQuery({
    queryKey: ["cliente", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", clienteId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clienteId,
  });

  // Auto-calculate CPL and CPM
  const calculateMetrics = () => {
    const googleCPL = reportData.google.contatos > 0 
      ? reportData.google.investido / reportData.google.contatos 
      : 0;
    const googleCPM = reportData.google.impressoes > 0 
      ? (reportData.google.investido / reportData.google.impressoes) * 1000 
      : 0;
    const metaCPL = reportData.meta.conversas > 0 
      ? reportData.meta.investido / reportData.meta.conversas 
      : 0;
    const metaCPM = reportData.meta.impressoes > 0 
      ? (reportData.meta.investido / reportData.meta.impressoes) * 1000 
      : 0;
    
    setReportData(prev => ({
      ...prev,
      google: { ...prev.google, custoPorLead: googleCPL, cpm: googleCPM },
      meta: { ...prev.meta, custoPorLead: metaCPL, cpm: metaCPM },
    }));
  };

  // Save report mutation
  const saveReportMutation = useMutation({
    mutationFn: async () => {
      const dataValues = JSON.parse(JSON.stringify({
        google: reportData.google,
        meta: reportData.meta,
        objetivos: reportData.objetivos.filter(Boolean),
        resumo: reportData.resumo,
        criativos: reportData.criativos,
        criativosRanking: reportData.criativosRanking,
        showRanking: reportData.showRanking,
        metricsConfig: reportData.metricsConfig,
        sectionsConfig: reportData.sectionsConfig,
      }));
      
      const { error } = await supabase
        .from("client_reports")
        .insert([{
          cliente_id: clienteId!,
          nome: `Relatório ${format(periodoInicio, "MMMM yyyy", { locale: ptBR })}`,
          periodo_inicio: format(periodoInicio, "yyyy-MM-dd"),
          periodo_fim: format(periodoFim, "yyyy-MM-dd"),
          data_values: dataValues,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Relatório salvo com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["client-reports", clienteId] });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });

  // Upload creative image
  const handleUploadCreative = async (e: React.ChangeEvent<HTMLInputElement>, platform: "google" | "meta") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const platformCreatives = reportData.criativos.filter(c => c.platform === platform);
    if (platformCreatives.length >= 5) {
      toast({ title: `Limite de 5 criativos ${platform === "google" ? "Google" : "Meta"} atingido`, variant: "destructive" });
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${clienteId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("report-assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("report-assets")
        .getPublicUrl(fileName);

      setReportData((prev) => ({
        ...prev,
        criativos: [
          ...prev.criativos,
          { id: Date.now().toString(), url: urlData.publicUrl, name: file.name, platform },
        ],
      }));

      toast({ title: "Criativo adicionado!" });
    } catch (error: any) {
      toast({ title: "Erro ao fazer upload", description: error.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Upload ranking creative
  const handleUploadRankingCreative = async (e: React.ChangeEvent<HTMLInputElement>, position: 1 | 2 | 3) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRanking(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${clienteId}/ranking-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("report-assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("report-assets")
        .getPublicUrl(fileName);

      setReportData((prev) => {
        const existingIndex = prev.criativosRanking.findIndex(c => c.position === position);
        const newRanking: RankingCreative = {
          id: Date.now().toString(),
          url: urlData.publicUrl,
          result: "",
          position,
        };

        if (existingIndex >= 0) {
          const updated = [...prev.criativosRanking];
          updated[existingIndex] = newRanking;
          return { ...prev, criativosRanking: updated };
        }

        return { ...prev, criativosRanking: [...prev.criativosRanking, newRanking] };
      });

      toast({ title: `TOP ${position} adicionado!` });
    } catch (error: any) {
      toast({ title: "Erro ao fazer upload", description: error.message, variant: "destructive" });
    } finally {
      setUploadingRanking(false);
      if (rankingInputRef.current) rankingInputRef.current.value = "";
    }
  };

  const updateRankingResult = (position: 1 | 2 | 3, result: string) => {
    setReportData((prev) => ({
      ...prev,
      criativosRanking: prev.criativosRanking.map((c) =>
        c.position === position ? { ...c, result } : c
      ),
    }));
  };

  // Remove creative
  const handleRemoveCreative = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      criativos: prev.criativos.filter((c) => c.id !== id),
    }));
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (!pdfRef.current) return;

    toast({ title: "Gerando PDF...", description: "Por favor aguarde" });

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#1a1a2e",
        width: pdfRef.current.scrollWidth,
        height: pdfRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      // Fit to page without white borders
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(scaledHeight, pdfHeight));

      const clienteName = cliente?.nome || "Relatorio";
      const period = format(periodoInicio, "MMMM", { locale: ptBR });
      pdf.save(`Relatorio_${clienteName}_${period}.pdf`);

      toast({ title: "PDF gerado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro ao gerar PDF", description: error.message, variant: "destructive" });
    }
  };

  // Save and export
  const handleSaveAndExport = async () => {
    setIsSaving(true);
    calculateMetrics();
    await saveReportMutation.mutateAsync();
    await handleExportPDF();
    setIsSaving(false);
  };

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  // Format number
  const formatNumber = (value: number) =>
    new Intl.NumberFormat("pt-BR").format(value);

  if (clienteLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={cliente?.logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {cliente?.nome?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-foreground">{cliente?.nome}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => saveReportMutation.mutate()}
              disabled={saveReportMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button
              variant={isPreview ? "default" : "outline"}
              onClick={() => {
                calculateMetrics();
                setIsPreview(!isPreview);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? "Editar" : "Preview"}
            </Button>
            <Button 
              onClick={handleSaveAndExport} 
              className="bg-primary hover:bg-primary/90"
              disabled={isSaving}
            >
              <Download className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar e Exportar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {!isPreview ? (
          // Editor Mode
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Period Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Período do Relatório
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(periodoInicio, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={periodoInicio}
                          onSelect={(date) => date && setPeriodoInicio(date)}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(periodoFim, "dd/MM/yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={periodoFim}
                          onSelect={(date) => date && setPeriodoFim(date)}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Visibility Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Seções do Relatório
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Mostrar Objetivos</Label>
                  <Switch
                    checked={reportData.sectionsConfig.showObjetivos}
                    onCheckedChange={(checked) =>
                      setReportData({
                        ...reportData,
                        sectionsConfig: { ...reportData.sectionsConfig, showObjetivos: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Mostrar Tráfego Google</Label>
                  <Switch
                    checked={reportData.sectionsConfig.showGoogleAds}
                    onCheckedChange={(checked) =>
                      setReportData({
                        ...reportData,
                        sectionsConfig: { ...reportData.sectionsConfig, showGoogleAds: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Mostrar Tráfego Meta</Label>
                  <Switch
                    checked={reportData.sectionsConfig.showMetaAds}
                    onCheckedChange={(checked) =>
                      setReportData({
                        ...reportData,
                        sectionsConfig: { ...reportData.sectionsConfig, showMetaAds: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Mostrar Criativos Google</Label>
                  <Switch
                    checked={reportData.sectionsConfig.showCriativosGoogle}
                    onCheckedChange={(checked) =>
                      setReportData({
                        ...reportData,
                        sectionsConfig: { ...reportData.sectionsConfig, showCriativosGoogle: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Mostrar Criativos Meta</Label>
                  <Switch
                    checked={reportData.sectionsConfig.showCriativosMeta}
                    onCheckedChange={(checked) =>
                      setReportData({
                        ...reportData,
                        sectionsConfig: { ...reportData.sectionsConfig, showCriativosMeta: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Mostrar Resumo</Label>
                  <Switch
                    checked={reportData.sectionsConfig.showResumo}
                    onCheckedChange={(checked) =>
                      setReportData({
                        ...reportData,
                        sectionsConfig: { ...reportData.sectionsConfig, showResumo: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Objectives */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportData.objetivos.map((obj, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={obj}
                      onChange={(e) => {
                        const newObjetivos = [...reportData.objetivos];
                        newObjetivos[index] = e.target.value;
                        setReportData({ ...reportData, objetivos: newObjetivos });
                      }}
                      placeholder={`Objetivo ${index + 1}`}
                    />
                    {reportData.objetivos.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setReportData({
                            ...reportData,
                            objetivos: reportData.objetivos.filter((_, i) => i !== index),
                          })
                        }
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    setReportData({ ...reportData, objetivos: [...reportData.objetivos, ""] })
                  }
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Objetivo
                </Button>
              </CardContent>
            </Card>

            {/* Google Ads Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                    <span className="text-blue-500 text-xs font-bold">G</span>
                  </div>
                  Tráfego Google Ads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MousePointer className="w-4 h-4 text-muted-foreground" />
                      Cliques
                    </Label>
                    <Input
                      type="number"
                      value={reportData.google.cliques}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          google: { ...reportData.google, cliques: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      Impressões
                    </Label>
                    <Input
                      type="number"
                      value={reportData.google.impressoes}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          google: { ...reportData.google, impressoes: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Contatos/Leads
                    </Label>
                    <Input
                      type="number"
                      value={reportData.google.contatos}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          google: { ...reportData.google, contatos: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Investido (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={reportData.google.investido}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          google: { ...reportData.google, investido: parseFloat(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
                
                {/* Google Metrics Config */}
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground">Métricas calculadas a exibir:</p>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Custo por Lead (CPL)</Label>
                    <Switch
                      checked={reportData.metricsConfig.showGoogleCustoPorLead}
                      onCheckedChange={(checked) =>
                        setReportData({
                          ...reportData,
                          metricsConfig: { ...reportData.metricsConfig, showGoogleCustoPorLead: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">CPM (Custo por Mil)</Label>
                    <Switch
                      checked={reportData.metricsConfig.showGoogleCpm}
                      onCheckedChange={(checked) =>
                        setReportData({
                          ...reportData,
                          metricsConfig: { ...reportData.metricsConfig, showGoogleCpm: checked },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meta Ads Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center">
                    <span className="text-purple-500 text-xs font-bold">M</span>
                  </div>
                  Tráfego Meta Ads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      Impressões
                    </Label>
                    <Input
                      type="number"
                      value={reportData.meta.impressoes}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          meta: { ...reportData.meta, impressoes: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      Engajamento
                    </Label>
                    <Input
                      type="number"
                      value={reportData.meta.engajamento}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          meta: { ...reportData.meta, engajamento: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      Conversas Iniciadas
                    </Label>
                    <Input
                      type="number"
                      value={reportData.meta.conversas}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          meta: { ...reportData.meta, conversas: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Investido (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={reportData.meta.investido}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          meta: { ...reportData.meta, investido: parseFloat(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Custo por Seguidor (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={reportData.meta.custoPorSeguidor}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          meta: { ...reportData.meta, custoPorSeguidor: parseFloat(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
                
                {/* Meta Metrics Config */}
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground">Métricas calculadas a exibir:</p>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Custo por Lead (CPL)</Label>
                    <Switch
                      checked={reportData.metricsConfig.showMetaCustoPorLead}
                      onCheckedChange={(checked) =>
                        setReportData({
                          ...reportData,
                          metricsConfig: { ...reportData.metricsConfig, showMetaCustoPorLead: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">CPM (Custo por Mil)</Label>
                    <Switch
                      checked={reportData.metricsConfig.showMetaCpm}
                      onCheckedChange={(checked) =>
                        setReportData({
                          ...reportData,
                          metricsConfig: { ...reportData.metricsConfig, showMetaCpm: checked },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Custo por Seguidor</Label>
                    <Switch
                      checked={reportData.metricsConfig.showMetaCustoPorSeguidor}
                      onCheckedChange={(checked) =>
                        setReportData({
                          ...reportData,
                          metricsConfig: { ...reportData.metricsConfig, showMetaCustoPorSeguidor: checked },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creatives - Google */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                    <span className="text-blue-500 text-xs font-bold">G</span>
                  </div>
                  Criativos Google ({reportData.criativos.filter(c => c.platform === "google").length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {reportData.criativos.filter(c => c.platform === "google").map((creative) => (
                    <div
                      key={creative.id}
                      className="relative group rounded-lg overflow-hidden border border-border aspect-square"
                    >
                      <img src={creative.url} alt={creative.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveCreative(creative.id)}
                        className="absolute top-2 right-2 p-1 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                  {reportData.criativos.filter(c => c.platform === "google").length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-blue-500/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors cursor-pointer">
                      {uploadingImage ? (
                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleUploadCreative(e, "google")} className="hidden" />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Creatives - Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center">
                    <span className="text-purple-500 text-xs font-bold">M</span>
                  </div>
                  Criativos Meta ({reportData.criativos.filter(c => c.platform === "meta").length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {reportData.criativos.filter(c => c.platform === "meta").map((creative) => (
                    <div
                      key={creative.id}
                      className="relative group rounded-lg overflow-hidden border border-border aspect-square"
                    >
                      <img src={creative.url} alt={creative.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveCreative(creative.id)}
                        className="absolute top-2 right-2 p-1 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                  {reportData.criativos.filter(c => c.platform === "meta").length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-purple-500/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-purple-500 transition-colors cursor-pointer">
                      {uploadingImage ? (
                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6" />
                          <span className="text-xs">Upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleUploadCreative(e, "meta")} className="hidden" />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ranking Criativos */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Ranking de Criativos (Top 3)
                  </CardTitle>
                  <Switch
                    checked={reportData.showRanking}
                    onCheckedChange={(checked) => setReportData({ ...reportData, showRanking: checked })}
                  />
                </div>
              </CardHeader>
              {reportData.showRanking && (
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {([1, 2, 3] as const).map((position) => {
                      const ranking = reportData.criativosRanking.find(c => c.position === position);
                      return (
                        <div key={position} className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <span className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              position === 1 ? "bg-yellow-500 text-black" :
                              position === 2 ? "bg-gray-400 text-black" :
                              "bg-amber-700 text-white"
                            )}>
                              {position}
                            </span>
                            TOP {position}
                          </Label>
                          {ranking?.url ? (
                            <div className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                              <img src={ranking.url} alt={`TOP ${position}`} className="w-full h-full object-cover" />
                              <button
                                onClick={() => setReportData(prev => ({
                                  ...prev,
                                  criativosRanking: prev.criativosRanking.filter(c => c.position !== position)
                                }))}
                                className="absolute top-2 right-2 p-1 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4 text-destructive-foreground" />
                              </button>
                            </div>
                          ) : (
                            <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                              {uploadingRanking ? (
                                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6" />
                                  <span className="text-xs">Upload</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleUploadRankingCreative(e, position)}
                                className="hidden"
                              />
                            </label>
                          )}
                          <Input
                            placeholder="Ex: 20 leads"
                            value={ranking?.result || ""}
                            onChange={(e) => updateRankingResult(position, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Summary */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Resumo Geral dos Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={reportData.resumo}
                  onChange={(e) => setReportData({ ...reportData, resumo: e.target.value })}
                  placeholder="Descreva os resultados gerais da campanha..."
                  rows={5}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Preview Mode - PDF Template
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div
              ref={pdfRef}
              className="w-full max-w-[800px] text-white rounded-lg shadow-2xl overflow-hidden"
              style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#1a1a2e" }}
            >
              {/* Header with Client Logo + Name */}
              <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {cliente?.logo_url ? (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/20" style={{ backgroundColor: "transparent" }}>
                        <img
                          src={cliente.logo_url}
                          alt={cliente.nome}
                          className="w-full h-full object-cover rounded-xl"
                          crossOrigin="anonymous"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                        <span className="text-3xl font-bold">{cliente?.nome?.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-2xl font-bold text-primary uppercase">{cliente?.nome}</p>
                      <p className="text-sm text-gray-400">Relatório de Performance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-2xl font-bold text-white mb-1">RESULTADOS DE CAMPANHA</h1>
                    <p className="text-lg text-gray-400 uppercase font-semibold">
                      Mês de {format(periodoInicio, "MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Period */}
                <div className="text-center mb-6 text-sm text-gray-400 tracking-widest uppercase">
                  Campanhas de {format(periodoInicio, "dd/MM")} à {format(periodoFim, "dd/MM")}
                </div>

                {/* Objectives */}
                {reportData.sectionsConfig.showObjetivos && reportData.objetivos.filter(Boolean).length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <h2 className="text-lg font-bold mb-3 text-primary tracking-widest">OBJETIVOS</h2>
                    <ul className="space-y-2">
                      {reportData.objetivos.filter(Boolean).map((obj, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-300">
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Google Ads Section */}
                {reportData.sectionsConfig.showGoogleAds && (
                  <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-blue-900/40 to-blue-900/10 border border-blue-500/30">
                    <h3 className="text-lg font-bold mb-4 text-blue-400">TRÁFEGO GOOGLE</h3>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-white">{formatNumber(reportData.google.cliques)}</p>
                        <p className="text-xs text-gray-400">Cliques</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-white">{formatNumber(reportData.google.impressoes)}</p>
                        <p className="text-xs text-gray-400">Impressões</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-white">{formatNumber(reportData.google.contatos)}</p>
                        <p className="text-xs text-gray-400">Contatos</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-white">{formatCurrency(reportData.google.investido)}</p>
                        <p className="text-xs text-gray-400">Investidos</p>
                      </div>
                    </div>
                    {(reportData.metricsConfig.showGoogleCustoPorLead || reportData.metricsConfig.showGoogleCpm) && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {reportData.metricsConfig.showGoogleCustoPorLead && (
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <p className="text-xl font-bold text-green-400">{formatCurrency(reportData.google.custoPorLead)}</p>
                            <p className="text-xs text-gray-400">Custo por Lead</p>
                          </div>
                        )}
                        {reportData.metricsConfig.showGoogleCpm && (
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <p className="text-xl font-bold text-yellow-400">{formatCurrency(reportData.google.cpm)}</p>
                            <p className="text-xs text-gray-400">CPM</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Meta Ads Section */}
                {reportData.sectionsConfig.showMetaAds && (
                  <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-purple-900/40 to-purple-900/10 border border-purple-500/30">
                    <h3 className="text-lg font-bold mb-4 text-purple-400">TRÁFEGO META ADS</h3>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-white">{formatNumber(reportData.meta.impressoes)}</p>
                        <p className="text-xs text-gray-400">Impressões</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-white">{formatNumber(reportData.meta.engajamento)}</p>
                        <p className="text-xs text-gray-400">Engajamento</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-white">{formatNumber(reportData.meta.conversas)}</p>
                        <p className="text-xs text-gray-400">Conversas</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-white">{formatCurrency(reportData.meta.investido)}</p>
                        <p className="text-xs text-gray-400">Investidos</p>
                      </div>
                    </div>
                    {(reportData.metricsConfig.showMetaCustoPorLead || reportData.metricsConfig.showMetaCpm || reportData.metricsConfig.showMetaCustoPorSeguidor) && (
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        {reportData.metricsConfig.showMetaCustoPorLead && (
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <p className="text-xl font-bold text-green-400">{formatCurrency(reportData.meta.custoPorLead)}</p>
                            <p className="text-xs text-gray-400">Custo por Lead</p>
                          </div>
                        )}
                        {reportData.metricsConfig.showMetaCpm && (
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <p className="text-xl font-bold text-yellow-400">{formatCurrency(reportData.meta.cpm)}</p>
                            <p className="text-xs text-gray-400">CPM</p>
                          </div>
                        )}
                        {reportData.metricsConfig.showMetaCustoPorSeguidor && (
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <p className="text-xl font-bold text-pink-400">{formatCurrency(reportData.meta.custoPorSeguidor)}</p>
                            <p className="text-xs text-gray-400">Custo/Seguidor</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Google Creatives */}
                {reportData.sectionsConfig.showCriativosGoogle && reportData.criativos.filter(c => c.platform === "google").length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-blue-400 tracking-widest">
                      CRIATIVOS GOOGLE
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {reportData.criativos.filter(c => c.platform === "google").slice(0, 5).map((creative) => (
                        <div key={creative.id} className="rounded-lg overflow-hidden border border-blue-500/30">
                          <img src={creative.url} alt={creative.name} className="w-full aspect-square object-cover" crossOrigin="anonymous" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Creatives */}
                {reportData.sectionsConfig.showCriativosMeta && reportData.criativos.filter(c => c.platform === "meta").length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-purple-400 tracking-widest">
                      CRIATIVOS META
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {reportData.criativos.filter(c => c.platform === "meta").slice(0, 5).map((creative) => (
                        <div key={creative.id} className="rounded-lg overflow-hidden border border-purple-500/30">
                          <img src={creative.url} alt={creative.name} className="w-full aspect-square object-cover" crossOrigin="anonymous" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ranking Section */}
                {reportData.showRanking && reportData.criativosRanking.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-900/10 border border-yellow-500/30">
                    <h3 className="text-lg font-bold mb-4 text-yellow-400 tracking-widest">
                      🏆 RANKING DE CRIATIVOS
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {reportData.criativosRanking.sort((a, b) => a.position - b.position).map((ranking) => (
                        <div key={ranking.id} className="text-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2",
                            ranking.position === 1 ? "bg-yellow-500 text-black" :
                            ranking.position === 2 ? "bg-gray-400 text-black" :
                            "bg-amber-700 text-white"
                          )}>
                            {ranking.position}
                          </div>
                          <div className="rounded-lg overflow-hidden border border-white/10 mb-2">
                            <img src={ranking.url} alt={`TOP ${ranking.position}`} className="w-full aspect-square object-cover" crossOrigin="anonymous" />
                          </div>
                          <p className="text-sm font-semibold text-white">{ranking.result || "-"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {reportData.sectionsConfig.showResumo && reportData.resumo && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold mb-3 text-primary tracking-widest">
                      Resumo geral dos resultados
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm">{reportData.resumo}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <VCDLogo size="sm" showText={false} />
                    <div>
                      <p className="text-xs text-gray-500">Você Digital Propaganda</p>
                      <p className="text-xs text-gray-500">www.vocedigitalpropaganda.com.br</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Relatório gerado em</p>
                    <p>{format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RelatorioCliente;
