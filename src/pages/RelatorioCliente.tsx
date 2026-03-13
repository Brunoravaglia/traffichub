import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2canvas from "html2canvas";
import { GoogleLogo, MetaLogo, LinkedInLogo, FacebookLogo, InstagramLogo, WhatsAppLogo, TikTokLogo, ShopeeLogo } from '@/components/BrandLogos';
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
import { ReportHeader } from "@/components/report/ReportHeader";
import { GoogleAdsMetricsView } from "@/components/report/GoogleAdsMetricsView";
import { MetaAdsMetricsView } from "@/components/report/MetaAdsMetricsView";
import { PlatformMetricsView } from "@/components/report/PlatformMetricsView";
import { StrategicInsightsView } from "@/components/report/StrategicInsightsView";
import { ReportFooter } from "@/components/report/ReportFooter";
import {
  type ReportData,
  type Creative,
  type RankingCreative,
  defaultReportData,
  normalizeReportPayload,
  parseTemplateLayout,
  generateValidationId,
  generateValidationPassword,
  toFiniteNumber,
  DEFAULT_SECTIONS_CONFIG,
} from "@/lib/report-types";
import { applyMetricsFromRegistry, metricsConfigToFullTemplate, type TemplateMetric } from "@/lib/report-metrics-registry";

// Types, defaults, and normalization are now imported from @/lib/report-types
// Metrics registry functions imported from @/lib/report-metrics-registry

const RelatorioCliente = () => {
  const { id: clienteId } = useParams();
  const [searchParams] = useSearchParams();
  const templateIdFromUrl = searchParams.get("templateId");
  const reportIdFromUrl = searchParams.get("reportId");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { gestor } = useGestor();
  const agencyId = gestor?.agencia_id ?? null;
  const hasStoredSession = typeof window !== "undefined" && !!sessionStorage.getItem("vcd_gestor_id");
  const isGestorBootstrapping = !gestor && hasStoredSession;
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
    queryKey: ["template-from-url", templateIdFromUrl, gestor?.id],
    queryFn: async () => {
      if (!templateIdFromUrl || !gestor?.id) return null;
      let query = supabase
        .from("report_templates")
        .select("*, report_template_metrics(*)")
        .eq("id", templateIdFromUrl);
      query = query.or(`is_global.eq.true,gestor_id.eq.${gestor.id}`);
      const { data, error } = await query.single();
      if (error) throw error;
      const parsedLayout = parseTemplateLayout((data as any).layout);
      const legacyMetrics = Array.isArray((data as any).report_template_metrics)
        ? (data as any).report_template_metrics.map((metric: any) => ({
          key: metric?.metric_key,
          label: metric?.label,
          icon: metric?.icon,
          platform: metric?.platform,
          visible: metric?.is_visible !== false,
        }))
        : [];
      return {
        id: data.id,
        nome: data.nome,
        descricao: data.descricao || "",
        is_global: data.is_global,
        metrics: Array.isArray(parsedLayout.metrics) ? parsedLayout.metrics : legacyMetrics,
        sections: parsedLayout.sections || {},
      };
    },
    enabled: !!templateIdFromUrl && !!gestor?.id,
  });

  // Fetch and auto-apply existing report from URL
  const { data: existingReport } = useQuery({
    queryKey: ["report-from-url", reportIdFromUrl, clienteId],
    queryFn: async () => {
      if (!reportIdFromUrl || !clienteId) return null;
      const { data, error } = await supabase
        .from("client_reports")
        .select("*")
        .eq("id", reportIdFromUrl)
        .eq("cliente_id", clienteId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!reportIdFromUrl && !!clienteId,
  });

  // Apply template to report data
  const applyTemplate = (template: any) => {
    if (!template) {
      setSelectedTemplateId(undefined);
      setReportData({
        ...defaultReportData,
        sectionsConfig: {
          ...defaultReportData.sectionsConfig,
          showLinkedinAds: false,
          showTiktokAds: false,
          showShopeeAds: false,
        },
      });
      setStep("editor");
      return;
    }

    setSelectedTemplateId(template.id);

    const templateSections = template?.sections && typeof template.sections === "object" ? template.sections : {};
    setReportData(prev => ({
      ...prev,
      sectionsConfig: {
        showObjetivos: templateSections.showObjetivos ?? true,
        showGoogleAds: templateSections.showGoogleAds ?? true,
        showMetaAds: templateSections.showMetaAds ?? true,
        showLinkedinAds: templateSections.showLinkedinAds ?? false,
        showTiktokAds: templateSections.showTiktokAds ?? false,
        showShopeeAds: templateSections.showShopeeAds ?? false,
        showCriativosGoogle: templateSections.showCriativosGoogle ?? true,
        showCriativosMeta: templateSections.showCriativosMeta ?? true,
        showCriativosLinkedin: templateSections.showCriativosLinkedin ?? false,
        showCriativosTiktok: templateSections.showCriativosTiktok ?? false,
        showCriativosShopee: templateSections.showCriativosShopee ?? false,
        showResumo: templateSections.showResumo ?? true,
        showSaldoRestante: templateSections.showSaldoRestante ?? true,
        showPaineisAnuncio: templateSections.showPaineisAnuncio ?? false,
        showCustomSections: templateSections.showCustomSections ?? false,
        showStrategicInsights: templateSections.showStrategicInsights ?? true,
      },
      metricsConfig: applyMetricsFromRegistry(
        Array.isArray(template?.metrics) ? template.metrics : [],
        defaultReportData.metricsConfig,
      ),
    }));

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
      const normalized = normalizeReportPayload(existingReport.data_values);
      setReportData(normalized);

      if (existingReport.periodo_inicio) {
        const parsedInicio = new Date(existingReport.periodo_inicio);
        if (!Number.isNaN(parsedInicio.getTime())) setPeriodoInicio(parsedInicio);
      }
      if (existingReport.periodo_fim) {
        const parsedFim = new Date(existingReport.periodo_fim);
        if (!Number.isNaN(parsedFim.getTime())) setPeriodoFim(parsedFim);
      }

      setStep("editor");
      toast({
        title: "Relatório carregado!",
        description: "Os dados salvos anteriormente foram restaurados."
      });
    }
  }, [existingReport]);

  // applyMetricsFromTemplate is now handled by applyMetricsFromRegistry from @/lib/report-metrics-registry

  // Fetch client data
  const { data: cliente, isLoading: clienteLoading, error: clienteError, refetch: refetchCliente } = useQuery({
    queryKey: ["cliente", clienteId, agencyId],
    queryFn: async () => {
      if (!agencyId) return null;
      const { data, error } = await supabase
        .from("clientes")
        .select("*, agencias(*), gestores(*)")
        .eq("id", clienteId)
        .eq("agencia_id", agencyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clienteId && !!agencyId,
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
    enabled: !!clienteId && !!cliente,
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
    const safeDivision = (numerator: number, denominator: number, fallback: number) => {
      const safeNumerator = toFiniteNumber(numerator);
      const safeDenominator = toFiniteNumber(denominator);
      if (safeDenominator <= 0) return fallback;
      const result = safeNumerator / safeDenominator;
      return Number.isFinite(result) ? result : fallback;
    };

    setReportData(prev => ({
      ...prev,
      google: {
        ...prev.google,
        custoPorLead:
          prev.google.contatos > 0
            ? safeDivision(prev.google.investido, prev.google.contatos, prev.google.custoPorLead)
            : prev.google.conversoes > 0
              ? safeDivision(prev.google.investido, prev.google.conversoes, prev.google.custoPorLead)
              : prev.google.custoPorLead,
        cpm:
          prev.google.impressoes > 0
            ? safeDivision(prev.google.investido * 1000, prev.google.impressoes, prev.google.cpm)
            : prev.google.cpm,
        custoPorVisita:
          prev.google.visitasProduto > 0
            ? safeDivision(prev.google.investido, prev.google.visitasProduto, prev.google.custoPorVisita)
            : prev.google.custoPorVisita,
        custoPorAdicaoCarrinho:
          prev.google.adicoesCarrinho > 0
            ? safeDivision(prev.google.investido, prev.google.adicoesCarrinho, prev.google.custoPorAdicaoCarrinho)
            : prev.google.custoPorAdicaoCarrinho,
        custoPorVenda:
          prev.google.vendas > 0
            ? safeDivision(prev.google.investido, prev.google.vendas, prev.google.custoPorVenda)
            : prev.google.custoPorVenda,
      },
      meta: {
        ...prev.meta,
        custoPorLead:
          prev.meta.conversas > 0
            ? safeDivision(prev.meta.investido, prev.meta.conversas, prev.meta.custoPorLead)
            : prev.meta.leads > 0
              ? safeDivision(prev.meta.investido, prev.meta.leads, prev.meta.custoPorLead)
              : prev.meta.custoPorLead,
        cpm:
          prev.meta.impressoes > 0
            ? safeDivision(prev.meta.investido * 1000, prev.meta.impressoes, prev.meta.cpm)
            : prev.meta.cpm,
        custoPorVisita:
          prev.meta.visitasProduto > 0
            ? safeDivision(prev.meta.investido, prev.meta.visitasProduto, prev.meta.custoPorVisita)
            : prev.meta.custoPorVisita,
        custoPorAdicaoCarrinho:
          prev.meta.adicoesCarrinho > 0
            ? safeDivision(prev.meta.investido, prev.meta.adicoesCarrinho, prev.meta.custoPorAdicaoCarrinho)
            : prev.meta.custoPorAdicaoCarrinho,
        custoPorVenda:
          prev.meta.vendas > 0
            ? safeDivision(prev.meta.investido, prev.meta.vendas, prev.meta.custoPorVenda)
            : prev.meta.custoPorVenda,
      },
      linkedin: {
        ...prev.linkedin,
        cpm:
          prev.linkedin.impressoes > 0
            ? safeDivision(prev.linkedin.investido * 1000, prev.linkedin.impressoes, prev.linkedin.cpm)
            : prev.linkedin.cpm,
        cpc:
          prev.linkedin.cliques > 0
            ? safeDivision(prev.linkedin.investido, prev.linkedin.cliques, prev.linkedin.cpc)
            : prev.linkedin.cpc,
        ctr:
          prev.linkedin.impressoes > 0
            ? safeDivision(prev.linkedin.cliques * 100, prev.linkedin.impressoes, prev.linkedin.ctr)
            : prev.linkedin.ctr,
        cpl:
          prev.linkedin.leads > 0
            ? safeDivision(prev.linkedin.investido, prev.linkedin.leads, prev.linkedin.cpl)
            : prev.linkedin.cpl,
      },
      tiktok: {
        ...prev.tiktok,
        cpm:
          prev.tiktok.impressoes > 0
            ? safeDivision(prev.tiktok.investido * 1000, prev.tiktok.impressoes, prev.tiktok.cpm)
            : prev.tiktok.cpm,
        cpc:
          prev.tiktok.cliques > 0
            ? safeDivision(prev.tiktok.investido, prev.tiktok.cliques, prev.tiktok.cpc)
            : prev.tiktok.cpc,
        ctr:
          prev.tiktok.impressoes > 0
            ? safeDivision(prev.tiktok.cliques * 100, prev.tiktok.impressoes, prev.tiktok.ctr)
            : prev.tiktok.ctr,
        cpl:
          prev.tiktok.leads > 0
            ? safeDivision(prev.tiktok.investido, prev.tiktok.leads, prev.tiktok.cpl)
            : prev.tiktok.cpl,
      },
      shopee: {
        ...prev.shopee,
        cpm:
          prev.shopee.impressoes > 0
            ? safeDivision(prev.shopee.investido * 1000, prev.shopee.impressoes, prev.shopee.cpm)
            : prev.shopee.cpm,
        cpc:
          prev.shopee.cliques > 0
            ? safeDivision(prev.shopee.investido, prev.shopee.cliques, prev.shopee.cpc)
            : prev.shopee.cpc,
        ctr:
          prev.shopee.impressoes > 0
            ? safeDivision(prev.shopee.cliques * 100, prev.shopee.impressoes, prev.shopee.ctr)
            : prev.shopee.ctr,
        cpa:
          prev.shopee.pedidos > 0
            ? safeDivision(prev.shopee.investido, prev.shopee.pedidos, prev.shopee.cpa)
            : prev.shopee.cpa,
        roas:
          prev.shopee.investido > 0
            ? safeDivision(prev.shopee.gmv, prev.shopee.investido, prev.shopee.roas)
            : prev.shopee.roas,
      },
    }));
  };

  const saveReportMutation = useMutation({
    mutationFn: async () => {
      const normalizedReport = normalizeReportPayload(reportData);
      const validationId = reportData.validationId || generateValidationId();
      const validationPassword = reportData.validationPassword || generateValidationPassword();
      const validationTime = reportData.validationTime || format(new Date(), "yyyy-MM-dd HH:mm:ss");

      const dataValues = JSON.parse(JSON.stringify({
        google: normalizedReport.google,
        meta: normalizedReport.meta,
        linkedin: normalizedReport.linkedin,
        tiktok: normalizedReport.tiktok,
        shopee: normalizedReport.shopee,
        objetivos: normalizedReport.objetivos.filter(Boolean),
        resumo: normalizedReport.resumo,
        criativos: normalizedReport.criativos,
        criativosRanking: normalizedReport.criativosRanking,
        showRanking: normalizedReport.showRanking,
        creativeScaleGoogle: normalizedReport.creativeScaleGoogle,
        creativeScaleMeta: normalizedReport.creativeScaleMeta,
        metricsConfig: normalizedReport.metricsConfig,
        sectionsConfig: normalizedReport.sectionsConfig,
        paineisAnuncio: normalizedReport.paineisAnuncio,
        customSections: normalizedReport.customSections,
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
          google_cliques: normalizedReport.google.cliques,
          google_impressoes: normalizedReport.google.impressoes,
          google_contatos: normalizedReport.google.contatos,
          google_investido: normalizedReport.google.investido,
          google_custo_por_lead: normalizedReport.google.custoPorLead,
          google_cpm: normalizedReport.google.cpm,
          meta_impressoes: normalizedReport.meta.impressoes,
          meta_engajamento: normalizedReport.meta.engajamento,
          meta_conversas: normalizedReport.meta.conversas,
          meta_investido: normalizedReport.meta.investido,
          meta_custo_por_lead: normalizedReport.meta.custoPorLead,
          meta_cpm: normalizedReport.meta.cpm,
          meta_custo_por_seguidor: normalizedReport.meta.custoPorSeguidor,
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
      console.error('Save error:', error);
      if (error?.message?.includes('Limite de relatórios')) {
        toast({ title: "Limite atingido", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Erro ao salvar", description: error.message || "Erro desconhecido", variant: "destructive" });
      }
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

    let originalStyle = "";
    let cleanupNode: HTMLDivElement | null = null;

    try {
      const element = pdfRef.current;
      // Use the actual styled width (800px during export) so the PDF
      // content fills the A4 page instead of being downscaled from 1400px.
      const captureWidth = 800;

      // Temporary style to ensure it's fully expanded for capture
      originalStyle = element.style.cssText;
      element.style.width = `${captureWidth}px`;
      element.style.maxWidth = `${captureWidth}px`;
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.transform = 'none';
      element.style.animation = 'none';

      // Clone offscreen to avoid layout shifts/animations affecting the capture.
      cleanupNode = document.createElement("div");
      cleanupNode.style.position = "fixed";
      cleanupNode.style.left = "-99999px";
      cleanupNode.style.top = "0";
      cleanupNode.style.width = `${captureWidth}px`;
      cleanupNode.style.zIndex = "-1";
      cleanupNode.style.pointerEvents = "none";
      document.body.appendChild(cleanupNode);

      const clone = element.cloneNode(true) as HTMLDivElement;
      clone.style.width = `${captureWidth}px`;
      clone.style.maxWidth = `${captureWidth}px`;
      clone.style.minHeight = "auto";
      clone.style.height = "auto";
      clone.style.transform = "none";
      clone.style.animation = "none";
      cleanupNode.appendChild(clone);

      // Wait assets in clone
      const cloneImages = Array.from(clone.querySelectorAll("img"));
      await Promise.all(
        cloneImages.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
        logging: false,
        backgroundColor: "#0b1120",
        width: captureWidth,
        windowWidth: captureWidth,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdfWidth = 210; // A4 width in mm
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const totalImgHeightInMm = imgHeight * ratio;

      // Create PDF with custom height to avoid page breaks
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, totalImgHeightInMm],
      });

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, totalImgHeightInMm);

      const clienteName = cliente?.nome || "Relatorio";
      const period = format(periodoInicio, "MMMM", { locale: ptBR });
      pdf.save(`Relatorio_${clienteName}_${period}.pdf`);

      toast({ title: "PDF gerado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro ao gerar PDF", description: error.message, variant: "destructive" });
    } finally {
      if (pdfRef.current) {
        pdfRef.current.style.cssText = originalStyle;
      }
      if (cleanupNode?.parentNode) {
        cleanupNode.parentNode.removeChild(cleanupNode);
      }
    }
  };

  // Export PDF only (saves report automatically first)
  const waitForPreviewReady = async (timeoutMs = 7000) => {
    const start = Date.now();
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    while (Date.now() - start < timeoutMs) {
      const element = pdfRef.current;
      if (!element) {
        await wait(60);
        continue;
      }

      if (document.fonts?.ready) {
        await Promise.race([document.fonts.ready, wait(300)]);
      }

      const hasSize = element.offsetWidth > 0 && element.offsetHeight > 0;
      const images = Array.from(element.querySelectorAll("img"));
      const imagesReady = images.every((img) => img.complete);

      if (hasSize && imagesReady) {
        await wait(80);
        return true;
      }

      await wait(120);
    }

    return false;
  };

  const handleExport = async () => {
    setIsExporting(true);
    setIsPreview(true);

    try {
      const credentials = await saveReportMutation.mutateAsync();

      setReportData(prev => ({
        ...prev,
        ...credentials,
        isGeneratingPDF: true
      }));

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );

      const previewReady = await waitForPreviewReady();
      if (!previewReady) {
        throw new Error("A pré-visualização não ficou pronta para exportação.");
      }

      await handleExportPDF();
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Erro ao exportar relatório",
        description: e?.message || "Não foi possível gerar o PDF agora.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setReportData(prev => ({ ...prev, isGeneratingPDF: false }));
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
      // Convert current metricsConfig to template metrics format using centralized registry
      const metrics = metricsConfigToFullTemplate(reportData.metricsConfig);

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

  const clientInitials = (cliente?.nome || "CL").slice(0, 2).toUpperCase();

  if (isGestorBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="font-medium text-muted-foreground">Restaurando dados da sessão...</p>
        </div>
      </div>
    );
  }

  if (!agencyId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-lg border-border/70 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Conta sem agência vinculada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para criar relatórios, sua conta precisa estar vinculada a uma agência.
            </p>
            <Button variant="outline" onClick={() => navigate("/clientes")} className="focus-visible:ring-2 focus-visible:ring-primary/70">
              Voltar para clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (clienteLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          <p className="font-medium text-muted-foreground">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (clienteError || !cliente) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-lg border-border/70 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Não foi possível abrir este relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Verifique se este cliente pertence à sua agência e tente novamente.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => refetchCliente()} className="focus-visible:ring-2 focus-visible:ring-primary/70">
                Tentar novamente
              </Button>
              <Button variant="outline" onClick={() => navigate("/clientes")} className="focus-visible:ring-2 focus-visible:ring-primary/70">
                Voltar para clientes
              </Button>
            </div>
          </CardContent>
        </Card>
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
                  {clientInitials}
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
      <div className="sticky top-0 z-50 border-b border-border bg-card/95 p-3 backdrop-blur sm:p-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
            <Button variant="ghost" onClick={() => setStep("template")} className="h-9 px-2.5 sm:h-10 sm:px-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Modelos
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={cliente?.logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {clientInitials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm font-semibold text-foreground sm:text-base">{cliente?.nome}</span>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <Button
              variant="outline"
              onClick={() => setSaveTemplateDialogOpen(true)}
              className="h-9 px-2 text-xs sm:h-10 sm:px-3 sm:text-sm"
            >
              <FileText className="mr-1.5 h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Salvar Modelo</span>
              <span className="sm:hidden text-[10px]">Modelo</span>
            </Button>
            <Button
              variant={isPreview ? "default" : "outline"}
              onClick={() => {
                setIsPreview(!isPreview);
              }}
              className="h-9 px-2 text-xs sm:h-10 sm:px-3 sm:text-sm"
            >
              <Eye className="w-4 h-4 mr-1.5 sm:mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={calculateMetrics}
              className="h-9 px-2 text-xs sm:h-10 sm:px-3 sm:text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Calcular métricas</span>
              <span className="sm:hidden text-[10px]">Calcular</span>
            </Button>
            <Button
              onClick={handleExport}
              className="h-9 bg-primary px-2 text-xs hover:bg-primary/90 sm:h-10 sm:px-3 sm:text-sm"
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="truncate">{isExporting ? "Exportando..." : "Exportar"}</span>
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

      <div className="mx-auto max-w-[1400px] p-3 sm:p-4 md:p-6 lg:p-8">
        {!isPreview ? (
          // Editor Mode
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid items-start gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8"
          >
            {/* Left Column: Period & Objectives */}
            <div className="space-y-5 sm:space-y-6 lg:col-span-7 lg:space-y-8">
              {/* Period Selection */}
              <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Período do Relatório
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="space-y-2">
                      <Label>Data Início</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 justify-start text-left font-normal bg-secondary border-border hover:bg-secondary/80"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {format(periodoInicio, "dd/MM/yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-card border-border shadow-xl" align="start">
                          <Calendar
                            mode="single"
                            selected={periodoInicio}
                            onSelect={(date) => date && setPeriodoInicio(date)}
                            initialFocus
                            locale={ptBR}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Data Fim</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 justify-start text-left font-normal bg-secondary border-border hover:bg-secondary/80"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {format(periodoFim, "dd/MM/yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-card border-border shadow-xl" align="start">
                          <Calendar
                            mode="single"
                            selected={periodoFim}
                            onSelect={(date) => date && setPeriodoFim(date)}
                            initialFocus
                            locale={ptBR}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Objectives */}
              <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reportData.objetivos.map((obj, index) => (
                    <div key={`objective-item-${index}-${obj.slice(0, 24)}`} className="flex gap-2">
                      <Input
                        value={obj}
                        onChange={(e) => {
                          const newObjetivos = [...reportData.objetivos];
                          newObjetivos[index] = e.target.value;
                          setReportData({ ...reportData, objetivos: newObjetivos });
                        }}
                        placeholder={`Objetivo ${index + 1}`}
                        className="bg-secondary/50"
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
            </div>

            {/* Right Column: Sections Visibility */}
            <div className="lg:col-span-5">
              <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Seções do Relatório
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 📊 Plataformas de Tráfego */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Plataformas de Tráfego
                    </p>
                    {[
                      { key: "showGoogleAds" as const, label: "Google Ads", color: "bg-blue-500" },
                      { key: "showMetaAds" as const, label: "Meta Ads", color: "bg-purple-500" },
                      { key: "showLinkedinAds" as const, label: "LinkedIn Ads", color: "bg-sky-600" },
                      { key: "showTiktokAds" as const, label: "TikTok Ads", color: "bg-pink-500" },
                      { key: "showShopeeAds" as const, label: "Shopee Ads", color: "bg-orange-500" },
                    ].map(({ key, label, color }) => (
                      <div key={key} className="flex items-center justify-between py-0.5">
                        <Label className="text-sm flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${color}`} />
                          {label}
                        </Label>
                        <Switch
                          checked={reportData.sectionsConfig[key]}
                          onCheckedChange={(checked) =>
                            setReportData({
                              ...reportData,
                              sectionsConfig: { ...reportData.sectionsConfig, [key]: checked },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* 🎨 Visuais e Criativos */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Visuais e Criativos
                    </p>
                    {[
                      { key: "showCriativosGoogle" as const, label: "Criativos Google", color: "bg-blue-500" },
                      { key: "showCriativosMeta" as const, label: "Criativos Meta", color: "bg-purple-500" },
                      { key: "showCriativosLinkedin" as const, label: "Criativos LinkedIn", color: "bg-sky-600" },
                      { key: "showCriativosTiktok" as const, label: "Criativos TikTok", color: "bg-pink-500" },
                      { key: "showCriativosShopee" as const, label: "Criativos Shopee", color: "bg-orange-500" },
                      { key: "showPaineisAnuncio" as const, label: "Painéis de Anúncio", color: "bg-slate-400" },
                    ].map(({ key, label, color }) => (
                      <div key={key} className="flex items-center justify-between py-0.5">
                        <Label className="text-sm flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${color}`} />
                          {label}
                        </Label>
                        <Switch
                          checked={reportData.sectionsConfig[key]}
                          onCheckedChange={(checked) =>
                            setReportData({
                              ...reportData,
                              sectionsConfig: { ...reportData.sectionsConfig, [key]: checked },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* 📝 Conteúdo e Extras */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Conteúdo e Extras
                    </p>
                    {[
                      { key: "showObjetivos" as const, label: "Objetivos" },
                      { key: "showResumo" as const, label: "Resumo" },
                      { key: "showStrategicInsights" as const, label: "Insights Estratégicos" },
                      { key: "showSaldoRestante" as const, label: "Saldo Restante" },
                      { key: "showCustomSections" as const, label: "Seções Personalizadas" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between py-0.5">
                        <Label className="text-sm">{label}</Label>
                        <Switch
                          checked={reportData.sectionsConfig[key]}
                          onCheckedChange={(checked) =>
                            setReportData({
                              ...reportData,
                              sectionsConfig: { ...reportData.sectionsConfig, [key]: checked },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Google Ads Metrics */}
            {reportData.sectionsConfig.showGoogleAds && (
              <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                    {reportData.metricsConfig.showGoogleCustoPorLead && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-xs">CPL (R$)</Label>
                        <NumericInput
                          value={reportData.google.custoPorLead}
                          onChange={(value) =>
                            setReportData({
                              ...reportData,
                              google: { ...reportData.google, custoPorLead: value },
                            })
                          }
                          isDecimal
                        />
                      </div>
                    )}
                    {reportData.metricsConfig.showGoogleCpm && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-xs">CPM (R$)</Label>
                        <NumericInput
                          value={reportData.google.cpm}
                          onChange={(value) =>
                            setReportData({
                              ...reportData,
                              google: { ...reportData.google, cpm: value },
                            })
                          }
                          isDecimal
                        />
                      </div>
                    )}
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
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
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
            )}

            {/* Meta Ads Metrics */}
            {reportData.sectionsConfig.showMetaAds && (
              <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
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
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                    {reportData.metricsConfig.showMetaCustoPorLead && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-xs">CPL (R$)</Label>
                        <NumericInput
                          value={reportData.meta.custoPorLead}
                          onChange={(value) =>
                            setReportData({
                              ...reportData,
                              meta: { ...reportData.meta, custoPorLead: value },
                            })
                          }
                          isDecimal
                        />
                      </div>
                    )}
                    {reportData.metricsConfig.showMetaCpm && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-xs">CPM (R$)</Label>
                        <NumericInput
                          value={reportData.meta.cpm}
                          onChange={(value) =>
                            setReportData({
                              ...reportData,
                              meta: { ...reportData.meta, cpm: value },
                            })
                          }
                          isDecimal
                        />
                      </div>
                    )}
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
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">Engajamento</Label>
                        <Switch
                          checked={reportData.metricsConfig.showMetaEngajamento}
                          onCheckedChange={(checked) =>
                            setReportData({
                              ...reportData,
                              metricsConfig: { ...reportData.metricsConfig, showMetaEngajamento: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">Conversas</Label>
                        <Switch
                          checked={reportData.metricsConfig.showMetaConversas}
                          onCheckedChange={(checked) =>
                            setReportData({
                              ...reportData,
                              metricsConfig: { ...reportData.metricsConfig, showMetaConversas: checked },
                            })
                          }
                        />
                      </div>
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
            )}

            {/* LinkedIn Ads Metrics */}
            {reportData.sectionsConfig.showLinkedinAds && (
              <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#0A66C2]/20 rounded flex items-center justify-center">
                      <span className="text-[#0A66C2] text-xs font-bold">in</span>
                    </div>
                    Tráfego LinkedIn Ads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><Eye className="w-4 h-4 text-muted-foreground" />Impressões</Label>
                      <NumericInput value={reportData.linkedin.impressoes} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, impressoes: value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><MousePointer className="w-4 h-4 text-muted-foreground" />Cliques</Label>
                      <NumericInput value={reportData.linkedin.cliques} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, cliques: value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><Target className="w-4 h-4 text-muted-foreground" />Leads</Label>
                      <NumericInput value={reportData.linkedin.leads} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, leads: value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><DollarSign className="w-4 h-4 text-muted-foreground" />Investido (R$)</Label>
                      <NumericInput value={reportData.linkedin.investido} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, investido: value } })} isDecimal />
                    </div>
                    {reportData.metricsConfig.showLinkedinConversoes && (
                      <div className="space-y-2">
                        <Label className="text-xs">Conversões</Label>
                        <NumericInput value={reportData.linkedin.conversoes} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, conversoes: value } })} />
                      </div>
                    )}
                    {reportData.metricsConfig.showLinkedinAlcance && (
                      <div className="space-y-2">
                        <Label className="text-xs">Alcance</Label>
                        <NumericInput value={reportData.linkedin.alcance} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, alcance: value } })} />
                      </div>
                    )}
                    {reportData.metricsConfig.showLinkedinCpm && (
                      <div className="space-y-2">
                        <Label className="text-xs">CPM (R$)</Label>
                        <NumericInput value={reportData.linkedin.cpm} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, cpm: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showLinkedinCpc && (
                      <div className="space-y-2">
                        <Label className="text-xs">CPC (R$)</Label>
                        <NumericInput value={reportData.linkedin.cpc} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, cpc: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showLinkedinCtr && (
                      <div className="space-y-2">
                        <Label className="text-xs">CTR (%)</Label>
                        <NumericInput value={reportData.linkedin.ctr} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, ctr: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showLinkedinCpl && (
                      <div className="space-y-2">
                        <Label className="text-xs">CPL (R$)</Label>
                        <NumericInput value={reportData.linkedin.cpl} onChange={(value) => setReportData({ ...reportData, linkedin: { ...reportData.linkedin, cpl: value } })} isDecimal />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border space-y-3">
                    <p className="text-sm text-muted-foreground font-medium">Métricas a exibir no relatório:</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CPM</Label>
                        <Switch checked={reportData.metricsConfig.showLinkedinCpm} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showLinkedinCpm: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CPC</Label>
                        <Switch checked={reportData.metricsConfig.showLinkedinCpc} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showLinkedinCpc: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CTR</Label>
                        <Switch checked={reportData.metricsConfig.showLinkedinCtr} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showLinkedinCtr: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CPL</Label>
                        <Switch checked={reportData.metricsConfig.showLinkedinCpl} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showLinkedinCpl: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">Leads</Label>
                        <Switch checked={reportData.metricsConfig.showLinkedinLeads} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showLinkedinLeads: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">Conversões</Label>
                        <Switch checked={reportData.metricsConfig.showLinkedinConversoes} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showLinkedinConversoes: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">Alcance</Label>
                        <Switch checked={reportData.metricsConfig.showLinkedinAlcance} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showLinkedinAlcance: checked } })} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TikTok Ads Metrics */}
            {reportData.sectionsConfig.showTiktokAds && (
              <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-6 h-6 bg-black/50 rounded flex items-center justify-center border border-white/20">
                      <span className="text-white text-xs font-bold">TT</span>
                    </div>
                    Tráfego TikTok Ads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><Eye className="w-4 h-4 text-muted-foreground" />Impressões</Label>
                      <NumericInput value={reportData.tiktok.impressoes} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, impressoes: value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><MousePointer className="w-4 h-4 text-muted-foreground" />Cliques</Label>
                      <NumericInput value={reportData.tiktok.cliques} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, cliques: value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><Target className="w-4 h-4 text-muted-foreground" />Leads</Label>
                      <NumericInput value={reportData.tiktok.leads} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, leads: value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><DollarSign className="w-4 h-4 text-muted-foreground" />Investido (R$)</Label>
                      <NumericInput value={reportData.tiktok.investido} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, investido: value } })} isDecimal />
                    </div>
                    {reportData.metricsConfig.showTiktokConversoes && (
                      <div className="space-y-2">
                        <Label className="text-xs">Conversões</Label>
                        <NumericInput value={reportData.tiktok.conversoes} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, conversoes: value } })} />
                      </div>
                    )}
                    {reportData.metricsConfig.showTiktokViews && (
                      <div className="space-y-2">
                        <Label className="text-xs">Views de Vídeo</Label>
                        <NumericInput value={reportData.tiktok.visualizacoesVideo} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, visualizacoesVideo: value } })} />
                      </div>
                    )}
                    {reportData.metricsConfig.showTiktokCpm && (
                      <div className="space-y-2">
                        <Label className="text-xs">CPM (R$)</Label>
                        <NumericInput value={reportData.tiktok.cpm} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, cpm: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showTiktokCpc && (
                      <div className="space-y-2">
                        <Label className="text-xs">CPC (R$)</Label>
                        <NumericInput value={reportData.tiktok.cpc} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, cpc: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showTiktokCtr && (
                      <div className="space-y-2">
                        <Label className="text-xs">CTR (%)</Label>
                        <NumericInput value={reportData.tiktok.ctr} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, ctr: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showTiktokCpl && (
                      <div className="space-y-2">
                        <Label className="text-xs">CPL (R$)</Label>
                        <NumericInput value={reportData.tiktok.cpl} onChange={(value) => setReportData({ ...reportData, tiktok: { ...reportData.tiktok, cpl: value } })} isDecimal />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border space-y-3">
                    <p className="text-sm text-muted-foreground font-medium">Métricas a exibir no relatório:</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CPM</Label>
                        <Switch checked={reportData.metricsConfig.showTiktokCpm} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showTiktokCpm: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CPC</Label>
                        <Switch checked={reportData.metricsConfig.showTiktokCpc} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showTiktokCpc: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CTR</Label>
                        <Switch checked={reportData.metricsConfig.showTiktokCtr} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showTiktokCtr: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CPL</Label>
                        <Switch checked={reportData.metricsConfig.showTiktokCpl} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showTiktokCpl: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">Leads</Label>
                        <Switch checked={reportData.metricsConfig.showTiktokLeads} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showTiktokLeads: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">Conversões</Label>
                        <Switch checked={reportData.metricsConfig.showTiktokConversoes} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showTiktokConversoes: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">Views</Label>
                        <Switch checked={reportData.metricsConfig.showTiktokViews} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showTiktokViews: checked } })} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shopee Ads Metrics */}
            {reportData.sectionsConfig.showShopeeAds && (
              <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#EE4D2D]/20 rounded flex items-center justify-center border border-[#EE4D2D]/30">
                      <ShopeeLogo className="w-4 h-4" />
                    </div>
                    Tráfego Shopee Ads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><Eye className="w-4 h-4 text-muted-foreground" />Impressões</Label>
                      <NumericInput value={reportData.shopee.impressoes} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, impressoes: value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><MousePointer className="w-4 h-4 text-muted-foreground" />Cliques</Label>
                      <NumericInput value={reportData.shopee.cliques} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, cliques: value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><Target className="w-4 h-4 text-muted-foreground" />Pedidos</Label>
                      <NumericInput value={reportData.shopee.pedidos} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, pedidos: value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs"><DollarSign className="w-4 h-4 text-muted-foreground" />Investido (R$)</Label>
                      <NumericInput value={reportData.shopee.investido} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, investido: value } })} isDecimal />
                    </div>
                    {reportData.metricsConfig.showShopeeGmv && (
                      <div className="space-y-2">
                        <Label className="text-xs">GMV (R$)</Label>
                        <NumericInput value={reportData.shopee.gmv} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, gmv: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showShopeeCpm && (
                      <div className="space-y-2">
                        <Label className="text-xs">CPM (R$)</Label>
                        <NumericInput value={reportData.shopee.cpm} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, cpm: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showShopeeCpc && (
                      <div className="space-y-2">
                        <Label className="text-xs">CPC (R$)</Label>
                        <NumericInput value={reportData.shopee.cpc} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, cpc: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showShopeeCtr && (
                      <div className="space-y-2">
                        <Label className="text-xs">CTR (%)</Label>
                        <NumericInput value={reportData.shopee.ctr} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, ctr: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showShopeeCpa && (
                      <div className="space-y-2">
                        <Label className="text-xs">CPA (R$)</Label>
                        <NumericInput value={reportData.shopee.cpa} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, cpa: value } })} isDecimal />
                      </div>
                    )}
                    {reportData.metricsConfig.showShopeeRoas && (
                      <div className="space-y-2">
                        <Label className="text-xs">ROAS (x)</Label>
                        <NumericInput value={reportData.shopee.roas} onChange={(value) => setReportData({ ...reportData, shopee: { ...reportData.shopee, roas: value } })} isDecimal />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border space-y-3">
                    <p className="text-sm text-muted-foreground font-medium">Métricas a exibir no relatório:</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">Pedidos</Label>
                        <Switch checked={reportData.metricsConfig.showShopeePedidos} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showShopeePedidos: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">GMV</Label>
                        <Switch checked={reportData.metricsConfig.showShopeeGmv} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showShopeeGmv: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CPM</Label>
                        <Switch checked={reportData.metricsConfig.showShopeeCpm} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showShopeeCpm: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CPC</Label>
                        <Switch checked={reportData.metricsConfig.showShopeeCpc} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showShopeeCpc: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CTR</Label>
                        <Switch checked={reportData.metricsConfig.showShopeeCtr} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showShopeeCtr: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">CPA</Label>
                        <Switch checked={reportData.metricsConfig.showShopeeCpa} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showShopeeCpa: checked } })} />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <Label className="text-xs">ROAS</Label>
                        <Switch checked={reportData.metricsConfig.showShopeeRoas} onCheckedChange={(checked) => setReportData({ ...reportData, metricsConfig: { ...reportData.metricsConfig, showShopeeRoas: checked } })} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Saldos / Recarga */}
            <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
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
            <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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
            <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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

            {/* Creatives - LinkedIn */}
            <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-sky-500/20 rounded flex items-center justify-center">
                    <span className="text-sky-400 text-[10px] font-bold">in</span>
                  </div>
                  Criativos LinkedIn ({reportData.criativos.filter(c => c.platform === "linkedin").length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CreativeGrid
                  platform="linkedin"
                  creatives={reportData.criativos}
                  onChange={(newCreatives) => setReportData((prev) => ({ ...prev, criativos: newCreatives }))}
                  clienteId={clienteId!}
                  maxCreatives={5}
                />
              </CardContent>
            </Card>

            {/* Creatives - TikTok */}
            <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-pink-500/20 rounded flex items-center justify-center">
                    <span className="text-pink-400 text-[10px] font-bold">TT</span>
                  </div>
                  Criativos TikTok ({reportData.criativos.filter(c => c.platform === "tiktok").length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CreativeGrid
                  platform="tiktok"
                  creatives={reportData.criativos}
                  onChange={(newCreatives) => setReportData((prev) => ({ ...prev, criativos: newCreatives }))}
                  clienteId={clienteId!}
                  maxCreatives={5}
                />
              </CardContent>
            </Card>

            {/* Creatives - Shopee */}
            <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500/20 rounded flex items-center justify-center">
                    <span className="text-orange-400 text-[10px] font-bold">S</span>
                  </div>
                  Criativos Shopee ({reportData.criativos.filter(c => c.platform === "shopee").length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CreativeGrid
                  platform="shopee"
                  creatives={reportData.criativos}
                  onChange={(newCreatives) => setReportData((prev) => ({ ...prev, criativos: newCreatives }))}
                  clienteId={clienteId!}
                  maxCreatives={5}
                />
              </CardContent>
            </Card>

            {/* Ranking Criativos */}
            <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  Tamanho dos criativos no relatório
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Google ({Math.round(reportData.creativeScaleGoogle)}%)</Label>
                  <Input
                    type="range"
                    min={100}
                    max={280}
                    step={10}
                    value={reportData.creativeScaleGoogle}
                    onChange={(event) =>
                      setReportData({
                        ...reportData,
                        creativeScaleGoogle: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Meta ({Math.round(reportData.creativeScaleMeta)}%)</Label>
                  <Input
                    type="range"
                    min={100}
                    max={280}
                    step={10}
                    value={reportData.creativeScaleMeta}
                    onChange={(event) =>
                      setReportData({
                        ...reportData,
                        creativeScaleMeta: Number(event.target.value),
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ranking Criativos */}
            <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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
                <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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
                <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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
              <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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
            <Card className="lg:col-span-12 border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
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
          <div className="flex justify-center p-4">
            <div
              ref={pdfRef}
              className={cn(
                "w-full text-zinc-100 bg-[#1e293b] shadow-2xl transition-all duration-300 overflow-hidden",
                reportData.isGeneratingPDF ? "rounded-none shadow-none" : "max-w-[850px] rounded-2xl"
              )}
              style={{
                fontFamily: "Inter, sans-serif",
                width: reportData.isGeneratingPDF ? '800px' : '100%',
                minHeight: reportData.isGeneratingPDF ? 'auto' : '1120px',
                color: '#f8fafc'
              }}
            >
              {/* Header with Client Logo + Name */}
              <ReportHeader
                cliente={cliente}
                periodoInicio={periodoInicio}
                periodoFim={periodoFim}
                isExporting={Boolean(reportData.isGeneratingPDF)}
              />

              <div className="p-2 sm:p-8 pt-0">
                {/* Objectives */}
                {reportData.sectionsConfig.showObjetivos && reportData.objetivos.filter(Boolean).length > 0 && (
                  <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
                    <h2 className="text-sm font-bold mb-4 text-[#ffb500] tracking-widest uppercase">OBJETIVOS</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {reportData.objetivos.filter(Boolean).map((obj: string, i: number) => (
                        <li key={obj} className="flex items-center gap-3 text-gray-300 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ffb500] flex-shrink-0" />
                          <span className="leading-snug">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Google Ads Section */}
                {reportData.sectionsConfig.showGoogleAds && (
                  <GoogleAdsMetricsView
                    google={reportData.google}
                    metricsConfig={reportData.metricsConfig}
                  />
                )}

                {/* Meta Ads Section */}
                {reportData.sectionsConfig.showMetaAds && (
                  <MetaAdsMetricsView
                    meta={reportData.meta}
                    metricsConfig={reportData.metricsConfig}
                  />
                )}

                {reportData.sectionsConfig.showLinkedinAds && (
                  <PlatformMetricsView
                    title="LinkedIn Ads"
                    logo={<LinkedInLogo className="w-7 h-7" />}
                    primaryMetrics={[
                      { label: "Impressões", value: reportData.linkedin.impressoes, icon: "👁️" },
                      { label: "Cliques", value: reportData.linkedin.cliques, icon: "🖱️" },
                      { label: "Leads", value: reportData.linkedin.leads, icon: "👤" },
                      { label: "Investido", value: reportData.linkedin.investido, icon: "💰", isCurrency: true },
                    ]}
                    additionalMetrics={[
                      ...(reportData.metricsConfig.showLinkedinConversoes ? [{ label: "Conversões", value: formatNumber(reportData.linkedin.conversoes) }] : []),
                      ...(reportData.metricsConfig.showLinkedinAlcance ? [{ label: "Alcance", value: formatNumber(reportData.linkedin.alcance) }] : []),
                      ...(reportData.metricsConfig.showLinkedinCpm ? [{ label: "CPM", value: formatCurrency(reportData.linkedin.cpm) }] : []),
                      ...(reportData.metricsConfig.showLinkedinCpc ? [{ label: "CPC", value: formatCurrency(reportData.linkedin.cpc) }] : []),
                      ...(reportData.metricsConfig.showLinkedinCtr ? [{ label: "CTR (%)", value: `${Number(reportData.linkedin.ctr || 0).toFixed(2)}%` }] : []),
                      ...(reportData.metricsConfig.showLinkedinCpl ? [{ label: "CPL", value: formatCurrency(reportData.linkedin.cpl) }] : []),
                    ]}
                  />
                )}

                {reportData.sectionsConfig.showTiktokAds && (
                  <PlatformMetricsView
                    title="TikTok Ads"
                    logo={<TikTokLogo className="w-7 h-7 text-white" />}
                    primaryMetrics={[
                      { label: "Impressões", value: reportData.tiktok.impressoes, icon: "👁️" },
                      { label: "Cliques", value: reportData.tiktok.cliques, icon: "🖱️" },
                      { label: "Leads", value: reportData.tiktok.leads, icon: "👤" },
                      { label: "Investido", value: reportData.tiktok.investido, icon: "💰", isCurrency: true },
                    ]}
                    additionalMetrics={[
                      ...(reportData.metricsConfig.showTiktokConversoes ? [{ label: "Conversões", value: formatNumber(reportData.tiktok.conversoes) }] : []),
                      ...(reportData.metricsConfig.showTiktokViews ? [{ label: "Views Vídeo", value: formatNumber(reportData.tiktok.visualizacoesVideo) }] : []),
                      ...(reportData.metricsConfig.showTiktokCpm ? [{ label: "CPM", value: formatCurrency(reportData.tiktok.cpm) }] : []),
                      ...(reportData.metricsConfig.showTiktokCpc ? [{ label: "CPC", value: formatCurrency(reportData.tiktok.cpc) }] : []),
                      ...(reportData.metricsConfig.showTiktokCtr ? [{ label: "CTR (%)", value: `${Number(reportData.tiktok.ctr || 0).toFixed(2)}%` }] : []),
                      ...(reportData.metricsConfig.showTiktokCpl ? [{ label: "CPL", value: formatCurrency(reportData.tiktok.cpl) }] : []),
                    ]}
                  />
                )}

                {reportData.sectionsConfig.showShopeeAds && (
                  <PlatformMetricsView
                    title="Shopee Ads"
                    logo={<ShopeeLogo className="w-7 h-7" />}
                    primaryMetrics={[
                      { label: "Impressões", value: reportData.shopee.impressoes, icon: "👁️" },
                      { label: "Cliques", value: reportData.shopee.cliques, icon: "🖱️" },
                      { label: "Pedidos", value: reportData.shopee.pedidos, icon: "🛍️" },
                      { label: "Investido", value: reportData.shopee.investido, icon: "💰", isCurrency: true },
                    ]}
                    additionalMetrics={[
                      ...(reportData.metricsConfig.showShopeeGmv ? [{ label: "GMV", value: formatCurrency(reportData.shopee.gmv) }] : []),
                      ...(reportData.metricsConfig.showShopeeCpm ? [{ label: "CPM", value: formatCurrency(reportData.shopee.cpm) }] : []),
                      ...(reportData.metricsConfig.showShopeeCpc ? [{ label: "CPC", value: formatCurrency(reportData.shopee.cpc) }] : []),
                      ...(reportData.metricsConfig.showShopeeCtr ? [{ label: "CTR (%)", value: `${Number(reportData.shopee.ctr || 0).toFixed(2)}%` }] : []),
                      ...(reportData.metricsConfig.showShopeeCpa ? [{ label: "CPA", value: formatCurrency(reportData.shopee.cpa) }] : []),
                      ...(reportData.metricsConfig.showShopeeRoas ? [{ label: "ROAS", value: `${Number(reportData.shopee.roas || 0).toFixed(2)}x` }] : []),
                    ]}
                  />
                )}

                {/* Google Creatives */}
                {reportData.sectionsConfig.showCriativosGoogle && reportData.criativos.filter(c => c.platform === "google").length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 text-blue-400 tracking-widest uppercase">
                      CRIATIVOS GOOGLE
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reportData.criativos.filter(c => c.platform === "google").slice(0, 5).map((creative) => {
                        const aspectCss = aspectRatioOptionToCss(creative.aspectRatio);
                        const creativeWidth = Math.round(140 * (reportData.creativeScaleGoogle / 100));
                        return (
                          <div
                            key={creative.id}
                            className="rounded-lg overflow-hidden border border-blue-500/30"
                            style={{
                              ...(aspectCss ? { aspectRatio: aspectCss } : {}),
                              width: `${creativeWidth}px`,
                              maxWidth: "46%",
                            }}
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
                    <h3 className="text-lg font-bold mb-4 text-purple-400 tracking-widest uppercase" style={{ color: '#c084fc' }}>
                      CRIATIVOS META
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reportData.criativos.filter(c => c.platform === "meta").slice(0, 5).map((creative) => {
                        const aspectCss = aspectRatioOptionToCss(creative.aspectRatio);
                        const creativeWidth = Math.round(140 * (reportData.creativeScaleMeta / 100));
                        return (
                          <div
                            key={creative.id}
                            className="rounded-lg overflow-hidden border border-purple-500/30"
                            style={{
                              ...(aspectCss ? { aspectRatio: aspectCss } : {}),
                              width: `${creativeWidth}px`,
                              maxWidth: "46%",
                            }}
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

                {/* LinkedIn Creatives */}
                {reportData.sectionsConfig.showCriativosLinkedin && reportData.criativos.filter(c => c.platform === "linkedin").length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 tracking-widest uppercase text-sky-400">
                      CRIATIVOS LINKEDIN
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reportData.criativos.filter(c => c.platform === "linkedin").slice(0, 5).map((creative) => {
                        const aspectCss = aspectRatioOptionToCss(creative.aspectRatio);
                        const creativeWidth = Math.round(140 * (reportData.creativeScaleMeta / 100));
                        return (
                          <div
                            key={creative.id}
                            className="rounded-lg overflow-hidden border border-sky-500/30"
                            style={{
                              ...(aspectCss ? { aspectRatio: aspectCss } : {}),
                              width: `${creativeWidth}px`,
                              maxWidth: "46%",
                            }}
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

                {/* TikTok Creatives */}
                {reportData.sectionsConfig.showCriativosTiktok && reportData.criativos.filter(c => c.platform === "tiktok").length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 tracking-widest uppercase text-pink-400">
                      CRIATIVOS TIKTOK
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reportData.criativos.filter(c => c.platform === "tiktok").slice(0, 5).map((creative) => {
                        const aspectCss = aspectRatioOptionToCss(creative.aspectRatio);
                        const creativeWidth = Math.round(140 * (reportData.creativeScaleMeta / 100));
                        return (
                          <div
                            key={creative.id}
                            className="rounded-lg overflow-hidden border border-pink-500/30"
                            style={{
                              ...(aspectCss ? { aspectRatio: aspectCss } : {}),
                              width: `${creativeWidth}px`,
                              maxWidth: "46%",
                            }}
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

                {/* Shopee Creatives */}
                {reportData.sectionsConfig.showCriativosShopee && reportData.criativos.filter(c => c.platform === "shopee").length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4 tracking-widest uppercase text-orange-400">
                      CRIATIVOS SHOPEE
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {reportData.criativos.filter(c => c.platform === "shopee").slice(0, 5).map((creative) => {
                        const aspectCss = aspectRatioOptionToCss(creative.aspectRatio);
                        const creativeWidth = Math.round(140 * (reportData.creativeScaleMeta / 100));
                        return (
                          <div
                            key={creative.id}
                            className="rounded-lg overflow-hidden border border-orange-500/30"
                            style={{
                              ...(aspectCss ? { aspectRatio: aspectCss } : {}),
                              width: `${creativeWidth}px`,
                              maxWidth: "46%",
                            }}
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
                    <h3 className="text-lg font-bold mb-4 text-yellow-400 tracking-widest uppercase">
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
                    <h3 className="text-lg font-bold mb-4 text-blue-400 tracking-widest uppercase">
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
                    <h3 className="text-lg font-bold mb-4 text-purple-400 tracking-widest uppercase">
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
                                height: reportData.isGeneratingPDF
                                  ? 'auto'
                                  : image.height
                                    ? `${image.height}px`
                                    : 'auto'
                              }}
                            >
                              <img
                                src={image.url}
                                alt={image.name}
                                className={cn(
                                  "block w-full object-contain",
                                  reportData.isGeneratingPDF ? "h-auto" : "h-full"
                                )}
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

                {/* Balances */}
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
                <ReportFooter reportData={reportData} cliente={cliente} />
              </div>
            </div>
          </div>
        )}
      </div >
    </div >
  );
};

export default RelatorioCliente;
