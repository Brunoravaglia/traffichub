import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, DollarSign, Eye, MousePointerClick, Target, TrendingUp, Award, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface GoogleMetrics {
  investimento: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  topoPesquisas: number;
  taxaSuperacao: number;
  topPalavras: string[];
}

interface FacebookMetrics {
  investimento: number;
  cliques: number;
  conversoes: number;
  alcance: number;
  impressoes: number;
}

interface ReportPDFProps {
  cliente: {
    nome: string;
    gestores?: { nome: string };
  } | null;
  googleMetrics: GoogleMetrics;
  facebookMetrics: FacebookMetrics;
  onClose: () => void;
}

const ReportPDF = ({ cliente, googleMetrics, facebookMetrics, onClose }: ReportPDFProps) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate derived metrics
  const googleCTR = googleMetrics.impressoes > 0 
    ? ((googleMetrics.cliques / googleMetrics.impressoes) * 100).toFixed(2) 
    : "0.00";
  const googleCPC = googleMetrics.cliques > 0 
    ? (googleMetrics.investimento / googleMetrics.cliques).toFixed(2) 
    : "0.00";
  const facebookCTR = facebookMetrics.impressoes > 0 
    ? ((facebookMetrics.cliques / facebookMetrics.impressoes) * 100).toFixed(2) 
    : "0.00";
  const facebookCPC = facebookMetrics.cliques > 0 
    ? (facebookMetrics.investimento / facebookMetrics.cliques).toFixed(2) 
    : "0.00";

  const handleDownload = async () => {
    if (!reportRef.current) return;

    try {
      toast.loading("Gerando PDF...");
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#0B0B0B",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-${cliente?.nome || "cliente"}-${new Date().toISOString().split("T")[0]}.pdf`);

      toast.dismiss();
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Controls */}
      <header className="border-b border-border/50 glassmorphism sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Editor
            </Button>
            <Button
              onClick={handleDownload}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </header>

      {/* PDF Preview */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div
            ref={reportRef}
            className="bg-[#0B0B0B] p-8 rounded-2xl shadow-2xl"
            style={{ minHeight: "1123px" }}
          >
            {/* Report Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/30">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Relatório de Performance
                </h1>
                <p className="text-muted-foreground text-lg">
                  {cliente?.nome}
                </p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-primary-foreground">VD</span>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate()}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-card/50 p-4 rounded-xl">
                <p className="text-muted-foreground text-sm">Cliente</p>
                <p className="text-white font-semibold text-lg">{cliente?.nome}</p>
              </div>
              <div className="bg-card/50 p-4 rounded-xl">
                <p className="text-muted-foreground text-sm">Gestor Responsável</p>
                <p className="text-white font-semibold text-lg">{cliente?.gestores?.nome || "N/A"}</p>
              </div>
            </div>

            {/* Google Ads Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-white">Google Ads</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-xl border border-primary/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground text-sm">Investimento</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(googleMetrics.investimento)}</p>
                </motion.div>

                <div className="bg-card/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Impressões</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(googleMetrics.impressoes)}</p>
                </div>

                <div className="bg-card/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Cliques</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(googleMetrics.cliques)}</p>
                </div>

                <div className="bg-card/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Conversões</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(googleMetrics.conversoes)}</p>
                </div>

                <div className="bg-card/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Topo Pesquisas</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{googleMetrics.topoPesquisas}%</p>
                </div>

                <div className="bg-card/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Taxa Superação</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{googleMetrics.taxaSuperacao}%</p>
                </div>
              </div>

              {/* Derived Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-card/30 p-4 rounded-xl">
                  <span className="text-muted-foreground text-sm">CTR</span>
                  <p className="text-xl font-bold text-primary">{googleCTR}%</p>
                </div>
                <div className="bg-card/30 p-4 rounded-xl">
                  <span className="text-muted-foreground text-sm">CPC Médio</span>
                  <p className="text-xl font-bold text-primary">R$ {googleCPC}</p>
                </div>
              </div>

              {/* Top Keywords */}
              {googleMetrics.topPalavras.filter(p => p).length > 0 && (
                <div className="bg-card/30 p-4 rounded-xl">
                  <p className="text-muted-foreground text-sm mb-3">Top Palavras-Chave</p>
                  <div className="flex flex-wrap gap-2">
                    {googleMetrics.topPalavras.filter(p => p).map((palavra, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                      >
                        #{i + 1} {palavra}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Facebook Ads Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Facebook Ads</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground text-sm">Investimento</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(facebookMetrics.investimento)}</p>
                </div>

                <div className="bg-card/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Cliques</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(facebookMetrics.cliques)}</p>
                </div>

                <div className="bg-card/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Conversões</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(facebookMetrics.conversoes)}</p>
                </div>

                <div className="bg-card/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Alcance</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(facebookMetrics.alcance)}</p>
                </div>

                <div className="bg-card/50 p-4 rounded-xl col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Impressões</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatNumber(facebookMetrics.impressoes)}</p>
                </div>
              </div>

              {/* Derived Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card/30 p-4 rounded-xl">
                  <span className="text-muted-foreground text-sm">CTR</span>
                  <p className="text-xl font-bold text-blue-500">{facebookCTR}%</p>
                </div>
                <div className="bg-card/30 p-4 rounded-xl">
                  <span className="text-muted-foreground text-sm">CPC Médio</span>
                  <p className="text-xl font-bold text-blue-500">R$ {facebookCPC}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border/30 text-center">
              <p className="text-muted-foreground text-sm">
                Relatório gerado automaticamente por <span className="text-primary font-medium">Você Digital</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPDF;
