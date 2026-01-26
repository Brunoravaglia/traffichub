import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Sparkles,
  FileText,
} from "lucide-react";
import VCDLogo from "@/components/VCDLogo";
import { cn } from "@/lib/utils";
import TemplateSelector from "@/components/TemplateSelector";
import { useGestor } from "@/contexts/GestorContext";
import {
  AspectRatioSelector,
  aspectRatioOptionToCss,
  type AspectRatioOption,
} from "@/components/report/AspectRatioSelector";
import { CreativeGrid } from "@/components/report/CreativeGrid";
import { AdPanelGrid, type AdPanelImage } from "@/components/report/AdPanelGrid";
import { CustomSectionGrid, type CustomSection } from "@/components/report/CustomSectionGrid";

interface Creative {
  id: string;
  url: string;
  name: string;
  platform: "google" | "meta";
  aspectRatio?: AspectRatioOption;
}

interface RankingCreative {
  id: string;
  url: string;
  result: string;
  position: 1 | 2 | 3;
  aspectRatio?: AspectRatioOption;
}

interface ReportData {
  objetivos: string[];
  google: {
    cliques: number;
    impressoes: number;
    contatos: number;
    investido: number;
    saldoRestante: number;
    diasParaRecarga: number;
    custoPorLead: number;
    cpm: number;
    ctr: number;
    cpc: number;
    conversoes: number;
    taxaConversao: number;
    roas: number;
    custoConversao: number;
    alcance: number;
    frequencia: number;
    visualizacoesVideo: number;
    taxaVisualizacao: number;
    interacoes: number;
    taxaInteracao: number;
  };
  meta: {
    impressoes: number;
    engajamento: number;
    conversas: number;
    investido: number;
    saldoRestante: number;
    diasParaRecarga: number;
    custoPorLead: number;
    cpm: number;
    custoPorSeguidor: number;
    cliques: number;
    ctr: number;
    cpc: number;
    alcance: number;
    frequencia: number;
    leads: number;
    conversoes: number;
    roas: number;
    curtidasPagina: number;
    seguidores: number;
    compartilhamentos: number;
    salvos: number;
    comentarios: number;
    visualizacoesVideo: number;
    retencaoVideo: number;
    mensagensIniciadas: number;
    respostasMensagem: number;
    agendamentos: number;
    checkins: number;
  };
  resumo: string;
  criativos: Creative[];
  criativosRanking: RankingCreative[];
  showRanking: boolean;
  metricsConfig: {
    // Google metrics visibility
    showGoogleCustoPorLead: boolean;
    showGoogleCpm: boolean;
    showGoogleCtr: boolean;
    showGoogleCpc: boolean;
    showGoogleConversoes: boolean;
    showGoogleTaxaConversao: boolean;
    showGoogleRoas: boolean;
    showGoogleCustoConversao: boolean;
    showGoogleAlcance: boolean;
    showGoogleFrequencia: boolean;
    showGoogleVisualizacoesVideo: boolean;
    showGoogleTaxaVisualizacao: boolean;
    showGoogleInteracoes: boolean;
    showGoogleTaxaInteracao: boolean;
    // Meta metrics visibility
    showMetaCustoPorLead: boolean;
    showMetaCpm: boolean;
    showMetaCustoPorSeguidor: boolean;
    showMetaCliques: boolean;
    showMetaCtr: boolean;
    showMetaCpc: boolean;
    showMetaAlcance: boolean;
    showMetaFrequencia: boolean;
    showMetaLeads: boolean;
    showMetaConversoes: boolean;
    showMetaRoas: boolean;
    showMetaCurtidasPagina: boolean;
    showMetaSeguidores: boolean;
    showMetaCompartilhamentos: boolean;
    showMetaSalvos: boolean;
    showMetaComentarios: boolean;
    showMetaVisualizacoesVideo: boolean;
    showMetaRetencaoVideo: boolean;
    showMetaMensagensIniciadas: boolean;
    showMetaRespostasMensagem: boolean;
    showMetaAgendamentos: boolean;
    showMetaCheckins: boolean;
  };
  sectionsConfig: {
    showObjetivos: boolean;
    showGoogleAds: boolean;
    showMetaAds: boolean;
    showCriativosGoogle: boolean;
    showCriativosMeta: boolean;
    showResumo: boolean;
    showSaldoRestante: boolean;
    showPaineisAnuncio: boolean;
    showCustomSections: boolean;
  };
  paineisAnuncio: AdPanelImage[];
  customSections: CustomSection[];
}

const defaultReportData: ReportData = {
  objetivos: [
    "Aumentar a visibilidade e reconhecimento da marca",
    "Aumentar o Número de Leads Qualificados",
  ],
  google: { 
    cliques: 0, impressoes: 0, contatos: 0, investido: 0, custoPorLead: 0, cpm: 0,
    saldoRestante: 0, diasParaRecarga: 0,
    ctr: 0, cpc: 0, conversoes: 0, taxaConversao: 0, roas: 0, custoConversao: 0,
    alcance: 0, frequencia: 0, visualizacoesVideo: 0, taxaVisualizacao: 0, interacoes: 0, taxaInteracao: 0
  },
  meta: { 
    impressoes: 0, engajamento: 0, conversas: 0, investido: 0, custoPorLead: 0, cpm: 0, custoPorSeguidor: 0,
    saldoRestante: 0, diasParaRecarga: 0,
    cliques: 0, ctr: 0, cpc: 0, alcance: 0, frequencia: 0, leads: 0, conversoes: 0, roas: 0,
    curtidasPagina: 0, seguidores: 0, compartilhamentos: 0, salvos: 0, comentarios: 0,
    visualizacoesVideo: 0, retencaoVideo: 0, mensagensIniciadas: 0, respostasMensagem: 0, agendamentos: 0, checkins: 0
  },
  resumo: "",
  criativos: [],
  criativosRanking: [],
  showRanking: false,
  metricsConfig: {
    // Google - defaults
    showGoogleCustoPorLead: true,
    showGoogleCpm: false,
    showGoogleCtr: false,
    showGoogleCpc: false,
    showGoogleConversoes: true,
    showGoogleTaxaConversao: false,
    showGoogleRoas: false,
    showGoogleCustoConversao: false,
    showGoogleAlcance: false,
    showGoogleFrequencia: false,
    showGoogleVisualizacoesVideo: false,
    showGoogleTaxaVisualizacao: false,
    showGoogleInteracoes: false,
    showGoogleTaxaInteracao: false,
    // Meta - defaults
    showMetaCustoPorLead: true,
    showMetaCpm: false,
    showMetaCustoPorSeguidor: false,
    showMetaCliques: true,
    showMetaCtr: false,
    showMetaCpc: false,
    showMetaAlcance: true,
    showMetaFrequencia: false,
    showMetaLeads: true,
    showMetaConversoes: false,
    showMetaRoas: false,
    showMetaCurtidasPagina: false,
    showMetaSeguidores: false,
    showMetaCompartilhamentos: false,
    showMetaSalvos: false,
    showMetaComentarios: false,
    showMetaVisualizacoesVideo: false,
    showMetaRetencaoVideo: false,
    showMetaMensagensIniciadas: false,
    showMetaRespostasMensagem: false,
    showMetaAgendamentos: false,
    showMetaCheckins: false,
  },
  sectionsConfig: {
    showObjetivos: true,
    showGoogleAds: true,
    showMetaAds: true,
    showCriativosGoogle: true,
    showCriativosMeta: true,
    showResumo: true,
    showSaldoRestante: true,
    showPaineisAnuncio: false,
    showCustomSections: false,
  },
  paineisAnuncio: [],
  customSections: [],
};

const RelatorioCliente = () => {
  const { id: clienteId } = useParams();
  const [searchParams] = useSearchParams();
  const templateIdFromUrl = searchParams.get("templateId");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { gestor } = useGestor();
  const pdfRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rankingInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"template" | "editor">(templateIdFromUrl ? "editor" : "template");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(templateIdFromUrl || undefined);
  const [isPreview, setIsPreview] = useState(false);
  const [periodoInicio, setPeriodoInicio] = useState<Date>(new Date());
  const [periodoFim, setPeriodoFim] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<ReportData>(defaultReportData);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingRanking, setUploadingRanking] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<"google" | "meta">("google");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Save as template dialog state
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateIsGlobal, setTemplateIsGlobal] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Fetch and auto-apply template from URL
  const { data: urlTemplate } = useQuery({
    queryKey: ["template-from-url", templateIdFromUrl],
    queryFn: async () => {
      if (!templateIdFromUrl) return null;
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", templateIdFromUrl)
        .single();
      if (error) throw error;
      return {
        id: data.id,
        nome: data.nome,
        descricao: data.descricao || "",
        is_global: data.is_global,
        metrics: (data.layout as any)?.metrics || [],
        sections: (data.layout as any)?.sections || {},
      };
    },
    enabled: !!templateIdFromUrl,
  });

  // Apply template to report data
  const applyTemplate = (template: any) => {
    if (!template) {
      setStep("editor");
      return;
    }

    setSelectedTemplateId(template.id);
    
    // Apply sections config from template
    if (template.sections) {
      setReportData(prev => ({
        ...prev,
        sectionsConfig: {
          showObjetivos: template.sections.showObjetivos ?? true,
          showGoogleAds: template.sections.showGoogleAds ?? true,
          showMetaAds: template.sections.showMetaAds ?? true,
          showCriativosGoogle: template.sections.showCriativosGoogle ?? true,
          showCriativosMeta: template.sections.showCriativosMeta ?? true,
          showResumo: template.sections.showResumo ?? true,
          showSaldoRestante: template.sections.showSaldoRestante ?? true,
          showPaineisAnuncio: template.sections.showPaineisAnuncio ?? false,
          showCustomSections: template.sections.showCustomSections ?? false,
        },
        metricsConfig: applyMetricsFromTemplate(template.metrics || []),
      }));
    }
    
    setStep("editor");
    toast({ 
      title: "Modelo aplicado!", 
      description: `Usando "${template.nome}" como base para o relatório.` 
    });
  };

  // Auto-apply template when loaded from URL
  useEffect(() => {
    if (urlTemplate && templateIdFromUrl) {
      applyTemplate(urlTemplate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTemplate, templateIdFromUrl]);

  // Convert template metrics to metricsConfig format
  const applyMetricsFromTemplate = (metrics: any[]): ReportData["metricsConfig"] => {
    const config = { ...defaultReportData.metricsConfig };
    
    metrics.forEach((metric: any) => {
      const key = metric.key;
      const visible = metric.visible;
      
      // Map template metric keys to metricsConfig keys
      if (key === "google_cpl") config.showGoogleCustoPorLead = visible;
      else if (key === "google_cpm") config.showGoogleCpm = visible;
      else if (key === "google_ctr") config.showGoogleCtr = visible;
      else if (key === "google_cpc") config.showGoogleCpc = visible;
      else if (key === "google_conversoes") config.showGoogleConversoes = visible;
      else if (key === "google_taxa_conversao") config.showGoogleTaxaConversao = visible;
      else if (key === "google_roas") config.showGoogleRoas = visible;
      else if (key === "google_custo_conversao") config.showGoogleCustoConversao = visible;
      else if (key === "google_alcance") config.showGoogleAlcance = visible;
      else if (key === "google_frequencia") config.showGoogleFrequencia = visible;
      else if (key === "google_visualizacoes_video") config.showGoogleVisualizacoesVideo = visible;
      else if (key === "google_taxa_visualizacao") config.showGoogleTaxaVisualizacao = visible;
      else if (key === "google_interacoes") config.showGoogleInteracoes = visible;
      else if (key === "google_taxa_interacao") config.showGoogleTaxaInteracao = visible;
      else if (key === "meta_cpl") config.showMetaCustoPorLead = visible;
      else if (key === "meta_cpm") config.showMetaCpm = visible;
      else if (key === "meta_custo_seguidor") config.showMetaCustoPorSeguidor = visible;
      else if (key === "meta_cliques") config.showMetaCliques = visible;
      else if (key === "meta_ctr") config.showMetaCtr = visible;
      else if (key === "meta_cpc") config.showMetaCpc = visible;
      else if (key === "meta_alcance") config.showMetaAlcance = visible;
      else if (key === "meta_frequencia") config.showMetaFrequencia = visible;
      else if (key === "meta_leads") config.showMetaLeads = visible;
      else if (key === "meta_conversoes") config.showMetaConversoes = visible;
      else if (key === "meta_roas") config.showMetaRoas = visible;
      else if (key === "meta_curtidas_pagina") config.showMetaCurtidasPagina = visible;
      else if (key === "meta_seguidores") config.showMetaSeguidores = visible;
      else if (key === "meta_compartilhamentos") config.showMetaCompartilhamentos = visible;
      else if (key === "meta_salvos") config.showMetaSalvos = visible;
      else if (key === "meta_comentarios") config.showMetaComentarios = visible;
      else if (key === "meta_visualizacoes_video") config.showMetaVisualizacoesVideo = visible;
      else if (key === "meta_retencao_video") config.showMetaRetencaoVideo = visible;
      else if (key === "meta_mensagens_iniciadas") config.showMetaMensagensIniciadas = visible;
      else if (key === "meta_respostas_mensagem") config.showMetaRespostasMensagem = visible;
      else if (key === "meta_agendamentos") config.showMetaAgendamentos = visible;
      else if (key === "meta_checkins") config.showMetaCheckins = visible;
    });
    
    return config;
  };

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
          google_cliques: reportData.google.cliques,
          google_impressoes: reportData.google.impressoes,
          google_contatos: reportData.google.contatos,
          google_investido: reportData.google.investido,
          google_custo_por_lead: reportData.google.custoPorLead,
          google_cpm: reportData.google.cpm,
          meta_impressoes: reportData.meta.impressoes,
          meta_engajamento: reportData.meta.engajamento,
          meta_conversas: reportData.meta.conversas,
          meta_investido: reportData.meta.investido,
          meta_custo_por_lead: reportData.meta.custoPorLead,
          meta_cpm: reportData.meta.cpm,
          meta_custo_por_seguidor: reportData.meta.custoPorSeguidor,
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
      const pdfWidth = 210; // A4 width in mm
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      // Create PDF with custom height to fit all content (no page limit)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, scaledHeight],
      });

      // Add image at full size - allows report to be as long as needed
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);

      const clienteName = cliente?.nome || "Relatorio";
      const period = format(periodoInicio, "MMMM", { locale: ptBR });
      pdf.save(`Relatorio_${clienteName}_${period}.pdf`);

      toast({ title: "PDF gerado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro ao gerar PDF", description: error.message, variant: "destructive" });
    }
  };

  // Export PDF only (saves report automatically first)
  const handleExport = async () => {
    setIsExporting(true);
    calculateMetrics();
    await saveReportMutation.mutateAsync();
    await handleExportPDF();
    setIsExporting(false);
  };

  // Save current config as template
  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast({ title: "Nome obrigatório", description: "Digite um nome para o modelo", variant: "destructive" });
      return;
    }

    setIsSavingTemplate(true);
    try {
      // Convert current metricsConfig to template metrics format
      const metrics = [
        // Google metrics
        { key: "google_cliques", label: "Cliques", icon: "click", platform: "google", visible: true },
        { key: "google_impressoes", label: "Impressões", icon: "eye", platform: "google", visible: true },
        { key: "google_contatos", label: "Contatos/Leads", icon: "message", platform: "google", visible: true },
        { key: "google_investido", label: "Investido", icon: "dollar", platform: "google", visible: true },
        { key: "google_cpl", label: "Custo por Lead", icon: "target", platform: "google", visible: reportData.metricsConfig.showGoogleCustoPorLead },
        { key: "google_cpm", label: "CPM", icon: "trending", platform: "google", visible: reportData.metricsConfig.showGoogleCpm },
        { key: "google_ctr", label: "CTR (%)", icon: "percent", platform: "google", visible: reportData.metricsConfig.showGoogleCtr },
        { key: "google_cpc", label: "CPC", icon: "dollar", platform: "google", visible: reportData.metricsConfig.showGoogleCpc },
        { key: "google_conversoes", label: "Conversões", icon: "check", platform: "google", visible: reportData.metricsConfig.showGoogleConversoes },
        { key: "google_roas", label: "ROAS", icon: "trending", platform: "google", visible: reportData.metricsConfig.showGoogleRoas },
        // Meta metrics
        { key: "meta_impressoes", label: "Impressões", icon: "eye", platform: "meta", visible: true },
        { key: "meta_engajamento", label: "Engajamento", icon: "trending", platform: "meta", visible: true },
        { key: "meta_conversas", label: "Conversas", icon: "message", platform: "meta", visible: true },
        { key: "meta_investido", label: "Investido", icon: "dollar", platform: "meta", visible: true },
        { key: "meta_cpl", label: "Custo por Lead", icon: "target", platform: "meta", visible: reportData.metricsConfig.showMetaCustoPorLead },
        { key: "meta_cpm", label: "CPM", icon: "trending", platform: "meta", visible: reportData.metricsConfig.showMetaCpm },
        { key: "meta_cliques", label: "Cliques no Link", icon: "click", platform: "meta", visible: reportData.metricsConfig.showMetaCliques },
        { key: "meta_alcance", label: "Alcance", icon: "users", platform: "meta", visible: reportData.metricsConfig.showMetaAlcance },
        { key: "meta_leads", label: "Leads", icon: "user-plus", platform: "meta", visible: reportData.metricsConfig.showMetaLeads },
        { key: "meta_roas", label: "ROAS", icon: "trending", platform: "meta", visible: reportData.metricsConfig.showMetaRoas },
      ];

      const layoutData = JSON.parse(JSON.stringify({
        metrics,
        sections: reportData.sectionsConfig,
      }));

      const { error } = await supabase
        .from("report_templates")
        .insert([{
          nome: templateName.trim(),
          descricao: templateDescription.trim(),
          is_global: templateIsGlobal,
          gestor_id: gestor?.id,
          layout: layoutData,
        }]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      queryClient.invalidateQueries({ queryKey: ["report-templates-selector"] });
      
      toast({ title: "Modelo salvo!", description: `"${templateName}" está disponível para uso.` });
      setSaveTemplateDialogOpen(false);
      setTemplateName("");
      setTemplateDescription("");
      setTemplateIsGlobal(false);
    } catch (error: any) {
      toast({ title: "Erro ao salvar modelo", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingTemplate(false);
    }
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

  // Template Selection Step
  if (step === "template") {
    return (
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border p-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
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
        </div>

        <div className="max-w-5xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
              <h1 className="text-3xl font-bold text-foreground">
                Criar Relatório
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Escolha um modelo para começar rapidamente ou continue sem modelo para personalizar do zero
              </p>
            </div>

            {/* Template Selector */}
            <TemplateSelector
              onSelect={applyTemplate}
              selectedTemplateId={selectedTemplateId}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* Toolbar */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setStep("template")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Modelos
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
              onClick={() => setSaveTemplateDialogOpen(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Salvar Modelo
            </Button>
            <Button
              variant={isPreview ? "default" : "outline"}
              onClick={() => {
                calculateMetrics();
                setIsPreview(!isPreview);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={handleExport} 
              className="bg-primary hover:bg-primary/90"
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar"}
            </Button>
          </div>

          {/* Save Template Dialog */}
          <Dialog open={saveTemplateDialogOpen} onOpenChange={setSaveTemplateDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Salvar como Modelo
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nome do Modelo *</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Relatório Mensal E-commerce"
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-desc">Descrição</Label>
                  <Textarea
                    id="template-desc"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Descreva o objetivo deste modelo..."
                    className="bg-secondary/50 min-h-[80px]"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Disponível para todos</Label>
                    <p className="text-xs text-muted-foreground">Outros gestores poderão usar este modelo</p>
                  </div>
                  <Switch
                    checked={templateIsGlobal}
                    onCheckedChange={setTemplateIsGlobal}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSaveTemplateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAsTemplate} disabled={isSavingTemplate}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSavingTemplate ? "Salvando..." : "Salvar Modelo"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Mostrar Saldo Restante</Label>
                  <Switch
                    checked={reportData.sectionsConfig.showSaldoRestante}
                    onCheckedChange={(checked) =>
                      setReportData({
                        ...reportData,
                        sectionsConfig: { ...reportData.sectionsConfig, showSaldoRestante: checked },
                      })
                    }
                  />
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Mostrar Painéis de Anúncio</Label>
                  <Switch
                    checked={reportData.sectionsConfig.showPaineisAnuncio}
                    onCheckedChange={(checked) =>
                      setReportData({
                        ...reportData,
                        sectionsConfig: { ...reportData.sectionsConfig, showPaineisAnuncio: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Mostrar Seções Personalizadas</Label>
                  <Switch
                    checked={reportData.sectionsConfig.showCustomSections}
                    onCheckedChange={(checked) =>
                      setReportData({
                        ...reportData,
                        sectionsConfig: { ...reportData.sectionsConfig, showCustomSections: checked },
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
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                    <span className="text-blue-500 text-xs font-bold">G</span>
                  </div>
                  Tráfego Google Ads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Core metrics - always visible */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <MousePointer className="w-4 h-4 text-muted-foreground" />
                      Cliques
                    </Label>
                    <NumericInput
                      value={reportData.google.cliques}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          google: { ...reportData.google, cliques: value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      Impressões
                    </Label>
                    <NumericInput
                      value={reportData.google.impressoes}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          google: { ...reportData.google, impressoes: value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Contatos/Leads
                    </Label>
                    <NumericInput
                      value={reportData.google.contatos}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          google: { ...reportData.google, contatos: value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Investido (R$)
                    </Label>
                    <NumericInput
                      value={reportData.google.investido}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          google: { ...reportData.google, investido: value },
                        })
                      }
                      isDecimal
                    />
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reportData.metricsConfig.showGoogleConversoes && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        Conversões
                      </Label>
                      <NumericInput
                        value={reportData.google.conversoes}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, conversoes: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleCtr && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">CTR (%)</Label>
                      <NumericInput
                        value={reportData.google.ctr}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, ctr: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleCpc && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">CPC (R$)</Label>
                      <NumericInput
                        value={reportData.google.cpc}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, cpc: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleRoas && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">ROAS</Label>
                      <NumericInput
                        value={reportData.google.roas}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, roas: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleAlcance && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Alcance
                      </Label>
                      <NumericInput
                        value={reportData.google.alcance}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, alcance: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleFrequencia && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Frequência</Label>
                      <NumericInput
                        value={reportData.google.frequencia}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, frequencia: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleVisualizacoesVideo && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Views de Vídeo</Label>
                      <NumericInput
                        value={reportData.google.visualizacoesVideo}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, visualizacoesVideo: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleInteracoes && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Interações</Label>
                      <NumericInput
                        value={reportData.google.interacoes}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, interacoes: value },
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                
                {/* Google Metrics Config */}
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">Métricas a exibir no relatório:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">CPL</Label>
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
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">CPM</Label>
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
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">CTR</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleCtr}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleCtr: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">CPC</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleCpc}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleCpc: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Conversões</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleConversoes}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleConversoes: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Taxa Conversão</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleTaxaConversao}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleTaxaConversao: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">ROAS</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleRoas}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleRoas: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Custo/Conversão</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleCustoConversao}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleCustoConversao: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Alcance</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleAlcance}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleAlcance: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Frequência</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleFrequencia}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleFrequencia: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Views Vídeo</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleVisualizacoesVideo}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleVisualizacoesVideo: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Interações</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleInteracoes}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleInteracoes: checked },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meta Ads Metrics */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center">
                    <span className="text-purple-500 text-xs font-bold">M</span>
                  </div>
                  Tráfego Meta Ads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Core metrics - always visible */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      Impressões
                    </Label>
                    <NumericInput
                      value={reportData.meta.impressoes}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          meta: { ...reportData.meta, impressoes: value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      Engajamento
                    </Label>
                    <NumericInput
                      value={reportData.meta.engajamento}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          meta: { ...reportData.meta, engajamento: value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      Conversas
                    </Label>
                    <NumericInput
                      value={reportData.meta.conversas}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          meta: { ...reportData.meta, conversas: value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Investido (R$)
                    </Label>
                    <NumericInput
                      value={reportData.meta.investido}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          meta: { ...reportData.meta, investido: value },
                        })
                      }
                      isDecimal
                    />
                  </div>
                </div>

                {/* Additional metrics based on config */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reportData.metricsConfig.showMetaCliques && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <MousePointer className="w-4 h-4 text-muted-foreground" />
                        Cliques no Link
                      </Label>
                      <NumericInput
                        value={reportData.meta.cliques}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, cliques: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaAlcance && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Alcance
                      </Label>
                      <NumericInput
                        value={reportData.meta.alcance}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, alcance: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaLeads && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        Leads Gerados
                      </Label>
                      <NumericInput
                        value={reportData.meta.leads}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, leads: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaSeguidores && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Novos Seguidores</Label>
                      <NumericInput
                        value={reportData.meta.seguidores}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, seguidores: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaCtr && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">CTR (%)</Label>
                      <NumericInput
                        value={reportData.meta.ctr}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, ctr: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaCpc && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">CPC (R$)</Label>
                      <NumericInput
                        value={reportData.meta.cpc}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, cpc: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaRoas && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">ROAS</Label>
                      <NumericInput
                        value={reportData.meta.roas}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, roas: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaFrequencia && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Frequência</Label>
                      <NumericInput
                        value={reportData.meta.frequencia}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, frequencia: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaCurtidasPagina && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Curtidas Página</Label>
                      <NumericInput
                        value={reportData.meta.curtidasPagina}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, curtidasPagina: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaCompartilhamentos && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Compartilhamentos</Label>
                      <NumericInput
                        value={reportData.meta.compartilhamentos}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, compartilhamentos: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaSalvos && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Salvos</Label>
                      <NumericInput
                        value={reportData.meta.salvos}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, salvos: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaComentarios && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Comentários</Label>
                      <NumericInput
                        value={reportData.meta.comentarios}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, comentarios: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaVisualizacoesVideo && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Views Vídeo</Label>
                      <NumericInput
                        value={reportData.meta.visualizacoesVideo}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, visualizacoesVideo: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaMensagensIniciadas && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Mensagens Iniciadas</Label>
                      <NumericInput
                        value={reportData.meta.mensagensIniciadas}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, mensagensIniciadas: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaAgendamentos && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Agendamentos</Label>
                      <NumericInput
                        value={reportData.meta.agendamentos}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, agendamentos: value },
                          })
                        }
                      />
                    </div>
                  )}
                </div>
                
                {/* Meta Metrics Config */}
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">Métricas a exibir no relatório:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">CPL</Label>
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
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">CPM</Label>
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
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Custo/Seguidor</Label>
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
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Cliques</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaCliques}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaCliques: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">CTR</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaCtr}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaCtr: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">CPC</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaCpc}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaCpc: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Alcance</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaAlcance}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaAlcance: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Frequência</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaFrequencia}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaFrequencia: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Leads</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaLeads}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaLeads: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Conversões</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaConversoes}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaConversoes: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">ROAS</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaRoas}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaRoas: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Curtidas Página</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaCurtidasPagina}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaCurtidasPagina: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Seguidores</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaSeguidores}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaSeguidores: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Compartilhamentos</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaCompartilhamentos}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaCompartilhamentos: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Salvos</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaSalvos}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaSalvos: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Comentários</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaComentarios}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaComentarios: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Views Vídeo</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaVisualizacoesVideo}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaVisualizacoesVideo: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Retenção Vídeo</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaRetencaoVideo}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaRetencaoVideo: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Mensagens</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaMensagensIniciadas}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaMensagensIniciadas: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Agendamentos</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaAgendamentos}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaAgendamentos: checked },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saldos / Recarga */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Saldos Restantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Saldo Google (R$)
                    </Label>
                    <NumericInput
                      value={reportData.google.saldoRestante}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          google: {
                            ...reportData.google,
                            saldoRestante: value,
                          },
                        })
                      }
                      isDecimal
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      Dias p/ Recarga Google
                    </Label>
                    <NumericInput
                      value={reportData.google.diasParaRecarga}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          google: {
                            ...reportData.google,
                            diasParaRecarga: value,
                          },
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Saldo Meta (R$)
                    </Label>
                    <NumericInput
                      value={reportData.meta.saldoRestante}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          meta: {
                            ...reportData.meta,
                            saldoRestante: value,
                          },
                        })
                      }
                      isDecimal
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      Dias p/ Recarga Meta
                    </Label>
                    <NumericInput
                      value={reportData.meta.diasParaRecarga}
                      onChange={(value) =>
                        setReportData({
                          ...reportData,
                          meta: {
                            ...reportData.meta,
                            diasParaRecarga: value,
                          },
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Esses valores aparecem no rodapé do Preview/PDF.
                </p>
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
              <CardContent className="pt-0">
                <CreativeGrid
                  platform="google"
                  creatives={reportData.criativos}
                  onChange={(newCreatives) => setReportData((prev) => ({ ...prev, criativos: newCreatives }))}
                  clienteId={clienteId!}
                  maxCreatives={5}
                />
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
              <CardContent className="pt-0">
                <CreativeGrid
                  platform="meta"
                  creatives={reportData.criativos}
                  onChange={(newCreatives) => setReportData((prev) => ({ ...prev, criativos: newCreatives }))}
                  clienteId={clienteId!}
                  maxCreatives={5}
                />
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
                      const aspectCss = aspectRatioOptionToCss(ranking?.aspectRatio);
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
                            <>
                              <div
                                className="relative group rounded-lg overflow-hidden border border-border"
                                style={aspectCss ? { aspectRatio: aspectCss } : undefined}
                              >
                                <img
                                  src={ranking.url}
                                  alt={`TOP ${position}`}
                                  className={cn(
                                    "w-full object-contain",
                                    aspectCss ? "h-full" : "h-auto"
                                  )}
                                />
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
                              <AspectRatioSelector
                                value={ranking.aspectRatio || "auto"}
                                onChange={(next) =>
                                  setReportData((prev) => ({
                                    ...prev,
                                    criativosRanking: prev.criativosRanking.map((c) =>
                                      c.position === position
                                        ? { ...c, aspectRatio: next === "auto" ? undefined : next }
                                        : c
                                    ),
                                  }))
                                }
                                className="justify-start"
                              />
                            </>
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

            {/* Ad Panels - Google */}
            {reportData.sectionsConfig.showPaineisAnuncio && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                        <span className="text-blue-500 text-xs font-bold">G</span>
                      </div>
                      Painéis Google Ads ({reportData.paineisAnuncio.filter(p => p.platform === "google").length}/3)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <AdPanelGrid
                      platform="google"
                      images={reportData.paineisAnuncio}
                      onChange={(newPanels) => setReportData((prev) => ({ ...prev, paineisAnuncio: newPanels }))}
                      clienteId={clienteId!}
                      maxImages={3}
                    />
                  </CardContent>
                </Card>

                {/* Ad Panels - Meta */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded flex items-center justify-center">
                        <span className="text-purple-500 text-xs font-bold">M</span>
                      </div>
                      Painéis Meta Ads ({reportData.paineisAnuncio.filter(p => p.platform === "meta").length}/3)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <AdPanelGrid
                      platform="meta"
                      images={reportData.paineisAnuncio}
                      onChange={(newPanels) => setReportData((prev) => ({ ...prev, paineisAnuncio: newPanels }))}
                      clienteId={clienteId!}
                      maxImages={3}
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* Custom Sections */}
            {reportData.sectionsConfig.showCustomSections && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Seções Personalizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomSectionGrid
                    sections={reportData.customSections}
                    onChange={(newSections) => setReportData((prev) => ({ ...prev, customSections: newSections }))}
                    clienteId={clienteId!}
                  />
                </CardContent>
              </Card>
            )}

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
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reportData.criativos.filter(c => c.platform === "google").slice(0, 5).map((creative) => {
                        const aspectCss = aspectRatioOptionToCss(creative.aspectRatio);
                        return (
                          <div
                            key={creative.id}
                            className="rounded-lg overflow-hidden border border-blue-500/30 max-w-[140px]"
                            style={aspectCss ? { aspectRatio: aspectCss } : undefined}
                          >
                            <img
                              src={creative.url}
                              alt={creative.name}
                              className={cn("w-full object-contain", aspectCss ? "h-full" : "h-auto")}
                              crossOrigin="anonymous"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Meta Creatives */}
                {reportData.sectionsConfig.showCriativosMeta && reportData.criativos.filter(c => c.platform === "meta").length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-purple-400 tracking-widest">
                      CRIATIVOS META
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reportData.criativos.filter(c => c.platform === "meta").slice(0, 5).map((creative) => {
                        const aspectCss = aspectRatioOptionToCss(creative.aspectRatio);
                        return (
                          <div
                            key={creative.id}
                            className="rounded-lg overflow-hidden border border-purple-500/30 max-w-[140px]"
                            style={aspectCss ? { aspectRatio: aspectCss } : undefined}
                          >
                            <img
                              src={creative.url}
                              alt={creative.name}
                              className={cn("w-full object-contain", aspectCss ? "h-full" : "h-auto")}
                              crossOrigin="anonymous"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ranking Section */}
                {reportData.showRanking && reportData.criativosRanking.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-900/10 border border-yellow-500/30">
                    <h3 className="text-lg font-bold mb-4 text-yellow-400 tracking-widest">
                      🏆 RANKING DE CRIATIVOS
                    </h3>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {reportData.criativosRanking.sort((a, b) => a.position - b.position).map((ranking) => {
                        const aspectCss = aspectRatioOptionToCss(ranking.aspectRatio);
                        return (
                          <div key={ranking.id} className="text-center max-w-[160px]">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2",
                              ranking.position === 1 ? "bg-yellow-500 text-black" :
                              ranking.position === 2 ? "bg-gray-400 text-black" :
                              "bg-amber-700 text-white"
                            )}>
                              {ranking.position}
                            </div>
                            <div
                              className="rounded-lg overflow-hidden border border-white/10 mb-2"
                              style={aspectCss ? { aspectRatio: aspectCss } : undefined}
                            >
                              <img
                                src={ranking.url}
                                alt={`TOP ${ranking.position}`}
                                className={cn("w-full object-contain", aspectCss ? "h-full" : "h-auto")}
                                crossOrigin="anonymous"
                              />
                            </div>
                            <p className="text-sm font-semibold text-white">{ranking.result || "-"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ad Panels Google */}
                {reportData.sectionsConfig.showPaineisAnuncio && reportData.paineisAnuncio.filter(p => p.platform === "google").length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-blue-400 tracking-widest">
                      PAINÉIS GOOGLE ADS
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reportData.paineisAnuncio.filter(p => p.platform === "google").map((panel) => {
                        const aspectCss = aspectRatioOptionToCss(panel.aspectRatio);
                        return (
                          <div
                            key={panel.id}
                            className="rounded-lg overflow-hidden border border-blue-500/30 max-w-[200px]"
                            style={aspectCss ? { aspectRatio: aspectCss } : undefined}
                          >
                            <img
                              src={panel.url}
                              alt={panel.name}
                              className={cn("w-full object-contain", aspectCss ? "h-full" : "h-auto")}
                              crossOrigin="anonymous"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ad Panels Meta */}
                {reportData.sectionsConfig.showPaineisAnuncio && reportData.paineisAnuncio.filter(p => p.platform === "meta").length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-purple-400 tracking-widest">
                      PAINÉIS META ADS
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reportData.paineisAnuncio.filter(p => p.platform === "meta").map((panel) => {
                        const aspectCss = aspectRatioOptionToCss(panel.aspectRatio);
                        return (
                          <div
                            key={panel.id}
                            className="rounded-lg overflow-hidden border border-purple-500/30 max-w-[200px]"
                            style={aspectCss ? { aspectRatio: aspectCss } : undefined}
                          >
                            <img
                              src={panel.url}
                              alt={panel.name}
                              className={cn("w-full object-contain", aspectCss ? "h-full" : "h-auto")}
                              crossOrigin="anonymous"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Sections */}
                {reportData.sectionsConfig.showCustomSections && reportData.customSections.length > 0 && (
                  <>
                    {reportData.customSections.filter(s => s.images.length > 0).map((section) => (
                      <div key={section.id} className="mb-6">
                        <h3 className="text-lg font-bold mb-4 text-primary tracking-widest uppercase">
                          {section.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                          {section.images.map((image) => (
                            <div
                              key={image.id}
                              className="rounded-lg overflow-hidden border border-white/20"
                              style={{ 
                                width: image.width ? `${image.width}px` : '200px',
                                height: image.height ? `${image.height}px` : 'auto'
                              }}
                            >
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-full object-contain"
                                crossOrigin="anonymous"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
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

                {/* Balances - only show if toggle is on AND there are values */}
                {reportData.sectionsConfig.showSaldoRestante && 
                  (reportData.google.saldoRestante > 0 || 
                   reportData.google.diasParaRecarga > 0 || 
                   reportData.meta.saldoRestante > 0 || 
                   reportData.meta.diasParaRecarga > 0) && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold mb-3 text-primary tracking-widest">SALDO RESTANTE</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {(reportData.google.saldoRestante > 0 || reportData.google.diasParaRecarga > 0) && (
                        <div className="p-3 rounded-lg bg-white/5 border border-blue-500/30">
                          <p className="font-semibold text-blue-400 mb-2">Google Ads</p>
                          {reportData.google.saldoRestante > 0 && (
                            <div className="flex items-center justify-between text-gray-300">
                              <span>Saldo</span>
                              <span className="font-bold text-white">{formatCurrency(reportData.google.saldoRestante)}</span>
                            </div>
                          )}
                          {reportData.google.diasParaRecarga > 0 && (
                            <div className="flex items-center justify-between text-gray-300 mt-1">
                              <span>Próxima recarga</span>
                              <span className="font-bold text-white">{reportData.google.diasParaRecarga} dias</span>
                            </div>
                          )}
                        </div>
                      )}

                      {(reportData.meta.saldoRestante > 0 || reportData.meta.diasParaRecarga > 0) && (
                        <div className="p-3 rounded-lg bg-white/5 border border-purple-500/30">
                          <p className="font-semibold text-purple-400 mb-2">Meta Ads</p>
                          {reportData.meta.saldoRestante > 0 && (
                            <div className="flex items-center justify-between text-gray-300">
                              <span>Saldo</span>
                              <span className="font-bold text-white">{formatCurrency(reportData.meta.saldoRestante)}</span>
                            </div>
                          )}
                          {reportData.meta.diasParaRecarga > 0 && (
                            <div className="flex items-center justify-between text-gray-300 mt-1">
                              <span>Próxima recarga</span>
                              <span className="font-bold text-white">{reportData.meta.diasParaRecarga} dias</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
