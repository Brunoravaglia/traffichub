import { formatCurrency, formatNumber } from "@/lib/utils";
import { GoogleLogo } from "@/components/BrandLogos";

interface GoogleAdsMetricsViewProps {
    google: any;
    metricsConfig: any;
}

const toSafeNumber = (value: unknown, fallback = 0) => {
    const parsed = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getPrimaryMetricValueClass = (value: string, isInvested = false) => {
    const len = value.length;
    if (isInvested) {
        if (len <= 10) return "text-[clamp(1.2rem,1.8vw,1.95rem)]";
        if (len <= 13) return "text-[clamp(1.05rem,1.55vw,1.6rem)]";
        if (len <= 16) return "text-[clamp(0.94rem,1.25vw,1.25rem)]";
        return "text-[clamp(0.86rem,1.05vw,1.08rem)]";
    }

    if (len <= 8) return "text-[clamp(1.2rem,1.85vw,2rem)]";
    if (len <= 11) return "text-[clamp(1.05rem,1.55vw,1.6rem)]";
    if (len <= 14) return "text-[clamp(0.94rem,1.25vw,1.25rem)]";
    return "text-[clamp(0.86rem,1.05vw,1.08rem)]";
};

const getAdditionalMetricValueClass = (value: string) => {
    const len = value.length;
    if (len <= 9) return "text-[clamp(0.9rem,1.2vw,1.05rem)]";
    if (len <= 12) return "text-[clamp(0.82rem,1.05vw,0.96rem)]";
    if (len <= 15) return "text-[clamp(0.76rem,0.95vw,0.88rem)]";
    return "text-[clamp(0.72rem,0.88vw,0.82rem)]";
};

export const GoogleAdsMetricsView = ({ google, metricsConfig }: GoogleAdsMetricsViewProps) => {
    const additionalMetrics = [];
    const primaryMetrics = [
        { label: "Cliques", value: formatNumber(google.cliques), icon: "🖱️", visible: true },
        { label: "Impressões", value: formatNumber(google.impressoes), icon: "👁️", visible: true },
        { label: "Conversões", value: formatNumber(google.contatos), icon: "🎯", visible: true },
        { label: "Investido", value: formatCurrency(google.investido), icon: "💰", visible: true },
    ].filter((metric) => metric.visible);
    const showGoogleCpl = metricsConfig.showGoogleCustoPorLead ?? metricsConfig.showGoogleCustoLead;
    if (showGoogleCpl) additionalMetrics.push({ label: "Custo por Lead", value: formatCurrency(google.custoPorLead), color: "text-green-400" });
    if (metricsConfig.showGoogleCpm) additionalMetrics.push({ label: "CPM", value: formatCurrency(google.cpm), color: "text-yellow-400" });
    if (metricsConfig.showGoogleCtr) additionalMetrics.push({ label: "CTR (%)", value: `${toSafeNumber(google.ctr).toFixed(2)}%`, color: "text-blue-400" });
    if (metricsConfig.showGoogleCpc) additionalMetrics.push({ label: "CPC", value: formatCurrency(google.cpc), color: "text-orange-400" });
    if (metricsConfig.showGoogleConversoes) additionalMetrics.push({ label: "Conversões Ads", value: formatNumber(google.conversoes), color: "text-emerald-400" });
    if (metricsConfig.showGoogleTaxaConversao) additionalMetrics.push({ label: "Taxa Conv.", value: `${toSafeNumber(google.taxaConversao).toFixed(2)}%`, color: "text-cyan-400" });
    if (metricsConfig.showGoogleRoas) additionalMetrics.push({ label: "ROAS", value: `${toSafeNumber(google.roas).toFixed(2)}x`, color: "text-pink-400" });
    if (metricsConfig.showGoogleRoasValor) additionalMetrics.push({ label: "ROAS (R$)", value: formatCurrency(google.roasValor), color: "text-fuchsia-400" });
    if (metricsConfig.showGoogleCustoConversao) additionalMetrics.push({ label: "Custo/Conv.", value: formatCurrency(google.custoConversao), color: "text-red-400" });
    if (metricsConfig.showGoogleAlcance) additionalMetrics.push({ label: "Alcance", value: formatNumber(google.alcance), color: "text-indigo-400" });
    if (metricsConfig.showGoogleFrequencia) additionalMetrics.push({ label: "Frequência", value: toSafeNumber(google.frequencia).toFixed(2), color: "text-violet-400" });
    if (metricsConfig.showGoogleVisualizacoesVideo) additionalMetrics.push({ label: "Views Vídeo", value: formatNumber(google.visualizacoesVideo), color: "text-teal-400" });
    if (metricsConfig.showGoogleTaxaVisualizacao) additionalMetrics.push({ label: "Taxa View", value: `${toSafeNumber(google.taxaVisualizacao).toFixed(2)}%`, color: "text-sky-400" });
    if (metricsConfig.showGoogleInteracoes) additionalMetrics.push({ label: "Interações", value: formatNumber(google.interacoes), color: "text-lime-400" });
    if (metricsConfig.showGoogleTaxaInteracao) additionalMetrics.push({ label: "Taxa Inter.", value: `${toSafeNumber(google.taxaInteracao).toFixed(2)}%`, color: "text-amber-400" });
    if (metricsConfig.showGoogleCompras) additionalMetrics.push({ label: "Compras", value: formatNumber(google.compras), color: "text-emerald-400" });
    if (metricsConfig.showGoogleVisitasProduto) additionalMetrics.push({ label: "Visitas Produto", value: formatNumber(google.visitasProduto), color: "text-sky-400" });
    if (metricsConfig.showGoogleAdicoesCarrinho) additionalMetrics.push({ label: "Add Carrinho", value: formatNumber(google.adicoesCarrinho), color: "text-orange-400" });
    if (metricsConfig.showGoogleVendas) additionalMetrics.push({ label: "Vendas", value: formatNumber(google.vendas), color: "text-green-400" });
    if (metricsConfig.showGoogleCustoPorVisita) additionalMetrics.push({ label: "Custo/Visita", value: formatCurrency(google.custoPorVisita), color: "text-cyan-400" });
    if (metricsConfig.showGoogleCustoPorAdicaoCarrinho) additionalMetrics.push({ label: "Custo/Add Carrinho", value: formatCurrency(google.custoPorAdicaoCarrinho), color: "text-yellow-400" });
    if (metricsConfig.showGoogleCustoPorVenda) additionalMetrics.push({ label: "Custo/Venda", value: formatCurrency(google.custoPorVenda), color: "text-red-400" });

    return (
        <div className="mb-6 sm:mb-8 p-4 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-black/60 to-black/30 border border-[#ffb500]/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb500]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="flex items-center mb-8 relative">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#ffb500]/20 to-transparent rounded-2xl border border-[#ffb500]/20 shadow-[0_0_15px_rgba(255,181,0,0.1)]">
                        <GoogleLogo className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-[0.2em] uppercase">Google Ads</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 relative">
                {primaryMetrics.map((m) => (
                    <div key={m.label} className="min-w-0 min-h-[110px] sm:min-h-[144px] p-3 sm:p-6 rounded-xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-[#ffb500]/30 transition-all duration-500 group/item">
                        <p
                            className={`block w-full font-black text-white mb-2 tracking-tight whitespace-normal break-all leading-[1.3] tabular-nums group-hover:text-[#ffb500] transition-colors ${
                                m.label === "Investido"
                                    ? getPrimaryMetricValueClass(String(m.value), true)
                                    : getPrimaryMetricValueClass(String(m.value))
                            }`}
                            title={String(m.value)}
                        >
                            {m.value}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] opacity-50">{m.icon}</span>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {additionalMetrics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 relative">
                    {additionalMetrics.map((metric) => (
                        <div key={metric.label} className="min-w-0 min-h-[80px] sm:min-h-[108px] p-3 sm:p-5 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] transition-all duration-300">
                            <p
                                className={`${getAdditionalMetricValueClass(String(metric.value))} block w-full font-bold text-[#ffb500] mb-1 tracking-tight whitespace-normal break-all leading-[1.25] tabular-nums`}
                                title={String(metric.value)}
                            >
                                {metric.value}
                            </p>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em]">{metric.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
