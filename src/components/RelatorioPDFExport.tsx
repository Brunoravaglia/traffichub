import { useRef } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, TrendingUp, MousePointer, Eye, Target, Award, Search, DollarSign, AlertTriangle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface RelatorioPDFExportProps {
  cliente: {
    nome: string;
    logo_url?: string | null;
    gestores?: { nome: string } | null;
  };
  relatorio: {
    data: string;
    investimento_google?: number | null;
    impressoes_google?: number | null;
    cliques_google?: number | null;
    conversoes_google?: number | null;
    topo_pesquisas?: number | null;
    taxa_superacao?: number | null;
    top_palavras_chaves?: string[] | null;
    investimento_facebook?: number | null;
    impressoes_facebook?: number | null;
    cliques_facebook?: number | null;
    conversoes_facebook?: number | null;
    alcance_facebook?: number | null;
    edited_at?: string | null;
    edit_count?: number | null;
    saldo_google?: number | null;
    saldo_meta?: number | null;
    google_recarga_tipo?: string | null;
    meta_recarga_tipo?: string | null;
  };
}

const RelatorioPDFExport = ({ cliente, relatorio }: RelatorioPDFExportProps) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const isEdited = relatorio.edit_count && relatorio.edit_count > 0;

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (!value) return "0";
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const formatPercent = (value: number | null | undefined) => {
    if (!value) return "0%";
    return `${value.toFixed(1)}%`;
  };

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;

    try {
      toast({
        title: "Gerando PDF...",
        description: "Aguarde enquanto o relatório é gerado.",
      });

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
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
      pdf.save(`relatorio-${cliente.nome.toLowerCase().replace(/\s+/g, "-")}-${relatorio.data}.pdf`);

      toast({
        title: "PDF gerado!",
        description: "O relatório foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={handleExportPDF} className="vcd-button-glow">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* PDF Content */}
      <div
        ref={pdfRef}
        className="bg-[#0a0a0a] p-8 rounded-2xl"
        style={{ minWidth: "800px" }}
      >
        {/* Audit Warning Banner */}
        {isEdited && (
          <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div>
              <p className="text-orange-500 font-semibold text-sm">
                Documento Editado - Registro de Auditoria
              </p>
              <p className="text-orange-400/80 text-xs mt-1">
                Este relatório foi editado {relatorio.edit_count} vez(es). 
                Última edição em: {relatorio.edited_at 
                  ? format(new Date(relatorio.edited_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                  : "N/A"
                }
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-6">
            {cliente.logo_url ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                <img
                  src={cliente.logo_url}
                  alt={cliente.nome}
                  className="w-full h-full object-contain p-2"
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {cliente.nome.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{cliente.nome}</h1>
              <p className="text-white/60">Relatório de Performance</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-sm">Período</p>
            <p className="text-white font-semibold">
              {format(parseISO(relatorio.data), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            {cliente.gestores?.nome && (
              <p className="text-white/40 text-sm mt-1">
                Gestor: {cliente.gestores.nome}
              </p>
            )}
          </div>
        </div>

        {/* Google Ads Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#4285f4]/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-[#4285f4]" />
            </div>
            <h2 className="text-xl font-bold text-white">Google Ads</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Investimento"
              value={formatCurrency(relatorio.investimento_google)}
              color="#4285f4"
            />
            <MetricCard
              icon={<Eye className="w-5 h-5" />}
              label="Impressões"
              value={formatNumber(relatorio.impressoes_google)}
              color="#34a853"
            />
            <MetricCard
              icon={<MousePointer className="w-5 h-5" />}
              label="Cliques"
              value={formatNumber(relatorio.cliques_google)}
              color="#fbbc04"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              icon={<Target className="w-5 h-5" />}
              label="Conversões"
              value={formatNumber(relatorio.conversoes_google)}
              color="#ea4335"
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Topo das Pesquisas"
              value={formatPercent(relatorio.topo_pesquisas)}
              color="#4285f4"
            />
            <MetricCard
              icon={<Award className="w-5 h-5" />}
              label="Taxa de Superação"
              value={formatPercent(relatorio.taxa_superacao)}
              color="#34a853"
            />
          </div>

          {/* Google Balance */}
          {relatorio.saldo_google !== null && relatorio.saldo_google !== undefined && relatorio.google_recarga_tipo !== 'continuo' && (
            <div className="mt-4 p-4 rounded-xl bg-[#4285f4]/10 border border-[#4285f4]/20">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#4285f4]" />
                <span className="text-white/60 text-sm">Saldo Restante</span>
                <span className="text-[#4285f4] font-bold text-lg ml-auto">
                  {formatCurrency(relatorio.saldo_google)}
                </span>
              </div>
            </div>
          )}

          {relatorio.top_palavras_chaves && relatorio.top_palavras_chaves.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/60 text-sm mb-2">Top Palavras-Chave</p>
              <div className="flex flex-wrap gap-2">
                {relatorio.top_palavras_chaves.map((palavra, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-[#4285f4]/20 text-[#4285f4] text-sm font-medium"
                  >
                    {palavra}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Facebook/Meta Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#1877f2]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1877f2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Meta Ads</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Investimento"
              value={formatCurrency(relatorio.investimento_facebook)}
              color="#1877f2"
            />
            <MetricCard
              icon={<Eye className="w-5 h-5" />}
              label="Impressões"
              value={formatNumber(relatorio.impressoes_facebook)}
              color="#e4405f"
            />
            <MetricCard
              icon={<MousePointer className="w-5 h-5" />}
              label="Cliques"
              value={formatNumber(relatorio.cliques_facebook)}
              color="#833ab4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={<Target className="w-5 h-5" />}
              label="Conversões"
              value={formatNumber(relatorio.conversoes_facebook)}
              color="#fd1d1d"
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Alcance"
              value={formatNumber(relatorio.alcance_facebook)}
              color="#1877f2"
            />
          </div>

          {/* Meta Balance */}
          {relatorio.saldo_meta !== null && relatorio.saldo_meta !== undefined && relatorio.meta_recarga_tipo !== 'continuo' && (
            <div className="mt-4 p-4 rounded-xl bg-[#1877f2]/10 border border-[#1877f2]/20">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#1877f2]" />
                <span className="text-white/60 text-sm">Saldo Restante</span>
                <span className="text-[#1877f2] font-bold text-lg ml-auto">
                  {formatCurrency(relatorio.saldo_meta)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="text-white/40 text-sm">VCD Performance</span>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-sm">
              Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            {isEdited && (
              <p className="text-orange-400/60 text-xs mt-1">
                Versão editada #{relatorio.edit_count}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const MetricCard = ({ icon, label, value, color }: MetricCardProps) => (
  <div
    className="p-4 rounded-xl border border-white/10"
    style={{ backgroundColor: `${color}10` }}
  >
    <div className="flex items-center gap-2 mb-2">
      <div style={{ color }}>{icon}</div>
      <span className="text-white/60 text-sm">{label}</span>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

export default RelatorioPDFExport;
