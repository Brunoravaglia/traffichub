import { formatCurrency, formatNumber } from "@/lib/utils";
import { GoogleLogo } from "@/components/BrandLogos";

interface GoogleAdsMetricsViewProps {
    google: any;
    metricsConfig: any;
}

export const GoogleAdsMetricsView = ({ google, metricsConfig }: GoogleAdsMetricsViewProps) => {
    const additionalMetrics = [];
    if (metricsConfig.showGoogleCustoLead) additionalMetrics.push({ label: "Custo por Lead", value: formatCurrency(google.custoPorLead), color: "text-green-400" });
    if (metricsConfig.showGoogleCpm) additionalMetrics.push({ label: "CPM", value: formatCurrency(google.cpm), color: "text-yellow-400" });
    if (metricsConfig.showGoogleCtr) additionalMetrics.push({ label: "CTR (%)", value: `${google.ctr.toFixed(2)}%`, color: "text-blue-400" });
    if (metricsConfig.showGoogleCpc) additionalMetrics.push({ label: "CPC", value: formatCurrency(google.cpc), color: "text-orange-400" });
    if (metricsConfig.showGoogleConversoes) additionalMetrics.push({ label: "Conversões Ads", value: formatNumber(google.conversoes), color: "text-emerald-400" });
    if (metricsConfig.showGoogleTaxaConversao) additionalMetrics.push({ label: "Taxa Conv.", value: `${google.taxaConversao.toFixed(2)}%`, color: "text-cyan-400" });
    if (metricsConfig.showGoogleRoas) additionalMetrics.push({ label: "ROAS", value: `${google.roas.toFixed(2)}x`, color: "text-pink-400" });
    if (metricsConfig.showGoogleRoasValor) additionalMetrics.push({ label: "ROAS (R$)", value: formatCurrency(google.roasValor), color: "text-fuchsia-400" });
    if (metricsConfig.showGoogleCustoConversao) additionalMetrics.push({ label: "Custo/Conv.", value: formatCurrency(google.custoConversao), color: "text-red-400" });
    if (metricsConfig.showGoogleAlcance) additionalMetrics.push({ label: "Alcance", value: formatNumber(google.alcance), color: "text-indigo-400" });
    if (metricsConfig.showGoogleFrequencia) additionalMetrics.push({ label: "Frequência", value: google.frequencia.toFixed(2), color: "text-violet-400" });
    if (metricsConfig.showGoogleVisualizacoesVideo) additionalMetrics.push({ label: "Views Vídeo", value: formatNumber(google.visualizacoesVideo), color: "text-teal-400" });
    if (metricsConfig.showGoogleTaxaVisualizacao) additionalMetrics.push({ label: "Taxa View", value: `${google.taxaVisualizacao.toFixed(2)}%`, color: "text-sky-400" });
    if (metricsConfig.showGoogleInteracoes) additionalMetrics.push({ label: "Interações", value: formatNumber(google.interacoes), color: "text-lime-400" });
    if (metricsConfig.showGoogleTaxaInteracao) additionalMetrics.push({ label: "Taxa Inter.", value: `${google.taxaInteracao.toFixed(2)}%`, color: "text-amber-400" });
    if (metricsConfig.showGoogleCompras) additionalMetrics.push({ label: "Compras", value: formatNumber(google.compras), color: "text-emerald-400" });
    if (metricsConfig.showGoogleVisitasProduto) additionalMetrics.push({ label: "Visitas Produto", value: formatNumber(google.visitasProduto), color: "text-sky-400" });
    if (metricsConfig.showGoogleAdicoesCarrinho) additionalMetrics.push({ label: "Add Carrinho", value: formatNumber(google.adicoesCarrinho), color: "text-orange-400" });
    if (metricsConfig.showGoogleVendas) additionalMetrics.push({ label: "Vendas", value: formatNumber(google.vendas), color: "text-green-400" });
    if (metricsConfig.showGoogleCustoPorVisita) additionalMetrics.push({ label: "Custo/Visita", value: formatCurrency(google.custoPorVisita), color: "text-cyan-400" });
    if (metricsConfig.showGoogleCustoPorAdicaoCarrinho) additionalMetrics.push({ label: "Custo/Add Carrinho", value: formatCurrency(google.custoPorAdicaoCarrinho), color: "text-yellow-400" });
    if (metricsConfig.showGoogleCustoPorVenda) additionalMetrics.push({ label: "Custo/Venda", value: formatCurrency(google.custoPorVenda), color: "text-red-400" });

    return (
        <div className="mb-8 p-8 rounded-3xl bg-[#1e293b]/50 border border-blue-500/20 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/15 rounded-xl border border-blue-500/30">
                    <GoogleLogo className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-blue-400 tracking-[0.2em] uppercase">TRÁFEGO GOOGLE</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {[
                    { label: "Cliques", value: formatNumber(google.cliques) },
                    { label: "Impressões", value: formatNumber(google.impressoes) },
                    { label: "Conversões", value: formatNumber(google.contatos) },
                    { label: "Investidos", value: formatCurrency(google.investido) }
                ].map((m) => (
                    <div key={m.label} className="text-center p-4 rounded-xl bg-white/[0.04] border border-white/[0.04] hover:bg-white/[0.06] transition-colors">
                        <p className="text-2xl font-bold text-white mb-1">{m.value}</p>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{m.label}</p>
                    </div>
                ))}
            </div>

            {additionalMetrics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {additionalMetrics.map((metric) => (
                        <div key={metric.label} className="text-center p-4 rounded-xl bg-white/[0.04] border border-white/[0.04] hover:bg-white/[0.06] transition-colors">
                            <p className={`text-xl font-bold ${metric.color} mb-1`}>{metric.value}</p>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{metric.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
