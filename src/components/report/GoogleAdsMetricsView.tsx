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

/** Adaptive font size — always readable, never overflows */
const getPrimarySize = (len: number, isCurrency = false) => {
    if (isCurrency) {
        if (len <= 10) return "text-[clamp(1.25rem,2.4vw,1.95rem)]";
        if (len <= 14) return "text-[clamp(1.05rem,1.8vw,1.5rem)]";
        return "text-[clamp(0.9rem,1.4vw,1.15rem)]";
    }
    if (len <= 6) return "text-[clamp(1.4rem,2.8vw,2.1rem)]";
    if (len <= 10) return "text-[clamp(1.15rem,2.2vw,1.7rem)]";
    if (len <= 14) return "text-[clamp(1rem,1.6vw,1.35rem)]";
    return "text-[clamp(0.85rem,1.2vw,1.1rem)]";
};

const getSecondarySize = (len: number) => {
    if (len <= 8) return "text-[clamp(0.95rem,1.6vw,1.15rem)]";
    if (len <= 12) return "text-[clamp(0.85rem,1.3vw,1rem)]";
    return "text-[clamp(0.78rem,1.1vw,0.9rem)]";
};

export const GoogleAdsMetricsView = ({ google, metricsConfig }: GoogleAdsMetricsViewProps) => {
    const additionalMetrics: { label: string; value: string }[] = [];
    const primaryMetrics = [
        { label: "Cliques", value: formatNumber(google.cliques), icon: "🖱️", visible: true },
        { label: "Impressões", value: formatNumber(google.impressoes), icon: "👁️", visible: true },
        { label: "Conversões", value: formatNumber(google.contatos), icon: "🎯", visible: true },
        { label: "Investido", value: formatCurrency(google.investido), icon: "💰", visible: true, isCurrency: true },
    ].filter((metric) => metric.visible);
    const showGoogleCpl = metricsConfig.showGoogleCustoPorLead ?? metricsConfig.showGoogleCustoLead;
    if (showGoogleCpl) additionalMetrics.push({ label: "Custo por Lead", value: formatCurrency(google.custoPorLead) });
    if (metricsConfig.showGoogleCpm) additionalMetrics.push({ label: "CPM", value: formatCurrency(google.cpm) });
    if (metricsConfig.showGoogleCtr) additionalMetrics.push({ label: "CTR (%)", value: `${toSafeNumber(google.ctr).toFixed(2)}%` });
    if (metricsConfig.showGoogleCpc) additionalMetrics.push({ label: "CPC", value: formatCurrency(google.cpc) });
    if (metricsConfig.showGoogleConversoes) additionalMetrics.push({ label: "Conversões Ads", value: formatNumber(google.conversoes) });
    if (metricsConfig.showGoogleTaxaConversao) additionalMetrics.push({ label: "Taxa Conv.", value: `${toSafeNumber(google.taxaConversao).toFixed(2)}%` });
    if (metricsConfig.showGoogleRoas) additionalMetrics.push({ label: "ROAS", value: `${toSafeNumber(google.roas).toFixed(2)}x` });
    if (metricsConfig.showGoogleRoasValor) additionalMetrics.push({ label: "ROAS (R$)", value: formatCurrency(google.roasValor) });
    if (metricsConfig.showGoogleCustoConversao) additionalMetrics.push({ label: "Custo/Conv.", value: formatCurrency(google.custoConversao) });
    if (metricsConfig.showGoogleAlcance) additionalMetrics.push({ label: "Alcance", value: formatNumber(google.alcance) });
    if (metricsConfig.showGoogleFrequencia) additionalMetrics.push({ label: "Frequência", value: toSafeNumber(google.frequencia).toFixed(2) });
    if (metricsConfig.showGoogleVisualizacoesVideo) additionalMetrics.push({ label: "Views Vídeo", value: formatNumber(google.visualizacoesVideo) });
    if (metricsConfig.showGoogleTaxaVisualizacao) additionalMetrics.push({ label: "Taxa View", value: `${toSafeNumber(google.taxaVisualizacao).toFixed(2)}%` });
    if (metricsConfig.showGoogleInteracoes) additionalMetrics.push({ label: "Interações", value: formatNumber(google.interacoes) });
    if (metricsConfig.showGoogleTaxaInteracao) additionalMetrics.push({ label: "Taxa Inter.", value: `${toSafeNumber(google.taxaInteracao).toFixed(2)}%` });
    if (metricsConfig.showGoogleCompras) additionalMetrics.push({ label: "Compras", value: formatNumber(google.compras) });
    if (metricsConfig.showGoogleVisitasProduto) additionalMetrics.push({ label: "Visitas Produto", value: formatNumber(google.visitasProduto) });
    if (metricsConfig.showGoogleAdicoesCarrinho) additionalMetrics.push({ label: "Add Carrinho", value: formatNumber(google.adicoesCarrinho) });
    if (metricsConfig.showGoogleVendas) additionalMetrics.push({ label: "Vendas", value: formatNumber(google.vendas) });
    if (metricsConfig.showGoogleCustoPorVisita) additionalMetrics.push({ label: "Custo/Visita", value: formatCurrency(google.custoPorVisita) });
    if (metricsConfig.showGoogleCustoPorAdicaoCarrinho) additionalMetrics.push({ label: "Custo/Add Carrinho", value: formatCurrency(google.custoPorAdicaoCarrinho) });
    if (metricsConfig.showGoogleCustoPorVenda) additionalMetrics.push({ label: "Custo/Venda", value: formatCurrency(google.custoPorVenda) });

    return (
        <div className="mb-6 sm:mb-8 p-4 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-black/60 to-black/30 border border-[#ffb500]/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb500]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="flex items-center mb-6 sm:mb-8 relative">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#ffb500]/20 to-transparent rounded-xl sm:rounded-2xl border border-[#ffb500]/20 shadow-[0_0_15px_rgba(255,181,0,0.1)]">
                        <GoogleLogo className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-[0.15em] sm:tracking-[0.2em] uppercase">Google Ads</h3>
                </div>
            </div>

            {/* Primary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 relative">
                {primaryMetrics.map((m) => {
                    const str = String(m.value);
                    return (
                        <div
                            key={m.label}
                            className="min-w-0 flex flex-col justify-between p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#ffb500]/30 transition-all duration-500 overflow-hidden"
                            style={{ minHeight: "clamp(90px, 12vw, 130px)" }}
                        >
                            <p
                                className={`font-black text-white tracking-tight leading-[1.2] tabular-nums overflow-hidden ${
                                    (m as any).isCurrency ? getPrimarySize(str.length, true) : getPrimarySize(str.length)
                                }`}
                                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                                title={str}
                            >
                                {m.value}
                            </p>
                            <div className="flex items-center gap-1.5 mt-auto pt-2">
                                <span className="text-[9px] sm:text-[10px] opacity-40 flex-shrink-0">{m.icon}</span>
                                <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-[0.12em] sm:tracking-[0.15em] truncate">{m.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Additional Metrics */}
            {additionalMetrics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 relative">
                    {additionalMetrics.map((metric) => {
                        const str = String(metric.value);
                        return (
                            <div
                                key={metric.label}
                                className="min-w-0 flex flex-col justify-between p-3 sm:p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden"
                                style={{ minHeight: "clamp(70px, 9vw, 100px)" }}
                            >
                                <p
                                    className={`${getSecondarySize(str.length)} font-bold text-[#ffb500] tracking-tight leading-[1.2] tabular-nums overflow-hidden`}
                                    style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                                    title={str}
                                >
                                    {str}
                                </p>
                                <p className="text-[7px] sm:text-[8px] font-black text-gray-500 uppercase tracking-[0.1em] sm:tracking-[0.12em] truncate mt-auto pt-1.5">{metric.label}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
