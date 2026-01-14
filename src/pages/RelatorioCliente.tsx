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
import {
  ArrowLeft,
  CalendarIcon,
  Download,
  Eye,
  Image,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
  MousePointer,
  Users,
  MessageSquare,
  DollarSign,
  Target,
  TrendingUp,
  Mail,
} from "lucide-react";
import VCDLogo from "@/components/VCDLogo";
import { cn } from "@/lib/utils";

interface Creative {
  id: string;
  url: string;
  name: string;
}

interface ReportData {
  objetivos: string[];
  google: {
    cliques: number;
    impressoes: number;
    contatos: number;
    investido: number;
  };
  meta: {
    impressoes: number;
    engajamento: number;
    conversas: number;
    investido: number;
  };
  resumo: string;
  criativos: Creative[];
}

const defaultReportData: ReportData = {
  objetivos: [
    "Aumentar a visibilidade e reconhecimento da marca",
    "Aumentar o Número de Leads Qualificados",
  ],
  google: { cliques: 0, impressoes: 0, contatos: 0, investido: 0 },
  meta: { impressoes: 0, engajamento: 0, conversas: 0, investido: 0 },
  resumo: "",
  criativos: [],
};

const RelatorioCliente = () => {
  const { id: clienteId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pdfRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPreview, setIsPreview] = useState(false);
  const [periodoInicio, setPeriodoInicio] = useState<Date>(new Date());
  const [periodoFim, setPeriodoFim] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<ReportData>(defaultReportData);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Upload creative image
  const handleUploadCreative = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          { id: Date.now().toString(), url: urlData.publicUrl, name: file.name },
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
        backgroundColor: "#0a0a0a",
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
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const clienteName = cliente?.nome || "Relatorio";
      const period = format(periodoInicio, "MMMM", { locale: ptBR });
      pdf.save(`Relatorio_${clienteName}_${period}.pdf`);

      toast({ title: "PDF gerado com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro ao gerar PDF", description: error.message, variant: "destructive" });
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
              variant={isPreview ? "default" : "outline"}
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreview ? "Editar" : "Preview"}
            </Button>
            <Button onClick={handleExportPDF} className="bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
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
              <CardContent className="grid grid-cols-2 gap-4">
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
                    Contatos
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
              <CardContent className="grid grid-cols-2 gap-4">
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
              </CardContent>
            </Card>

            {/* Creatives */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />
                  Criativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {reportData.criativos.map((creative) => (
                    <div
                      key={creative.id}
                      className="relative group rounded-lg overflow-hidden border border-border aspect-square"
                    >
                      <img
                        src={creative.url}
                        alt={creative.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveCreative(creative.id)}
                        className="absolute top-2 right-2 p-1 bg-destructive/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-destructive-foreground" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {uploadingImage ? (
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8" />
                        <span className="text-xs">Upload</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCreative}
                  className="hidden"
                />
              </CardContent>
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
              className="w-full max-w-[800px] bg-[#0f0f0f] text-white p-8 rounded-lg shadow-2xl"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {/* Header with Client Logo */}
              <div className="flex items-center justify-between mb-8">
                {cliente?.logo_url && (
                  <img
                    src={cliente.logo_url}
                    alt={cliente.nome}
                    className="h-16 object-contain"
                  />
                )}
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-white">RESULTADOS DE CAMPANHA</h1>
                  <p className="text-xl text-primary uppercase">
                    Mês de {format(periodoInicio, "MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Period */}
              <div className="text-center mb-8 text-sm text-gray-400 tracking-widest uppercase">
                Campanhas de {format(periodoInicio, "dd/MM")} à {format(periodoFim, "dd/MM")}
              </div>

              {/* Objectives */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-primary tracking-widest">OBJETIVOS</h2>
                <ul className="space-y-2">
                  {reportData.objetivos.filter(Boolean).map((obj, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Google Ads Section */}
              <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-blue-900/30 to-transparent border border-blue-500/20">
                <h3 className="text-lg font-bold mb-4 text-blue-400">TRÁFEGO GOOGLE</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{formatNumber(reportData.google.cliques)}</p>
                    <p className="text-sm text-gray-400">Cliques</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{formatNumber(reportData.google.impressoes)}</p>
                    <p className="text-sm text-gray-400">Impressões</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{formatNumber(reportData.google.contatos)}</p>
                    <p className="text-sm text-gray-400">Contatos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{formatCurrency(reportData.google.investido)}</p>
                    <p className="text-sm text-gray-400">Investidos</p>
                  </div>
                </div>
              </div>

              {/* Meta Ads Section */}
              <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-purple-900/30 to-transparent border border-purple-500/20">
                <h3 className="text-lg font-bold mb-4 text-purple-400">TRÁFEGO META ADS</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{formatNumber(reportData.meta.impressoes)}</p>
                    <p className="text-sm text-gray-400">Impressões</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{formatNumber(reportData.meta.engajamento)}</p>
                    <p className="text-sm text-gray-400">Engajamento</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{formatNumber(reportData.meta.conversas)}</p>
                    <p className="text-sm text-gray-400">Conversas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{formatCurrency(reportData.meta.investido)}</p>
                    <p className="text-sm text-gray-400">Investidos</p>
                  </div>
                </div>
              </div>

              {/* Creatives Section */}
              {reportData.criativos.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 text-primary tracking-widest">
                    CAMPANHAS E CRIATIVOS
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {reportData.criativos.slice(0, 3).map((creative) => (
                      <div key={creative.id} className="rounded-lg overflow-hidden border border-border">
                        <img
                          src={creative.url}
                          alt={creative.name}
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {reportData.resumo && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 text-primary tracking-widest">
                    Resumo geral dos resultados
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{reportData.resumo}</p>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-800 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <VCDLogo size="sm" showText={false} />
                  <div>
                    <p className="text-xs text-gray-500">@vocedigitalpropaganda</p>
                    <p className="text-xs text-gray-500">www.vocedigitalpropaganda.com.br</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Relatório gerado em</p>
                  <p>{format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
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
