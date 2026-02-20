import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2canvas from "html2canvas";
import { GoogleLogo, MetaLogo, LinkedInLogo, FacebookLogo, InstagramLogo, WhatsAppLogo, TikTokLogo } from '@/components/BrandLogos';
import { jsPDF } from 'jspdf';
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
  Trophy,
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
    roasValor: number;
    custoConversao: number;
    alcance: number;
    frequencia: number;
    visualizacoesVideo: number;
    taxaVisualizacao: number;
    interacoes: number;
    taxaInteracao: number;
    compras: number;
    visitasProduto: number;
    adicoesCarrinho: number;
    vendas: number;
    custoPorVisita: number;
    custoPorAdicaoCarrinho: number;
    custoPorVenda: number;
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
    roasValor: number;
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
    compras: number;
    visitasProduto: number;
    adicoesCarrinho: number;
    vendas: number;
    custoPorVisita: number;
    custoPorAdicaoCarrinho: number;
    custoPorVenda: number;
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
    showGoogleRoasValor: boolean;
    showGoogleCustoConversao: boolean;
    showGoogleAlcance: boolean;
    showGoogleFrequencia: boolean;
    showGoogleVisualizacoesVideo: boolean;
    showGoogleTaxaVisualizacao: boolean;
    showGoogleInteracoes: boolean;
    showGoogleTaxaInteracao: boolean;
    showGoogleCompras: boolean;
    showGoogleVisitasProduto: boolean;
    showGoogleAdicoesCarrinho: boolean;
    showGoogleVendas: boolean;
    showGoogleCustoPorVisita: boolean;
    showGoogleCustoPorAdicaoCarrinho: boolean;
    showGoogleCustoPorVenda: boolean;
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
    showMetaRoasValor: boolean;
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
    showMetaCompras: boolean;
    showMetaVisitasProduto: boolean;
    showMetaAdicoesCarrinho: boolean;
    showMetaVendas: boolean;
    showMetaCustoPorVisita: boolean;
    showMetaCustoPorAdicaoCarrinho: boolean;
    showMetaCustoPorVenda: boolean;
  };
  autoFillSaldos: boolean;
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
  validationId?: string;
  validationPassword?: string;
  validationTime?: string;
  isGeneratingPDF?: boolean;
}

const defaultReportData: ReportData = {
  objetivos: [
    "Aumentar a visibilidade e reconhecimento da marca",
    "Aumentar o Número de Leads Qualificados",
  ],
  google: {
    cliques: 0, impressoes: 0, contatos: 0, investido: 0, custoPorLead: 0, cpm: 0,
    saldoRestante: 0, diasParaRecarga: 0,
    ctr: 0, cpc: 0, conversoes: 0, taxaConversao: 0, roas: 0, roasValor: 0, custoConversao: 0,
    alcance: 0, frequencia: 0, visualizacoesVideo: 0, taxaVisualizacao: 0, interacoes: 0, taxaInteracao: 0,
    compras: 0, visitasProduto: 0, adicoesCarrinho: 0, vendas: 0, custoPorVisita: 0, custoPorAdicaoCarrinho: 0, custoPorVenda: 0
  },
  meta: {
    impressoes: 0, engajamento: 0, conversas: 0, investido: 0, custoPorLead: 0, cpm: 0, custoPorSeguidor: 0,
    saldoRestante: 0, diasParaRecarga: 0,
    cliques: 0, ctr: 0, cpc: 0, alcance: 0, frequencia: 0, leads: 0, conversoes: 0, roas: 0, roasValor: 0,
    curtidasPagina: 0, seguidores: 0, compartilhamentos: 0, salvos: 0, comentarios: 0,
    visualizacoesVideo: 0, retencaoVideo: 0, mensagensIniciadas: 0, respostasMensagem: 0, agendamentos: 0, checkins: 0,
    compras: 0, visitasProduto: 0, adicoesCarrinho: 0, vendas: 0, custoPorVisita: 0, custoPorAdicaoCarrinho: 0, custoPorVenda: 0
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
    showGoogleRoasValor: false,
    showGoogleCustoConversao: false,
    showGoogleAlcance: false,
    showGoogleFrequencia: false,
    showGoogleVisualizacoesVideo: false,
    showGoogleTaxaVisualizacao: false,
    showGoogleInteracoes: false,
    showGoogleTaxaInteracao: false,
    showGoogleCompras: false,
    showGoogleVisitasProduto: false,
    showGoogleAdicoesCarrinho: false,
    showGoogleVendas: false,
    showGoogleCustoPorVisita: false,
    showGoogleCustoPorAdicaoCarrinho: false,
    showGoogleCustoPorVenda: false,
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
    showMetaRoasValor: false,
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
    showMetaCompras: false,
    showMetaVisitasProduto: false,
    showMetaAdicoesCarrinho: false,
    showMetaVendas: false,
    showMetaCustoPorVisita: false,
    showMetaCustoPorAdicaoCarrinho: false,
    showMetaCustoPorVenda: false,
  },
  autoFillSaldos: false,
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
  const reportIdFromUrl = searchParams.get("reportId");
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

  // Fetch and auto-apply existing report from URL
  const { data: existingReport } = useQuery({
    queryKey: ["report-from-url", reportIdFromUrl],
    queryFn: async () => {
      if (!reportIdFromUrl) return null;
      const { data, error } = await supabase
        .from("client_reports")
        .select("*")
        .eq("id", reportIdFromUrl)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!reportIdFromUrl,
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

  // Auto-apply existing report data when loaded
  useEffect(() => {
    if (existingReport && existingReport.data_values) {
      const data = existingReport.data_values as any;

      setReportData({
        objetivos: data.objetivos || [],
        google: data.google || defaultReportData.google,
        meta: data.meta || defaultReportData.meta,
        resumo: data.resumo || "",
        criativos: data.criativos || [],
        criativosRanking: data.criativosRanking || [],
        showRanking: data.showRanking ?? true,
        metricsConfig: data.metricsConfig || defaultReportData.metricsConfig,
        sectionsConfig: data.sectionsConfig || defaultReportData.sectionsConfig,
        paineisAnuncio: data.paineisAnuncio || [],
        customSections: data.customSections || [],
        validationId: data.validationId,
        validationPassword: data.validationPassword,
        validationTime: data.validationTime,
        autoFillSaldos: false // Don't overwrite saved data with auto-fill
      });

      if (existingReport.periodo_inicio) {
        setPeriodoInicio(new Date(existingReport.periodo_inicio));
      }
      if (existingReport.periodo_fim) {
        setPeriodoFim(new Date(existingReport.periodo_fim));
      }

      setStep("editor");
      toast({
        title: "Relatório carregado!",
        description: "Os dados salvos anteriormente foram restaurados."
      });
    }
  }, [existingReport]);

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
        .select("*, agencias(*), gestores(*)")
        .eq("id", clienteId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clienteId,
  });

  // Fetch client tracking data for auto-fill
  const { data: clientTracking } = useQuery({
    queryKey: ["client-tracking", clienteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_tracking")
        .select("*")
        .eq("cliente_id", clienteId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!clienteId,
  });

  // Auto-fill saldos from client tracking when toggle is on
  useEffect(() => {
    if (reportData.autoFillSaldos && clientTracking) {
      const today = new Date();

      // Calc Google Deduction
      let googleDeductedSaldo = clientTracking.google_saldo || 0;
      let googleRemainingDays = clientTracking.google_dias_restantes || 0;
      if (clientTracking.google_ultima_validacao && clientTracking.google_valor_diario > 0) {
        const lastVal = new Date(clientTracking.google_ultima_validacao);
        const daysPassed = differenceInDays(today, lastVal);
        if (daysPassed > 0) {
          const deduction = daysPassed * clientTracking.google_valor_diario;
          googleDeductedSaldo = Math.max(0, googleDeductedSaldo - deduction);
          googleRemainingDays = Math.max(0, Math.floor(googleDeductedSaldo / clientTracking.google_valor_diario));
        }
      }

      // Calc Meta Deduction
      let metaDeductedSaldo = clientTracking.meta_saldo || 0;
      let metaRemainingDays = clientTracking.meta_dias_restantes || 0;
      if (clientTracking.meta_ultima_validacao && clientTracking.meta_valor_diario > 0) {
        const lastValM = new Date(clientTracking.meta_ultima_validacao);
        const daysPassedM = differenceInDays(today, lastValM);
        if (daysPassedM > 0) {
          const deductionM = daysPassedM * clientTracking.meta_valor_diario;
          metaDeductedSaldo = Math.max(0, metaDeductedSaldo - deductionM);
          metaRemainingDays = Math.max(0, Math.floor(metaDeductedSaldo / clientTracking.meta_valor_diario));
        }
      }

      setReportData(prev => ({
        ...prev,
        google: {
          ...prev.google,
          saldoRestante: googleDeductedSaldo,
          diasParaRecarga: googleRemainingDays,
        },
        meta: {
          ...prev.meta,
          saldoRestante: metaDeductedSaldo,
          diasParaRecarga: metaRemainingDays,
        },
      }));
    }
  }, [reportData.autoFillSaldos, clientTracking]);

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

  const saveReportMutation = useMutation({
    mutationFn: async () => {
      const validationId = reportData.validationId || crypto.randomUUID();
      const validationPassword = reportData.validationPassword || Math.random().toString(36).substring(2, 8).toUpperCase();
      const validationTime = reportData.validationTime || format(new Date(), "yyyy-MM-dd HH:mm:ss");

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
        validationId,
        validationPassword,
        validationTime
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

      return { validationId, validationPassword, validationTime };
    },
    onSuccess: ({ validationId, validationPassword }) => {
      setReportData(prev => ({ ...prev, validationId, validationPassword }));
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
      const element = pdfRef.current;
      const captureWidth = 800;
      // Get exact height including padding/content
      const captureHeight = element.getBoundingClientRect().height;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#0b1120",
        width: captureWidth,
        height: captureHeight,
        windowWidth: 1024, // Bypass mobile breakpoints
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.85);
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
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, scaledHeight);

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
    // Force preview mode immediately
    setIsPreview(true);
    calculateMetrics();

    try {
      // 1. Mutate and get the EXACT credentials saved to DB
      const credentials = await saveReportMutation.mutateAsync();

      // 2. Update local state with these credentials FIRST
      setReportData(prev => ({
        ...prev,
        ...credentials,
        isGeneratingPDF: true
      }));

      // 3. Wait for React to finish rendering the new bottom footer 
      // containing the new Validation ID and Password before taking the screenshot.
      // Increased timeout to 2500ms to guarantee DOM paint cycle and image loading completes.
      setTimeout(async () => {
        await handleExportPDF();
        setIsExporting(false);
        setReportData(prev => ({ ...prev, isGeneratingPDF: false }));
      }, 2500);

    } catch (e) {
      console.error(e);
      setIsExporting(false);
      setReportData(prev => ({ ...prev, isGeneratingPDF: false }));
      toast({ title: "Erro ao salvar relatório", variant: "destructive" });
    }
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
        { key: "google_contatos", label: "Conversões", icon: "message", platform: "google", visible: true },
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
                Escolha um modelo para agilizar seu trabalho ou clique em Começar do Zero para um relatório personalizado
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
                  <div key={`objetivo-${index}`} className="flex gap-2">
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
                      Conversões
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
                  {reportData.metricsConfig.showGoogleCompras && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        Compras
                      </Label>
                      <NumericInput
                        value={reportData.google.compras}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, compras: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleRoasValor && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        ROAS (R$)
                      </Label>
                      <NumericInput
                        value={reportData.google.roasValor}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            google: { ...reportData.google, roasValor: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleVisitasProduto && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Visitas Produto</Label>
                      <NumericInput
                        value={reportData.google.visitasProduto}
                        onChange={(value) =>
                          setReportData({ ...reportData, google: { ...reportData.google, visitasProduto: value } })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleAdicoesCarrinho && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Adições ao Carrinho</Label>
                      <NumericInput
                        value={reportData.google.adicoesCarrinho}
                        onChange={(value) =>
                          setReportData({ ...reportData, google: { ...reportData.google, adicoesCarrinho: value } })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleVendas && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Vendas</Label>
                      <NumericInput
                        value={reportData.google.vendas}
                        onChange={(value) =>
                          setReportData({ ...reportData, google: { ...reportData.google, vendas: value } })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleCustoPorVisita && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Custo/Visita (R$)</Label>
                      <NumericInput
                        value={reportData.google.custoPorVisita}
                        onChange={(value) =>
                          setReportData({ ...reportData, google: { ...reportData.google, custoPorVisita: value } })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleCustoPorAdicaoCarrinho && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Custo/Add Carrinho (R$)</Label>
                      <NumericInput
                        value={reportData.google.custoPorAdicaoCarrinho}
                        onChange={(value) =>
                          setReportData({ ...reportData, google: { ...reportData.google, custoPorAdicaoCarrinho: value } })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showGoogleCustoPorVenda && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Custo/Venda (R$)</Label>
                      <NumericInput
                        value={reportData.google.custoPorVenda}
                        onChange={(value) =>
                          setReportData({ ...reportData, google: { ...reportData.google, custoPorVenda: value } })
                        }
                        isDecimal
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
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Compras</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleCompras}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleCompras: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">ROAS (R$)</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleRoasValor}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showGoogleRoasValor: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Visitas Produto</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleVisitasProduto}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showGoogleVisitasProduto: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Add Carrinho</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleAdicoesCarrinho}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showGoogleAdicoesCarrinho: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Vendas</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleVendas}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showGoogleVendas: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Custo/Visita</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleCustoPorVisita}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showGoogleCustoPorVisita: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Custo/Add Carrinho</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleCustoPorAdicaoCarrinho}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showGoogleCustoPorAdicaoCarrinho: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Custo/Venda</Label>
                      <Switch
                        checked={reportData.metricsConfig.showGoogleCustoPorVenda}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showGoogleCustoPorVenda: checked } })
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
                  {reportData.metricsConfig.showMetaCompras && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        Compras
                      </Label>
                      <NumericInput
                        value={reportData.meta.compras}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, compras: value },
                          })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaRoasValor && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        ROAS (R$)
                      </Label>
                      <NumericInput
                        value={reportData.meta.roasValor}
                        onChange={(value) =>
                          setReportData({
                            ...reportData,
                            meta: { ...reportData.meta, roasValor: value },
                          })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaVisitasProduto && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Visitas Produto</Label>
                      <NumericInput
                        value={reportData.meta.visitasProduto}
                        onChange={(value) =>
                          setReportData({ ...reportData, meta: { ...reportData.meta, visitasProduto: value } })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaAdicoesCarrinho && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Adições ao Carrinho</Label>
                      <NumericInput
                        value={reportData.meta.adicoesCarrinho}
                        onChange={(value) =>
                          setReportData({ ...reportData, meta: { ...reportData.meta, adicoesCarrinho: value } })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaVendas && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Vendas</Label>
                      <NumericInput
                        value={reportData.meta.vendas}
                        onChange={(value) =>
                          setReportData({ ...reportData, meta: { ...reportData.meta, vendas: value } })
                        }
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaCustoPorVisita && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Custo/Visita (R$)</Label>
                      <NumericInput
                        value={reportData.meta.custoPorVisita}
                        onChange={(value) =>
                          setReportData({ ...reportData, meta: { ...reportData.meta, custoPorVisita: value } })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaCustoPorAdicaoCarrinho && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Custo/Add Carrinho (R$)</Label>
                      <NumericInput
                        value={reportData.meta.custoPorAdicaoCarrinho}
                        onChange={(value) =>
                          setReportData({ ...reportData, meta: { ...reportData.meta, custoPorAdicaoCarrinho: value } })
                        }
                        isDecimal
                      />
                    </div>
                  )}
                  {reportData.metricsConfig.showMetaCustoPorVenda && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">Custo/Venda (R$)</Label>
                      <NumericInput
                        value={reportData.meta.custoPorVenda}
                        onChange={(value) =>
                          setReportData({ ...reportData, meta: { ...reportData.meta, custoPorVenda: value } })
                        }
                        isDecimal
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
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Compras</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaCompras}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaCompras: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">ROAS (R$)</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaRoasValor}
                        onCheckedChange={(checked) =>
                          setReportData({
                            ...reportData,
                            metricsConfig: { ...reportData.metricsConfig, showMetaRoasValor: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Visitas Produto</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaVisitasProduto}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showMetaVisitasProduto: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Add Carrinho</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaAdicoesCarrinho}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showMetaAdicoesCarrinho: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Vendas</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaVendas}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showMetaVendas: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Custo/Visita</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaCustoPorVisita}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showMetaCustoPorVisita: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Custo/Add Carrinho</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaCustoPorAdicaoCarrinho}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showMetaCustoPorAdicaoCarrinho: checked } })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <Label className="text-xs">Custo/Venda</Label>
                      <Switch
                        checked={reportData.metricsConfig.showMetaCustoPorVenda}
                        onCheckedChange={(checked) =>
                          setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showMetaCustoPorVenda: checked } })
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
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Preencher automaticamente</Label>
                    <p className="text-xs text-muted-foreground">Puxar saldo e dias da ficha do cliente</p>
                  </div>
                  <Switch
                    checked={reportData.autoFillSaldos}
                    onCheckedChange={(checked) =>
                      setReportData({ ...reportData, autoFillSaldos: checked })
                    }
                  />
                </div>
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
              className={cn(
                "w-full text-white overflow-hidden",
                reportData.isGeneratingPDF ? "rounded-none shadow-none" : "max-w-[800px] rounded-lg shadow-2xl"
              )}
              style={{
                fontFamily: "Inter, sans-serif",
                backgroundColor: "#0b1120",
                width: reportData.isGeneratingPDF ? '800px' : '100%',
                minHeight: reportData.isGeneratingPDF ? 'auto' : '1000px'
              }}
            >
              {/* Header with Client Logo + Name */}
              <div className="p-8 pb-4">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-6">
                    {cliente?.logo_url ? (
                      <div className="h-24 max-w-[280px] rounded-2xl overflow-hidden shadow-lg flex items-center justify-center bg-black/20" style={{ height: '96px', maxWidth: '280px' }}>
                        <img
                          src={cliente.logo_url}
                          alt={cliente.nome}
                          className="w-full h-full object-cover"
                          style={{ height: '96px', width: '100%', objectFit: 'cover' }}
                          crossOrigin="anonymous"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-[#ffb500]/10 border border-[#ffb500]/20 text-[#ffb500] flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-medium tracking-widest">{cliente?.nome?.charAt(0)}</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-[#ffb500] tracking-wide uppercase leading-tight">{cliente?.nome}</p>
                      <p className="text-sm text-gray-400 font-normal tracking-wider">Relatório de Performance</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <h1 className="text-3xl font-medium text-white mb-1 tracking-wider leading-none">RESULTADOS DE</h1>
                    <h1 className="text-3xl font-extrabold text-[#ffb500] mb-2 tracking-wider leading-none">CAMPANHA</h1>
                    <p className="text-xl text-gray-500 uppercase font-medium tracking-widest">
                      Mês de {format(periodoInicio, "MMMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Period */}
                <div className="text-center mb-8">
                  <span className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 tracking-[0.2em] font-bold uppercase">
                    Campanhas de {format(periodoInicio, "dd/MM")} à {format(periodoFim, "dd/MM")}
                  </span>
                </div>

                {/* Objectives */}
                {reportData.sectionsConfig.showObjetivos && reportData.objetivos.filter(Boolean).length > 0 && (
                  <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
                    <h2 className="text-sm font-bold mb-4 text-[#ffb500] tracking-widest uppercase">OBJETIVOS</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {reportData.objetivos.filter(Boolean).map((obj, i) => (
                        <li key={obj} className="flex items-start gap-3 text-gray-300 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ffb500] mt-1.5 flex-shrink-0" />
                          <span className="leading-tight">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Google Ads Section */}
                {reportData.sectionsConfig.showGoogleAds && (
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 via-blue-900/5 to-transparent border border-blue-500/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <GoogleLogo className="w-5 h-5" />
                      </div>
                      <h3 className="text-md font-bold text-blue-400 tracking-[0.2em] uppercase" style={{ color: '#60a5fa' }}>TRÁFEGO GOOGLE</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {[
                        { label: "Cliques", value: formatNumber(reportData.google.cliques) },
                        { label: "Impressões", value: formatNumber(reportData.google.impressoes) },
                        { label: "Conversões", value: formatNumber(reportData.google.contatos) },
                        { label: "Investidos", value: formatCurrency(reportData.google.investido) }
                      ].map((m, i) => (
                        <div key={m.label} className="text-center p-4 rounded-xl bg-white/[0.04] border border-white/[0.04] hover:bg-white/[0.06] transition-colors">
                          <p className="text-2xl font-bold text-white mb-1">{m.value}</p>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {(() => {
                      const additionalMetrics = [];
                      if (reportData.metricsConfig.showGoogleCustoPorLead) additionalMetrics.push({ label: "Custo por Lead", value: formatCurrency(reportData.google.custoPorLead), color: "text-green-400" });
                      if (reportData.metricsConfig.showGoogleCpm) additionalMetrics.push({ label: "CPM", value: formatCurrency(reportData.google.cpm), color: "text-yellow-400" });
                      if (reportData.metricsConfig.showGoogleCtr) additionalMetrics.push({ label: "CTR (%)", value: `${reportData.google.ctr.toFixed(2)}%`, color: "text-blue-400" });
                      if (reportData.metricsConfig.showGoogleCpc) additionalMetrics.push({ label: "CPC", value: formatCurrency(reportData.google.cpc), color: "text-orange-400" });
                      if (reportData.metricsConfig.showGoogleConversoes) additionalMetrics.push({ label: "Conversões Ads", value: formatNumber(reportData.google.conversoes), color: "text-emerald-400" });
                      if (reportData.metricsConfig.showGoogleTaxaConversao) additionalMetrics.push({ label: "Taxa Conv.", value: `${reportData.google.taxaConversao.toFixed(2)}%`, color: "text-cyan-400" });
                      if (reportData.metricsConfig.showGoogleRoas) additionalMetrics.push({ label: "ROAS", value: `${reportData.google.roas.toFixed(2)}x`, color: "text-pink-400" });
                      if (reportData.metricsConfig.showGoogleRoasValor) additionalMetrics.push({ label: "ROAS (R$)", value: formatCurrency(reportData.google.roasValor), color: "text-fuchsia-400" });
                      if (reportData.metricsConfig.showGoogleCustoConversao) additionalMetrics.push({ label: "Custo/Conv.", value: formatCurrency(reportData.google.custoConversao), color: "text-red-400" });
                      if (reportData.metricsConfig.showGoogleAlcance) additionalMetrics.push({ label: "Alcance", value: formatNumber(reportData.google.alcance), color: "text-indigo-400" });
                      if (reportData.metricsConfig.showGoogleFrequencia) additionalMetrics.push({ label: "Frequência", value: reportData.google.frequencia.toFixed(2), color: "text-violet-400" });
                      if (reportData.metricsConfig.showGoogleVisualizacoesVideo) additionalMetrics.push({ label: "Views Vídeo", value: formatNumber(reportData.google.visualizacoesVideo), color: "text-teal-400" });
                      if (reportData.metricsConfig.showGoogleTaxaVisualizacao) additionalMetrics.push({ label: "Taxa View", value: `${reportData.google.taxaVisualizacao.toFixed(2)}%`, color: "text-sky-400" });
                      if (reportData.metricsConfig.showGoogleInteracoes) additionalMetrics.push({ label: "Interações", value: formatNumber(reportData.google.interacoes), color: "text-lime-400" });
                      if (reportData.metricsConfig.showGoogleTaxaInteracao) additionalMetrics.push({ label: "Taxa Inter.", value: `${reportData.google.taxaInteracao.toFixed(2)}%`, color: "text-amber-400" });
                      if (reportData.metricsConfig.showGoogleCompras) additionalMetrics.push({ label: "Compras", value: formatNumber(reportData.google.compras), color: "text-emerald-400" });
                      if (reportData.metricsConfig.showGoogleVisitasProduto) additionalMetrics.push({ label: "Visitas Produto", value: formatNumber(reportData.google.visitasProduto), color: "text-sky-400" });
                      if (reportData.metricsConfig.showGoogleAdicoesCarrinho) additionalMetrics.push({ label: "Add Carrinho", value: formatNumber(reportData.google.adicoesCarrinho), color: "text-orange-400" });
                      if (reportData.metricsConfig.showGoogleVendas) additionalMetrics.push({ label: "Vendas", value: formatNumber(reportData.google.vendas), color: "text-green-400" });
                      if (reportData.metricsConfig.showGoogleCustoPorVisita) additionalMetrics.push({ label: "Custo/Visita", value: formatCurrency(reportData.google.custoPorVisita), color: "text-cyan-400" });
                      if (reportData.metricsConfig.showGoogleCustoPorAdicaoCarrinho) additionalMetrics.push({ label: "Custo/Add Carrinho", value: formatCurrency(reportData.google.custoPorAdicaoCarrinho), color: "text-yellow-400" });
                      if (reportData.metricsConfig.showGoogleCustoPorVenda) additionalMetrics.push({ label: "Custo/Venda", value: formatCurrency(reportData.google.custoPorVenda), color: "text-red-400" });

                      if (additionalMetrics.length === 0) return null;

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {additionalMetrics.map((metric, idx) => (
                            <div key={metric.label} className="text-center p-4 rounded-xl bg-white/[0.04] border border-white/[0.04] hover:bg-white/[0.06] transition-colors">
                              <p className={`text-xl font-bold ${metric.color} mb-1`}>{metric.value}</p>
                              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{metric.label}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Meta Ads Section */}
                {reportData.sectionsConfig.showMetaAds && (
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-purple-600/10 via-purple-900/5 to-transparent border border-purple-500/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <MetaLogo className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-md font-bold text-purple-400 tracking-[0.2em] uppercase" style={{ color: '#c084fc' }}>TRÁFEGO META ADS</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {[
                        { label: "Impressões", value: formatNumber(reportData.meta.impressoes) },
                        { label: "Engajamento", value: formatNumber(reportData.meta.engajamento) },
                        { label: "Conversas", value: formatNumber(reportData.meta.conversas) },
                        { label: "Investidos", value: formatCurrency(reportData.meta.investido) }
                      ].map((m, i) => (
                        <div key={m.label} className="text-center p-4 rounded-xl bg-white/[0.04] border border-white/[0.04] hover:bg-white/[0.06] transition-colors">
                          <p className="text-2xl font-bold text-white mb-1">{m.value}</p>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Additional Meta Metrics */}
                    {(() => {
                      const additionalMetrics = [];
                      if (reportData.metricsConfig.showMetaCustoPorLead) additionalMetrics.push({ label: "Custo por Lead", value: formatCurrency(reportData.meta.custoPorLead), color: "text-green-400" });
                      if (reportData.metricsConfig.showMetaCpm) additionalMetrics.push({ label: "CPM", value: formatCurrency(reportData.meta.cpm), color: "text-yellow-400" });
                      if (reportData.metricsConfig.showMetaCustoPorSeguidor) additionalMetrics.push({ label: "Custo/Seguidor", value: formatCurrency(reportData.meta.custoPorSeguidor), color: "text-pink-400" });
                      if (reportData.metricsConfig.showMetaCliques) additionalMetrics.push({ label: "Cliques Link", value: formatNumber(reportData.meta.cliques), color: "text-blue-400" });
                      if (reportData.metricsConfig.showMetaCtr) additionalMetrics.push({ label: "CTR (%)", value: `${reportData.meta.ctr.toFixed(2)}%`, color: "text-cyan-400" });
                      if (reportData.metricsConfig.showMetaCpc) additionalMetrics.push({ label: "CPC", value: formatCurrency(reportData.meta.cpc), color: "text-orange-400" });
                      if (reportData.metricsConfig.showMetaAlcance) additionalMetrics.push({ label: "Alcance", value: formatNumber(reportData.meta.alcance), color: "text-indigo-400" });
                      if (reportData.metricsConfig.showMetaFrequencia) additionalMetrics.push({ label: "Frequência", value: reportData.meta.frequencia.toFixed(2), color: "text-violet-400" });
                      if (reportData.metricsConfig.showMetaLeads) additionalMetrics.push({ label: "Leads", value: formatNumber(reportData.meta.leads), color: "text-emerald-400" });
                      if (reportData.metricsConfig.showMetaConversoes) additionalMetrics.push({ label: "Conversões", value: formatNumber(reportData.meta.conversoes), color: "text-teal-400" });
                      if (reportData.metricsConfig.showMetaRoas) additionalMetrics.push({ label: "ROAS", value: `${reportData.meta.roas.toFixed(2)}x`, color: "text-rose-400" });
                      if (reportData.metricsConfig.showMetaRoasValor) additionalMetrics.push({ label: "ROAS (R$)", value: formatCurrency(reportData.meta.roasValor), color: "text-fuchsia-400" });
                      if (reportData.metricsConfig.showMetaCurtidasPagina) additionalMetrics.push({ label: "Curtidas Página", value: formatNumber(reportData.meta.curtidasPagina), color: "text-red-400" });
                      if (reportData.metricsConfig.showMetaSeguidores) additionalMetrics.push({ label: "Seguidores", value: formatNumber(reportData.meta.seguidores), color: "text-fuchsia-400" });
                      if (reportData.metricsConfig.showMetaCompartilhamentos) additionalMetrics.push({ label: "Compartilhamentos", value: formatNumber(reportData.meta.compartilhamentos), color: "text-sky-400" });
                      if (reportData.metricsConfig.showMetaSalvos) additionalMetrics.push({ label: "Salvos", value: formatNumber(reportData.meta.salvos), color: "text-amber-400" });
                      if (reportData.metricsConfig.showMetaComentarios) additionalMetrics.push({ label: "Comentários", value: formatNumber(reportData.meta.comentarios), color: "text-lime-400" });
                      if (reportData.metricsConfig.showMetaVisualizacoesVideo) additionalMetrics.push({ label: "Views Vídeo", value: formatNumber(reportData.meta.visualizacoesVideo), color: "text-cyan-400" });
                      if (reportData.metricsConfig.showMetaRetencaoVideo) additionalMetrics.push({ label: "Retenção Vídeo", value: `${reportData.meta.retencaoVideo.toFixed(2)}%`, color: "text-teal-400" });
                      if (reportData.metricsConfig.showMetaMensagensIniciadas) additionalMetrics.push({ label: "Mensagens", value: formatNumber(reportData.meta.mensagensIniciadas), color: "text-blue-400" });
                      if (reportData.metricsConfig.showMetaAgendamentos) additionalMetrics.push({ label: "Agendamentos", value: formatNumber(reportData.meta.agendamentos), color: "text-green-400" });
                      if (reportData.metricsConfig.showMetaCheckins) additionalMetrics.push({ label: "Check-ins", value: formatNumber(reportData.meta.checkins), color: "text-orange-400" });
                      if (reportData.metricsConfig.showMetaCompras) additionalMetrics.push({ label: "Compras", value: formatNumber(reportData.meta.compras), color: "text-emerald-400" });
                      if (reportData.metricsConfig.showMetaVisitasProduto) additionalMetrics.push({ label: "Visitas Produto", value: formatNumber(reportData.meta.visitasProduto), color: "text-sky-400" });
                      if (reportData.metricsConfig.showMetaAdicoesCarrinho) additionalMetrics.push({ label: "Add Carrinho", value: formatNumber(reportData.meta.adicoesCarrinho), color: "text-orange-400" });
                      if (reportData.metricsConfig.showMetaVendas) additionalMetrics.push({ label: "Vendas", value: formatNumber(reportData.meta.vendas), color: "text-green-400" });
                      if (reportData.metricsConfig.showMetaCustoPorVisita) additionalMetrics.push({ label: "Custo/Visita", value: formatCurrency(reportData.meta.custoPorVisita), color: "text-cyan-400" });
                      if (reportData.metricsConfig.showMetaCustoPorAdicaoCarrinho) additionalMetrics.push({ label: "Custo/Add Carrinho", value: formatCurrency(reportData.meta.custoPorAdicaoCarrinho), color: "text-yellow-400" });
                      if (reportData.metricsConfig.showMetaCustoPorVenda) additionalMetrics.push({ label: "Custo/Venda", value: formatCurrency(reportData.meta.custoPorVenda), color: "text-red-400" });

                      if (additionalMetrics.length === 0) return null;

                      return (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {additionalMetrics.map((metric, idx) => (
                            <div key={metric.label} className="text-center p-4 rounded-xl bg-white/[0.04] border border-white/[0.04] hover:bg-white/[0.06] transition-colors">
                              <p className={`text-xl font-black ${metric.color} mb-1`}>{metric.value}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{metric.label}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
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
                    <h3 className="text-lg font-bold mb-4 text-purple-400 tracking-widest" style={{ color: '#c084fc' }}>
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
                      <Trophy className="w-5 h-5 inline-block mr-1" /> RANKING DE CRIATIVOS
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
                        <h3 className="text-lg font-bold mb-4 text-[#ffb500] tracking-widest uppercase">
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
                  <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg">
                    <h3 className="text-sm font-bold mb-4 text-[#ffb500] tracking-widest uppercase">
                      Resumo geral dos resultados
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-[13px] font-medium italic">{reportData.resumo}</p>
                  </div>
                )}

                {/* Balances - only show if toggle is on AND there are values */}
                {reportData.sectionsConfig.showSaldoRestante &&
                  (reportData.google.saldoRestante > 0 ||
                    reportData.google.diasParaRecarga > 0 ||
                    reportData.meta.saldoRestante > 0 ||
                    reportData.meta.diasParaRecarga > 0) && (
                    <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
                      <h3 className="text-sm font-bold mb-6 text-[#ffb500] tracking-widest uppercase">SALDO RESTANTE</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(reportData.google.saldoRestante > 0 || reportData.google.diasParaRecarga > 0) && (
                          <div className="p-4 rounded-xl bg-blue-500/[0.05] border border-blue-500/20 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                                <GoogleLogo className="w-4 h-4" />
                              </div>
                              <p className="font-bold text-xs text-blue-400 uppercase tracking-widest">Google Ads</p>
                            </div>
                            <div className="space-y-3">
                              {reportData.google.saldoRestante > 0 && (
                                <div className="flex items-center justify-between text-xs font-bold font-mono">
                                  <span className="text-gray-400 uppercase tracking-tighter">Saldo</span>
                                  <span className="text-white text-lg">{formatCurrency(reportData.google.saldoRestante)}</span>
                                </div>
                              )}
                              {reportData.google.diasParaRecarga > 0 && (
                                <div className="flex items-center justify-between text-xs font-bold font-mono border-t border-white/5 pt-3">
                                  <span className="text-gray-400 uppercase tracking-tighter">Recarga em</span>
                                  <span className="text-white text-lg">{reportData.google.diasParaRecarga} dias</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {(reportData.meta.saldoRestante > 0 || reportData.meta.diasParaRecarga > 0) && (
                          <div className="p-4 rounded-xl bg-purple-500/[0.05] border border-purple-500/20 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-1.5 bg-purple-500/10 rounded-md border border-purple-500/20">
                                <MetaLogo className="w-4 h-4 text-purple-400" />
                              </div>
                              <p className="font-bold text-xs text-purple-400 uppercase tracking-widest">Meta Ads</p>
                            </div>
                            <div className="space-y-3">
                              {reportData.meta.saldoRestante > 0 && (
                                <div className="flex items-center justify-between text-xs font-bold font-mono">
                                  <span className="text-gray-400 uppercase tracking-tighter">Saldo</span>
                                  <span className="text-white text-lg">{formatCurrency(reportData.meta.saldoRestante)}</span>
                                </div>
                              )}
                              {reportData.meta.diasParaRecarga > 0 && (
                                <div className="flex items-center justify-between text-xs font-bold font-mono border-t border-white/5 pt-3">
                                  <span className="text-gray-400 uppercase tracking-tighter">Recarga em</span>
                                  <span className="text-white text-lg">{reportData.meta.diasParaRecarga} dias</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Footer */}
                <div className="border-t border-[#ffb500]/20 pt-6 mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore */}
                    {cliente?.agencias?.logo_url || cliente?.gestores?.foto_url ? (
                      <img
                        // @ts-ignore
                        src={cliente?.agencias?.logo_url || cliente?.gestores?.foto_url}
                        alt="Logo da Agência"
                        className="h-10 w-auto object-contain max-w-[120px] filter drop-shadow-md"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <VCDLogo size="lg" showText={false} className="text-[#ffb500]" />
                    )}
                    <div>
                      <p className="text-xs text-white/60 font-medium">Relatório gerado por <span className="text-[#ffb500] font-bold">
                        {/* @ts-ignore */}
                        {cliente?.agencias?.nome || cliente?.gestores?.nome || "Você Digital Propaganda"}
                      </span></p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>Relatório gerado em</p>
                    <p>{reportData.validationTime ? format(new Date(reportData.validationTime), "dd/MM/yyyy 'às' HH:mm") : format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
                    {reportData.validationId && (
                      <div className="mt-2 flex flex-col items-end border-t border-white/5 pt-2 max-w-[250px]">
                        <span className="text-[8px] text-gray-500 font-mono text-right break-all leading-tight">ID: {reportData.validationId}</span>
                        <span className="text-[8px] text-gray-500 font-mono text-right mt-0.5">SENHA: {reportData.validationPassword}</span>
                        <a
                          href={`${window.location.origin}/validar-relatorio?id=${reportData.validationId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[8px] text-[#ffb500] mt-1 font-medium"
                        >
                          {window.location.host}/validar-relatorio
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div >
        )}
      </div >
    </div >
  );
};

export default RelatorioCliente;
