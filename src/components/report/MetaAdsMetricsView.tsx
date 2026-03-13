import { formatCurrency, formatNumber } from "@/lib/utils";
import { MetaLogo } from "@/components/BrandLogos";

interface MetaAdsMetricsViewProps {
    meta: any;
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

export const MetaAdsMetricsView = ({ meta, metricsConfig }: MetaAdsMetricsViewProps) => {
    const additionalMetrics: { label: string; value: string }[] = [];
    const primaryMetrics = [
        { label: "Impressões", value: formatNumber(meta.impressoes), icon: "👁️", visible: true },
        { label: "Engajamento", value: formatNumber(meta.engajamento), icon: "🔄", visible: !!metricsConfig.showMetaEngajamento },
        { label: "Conversas", value: formatNumber(meta.conversas), icon: "💬", visible: !!metricsConfig.showMetaConversas },
        { label: "Investido", value: formatCurrency(meta.investido), icon: "💰", visible: true, isCurrency: true },
    ].filter((metric) => metric.visible);
    const showMetaCpl = metricsConfig.showMetaCustoPorLead ?? metricsConfig.showMetaCustoLead;
    if (showMetaCpl) additionalMetrics.push({ label: "Custo por Lead", value: formatCurrency(meta.custoPorLead) });
    if (metricsConfig.showMetaCpm) additionalMetrics.push({ label: "CPM", value: formatCurrency(meta.cpm) });
    if (metricsConfig.showMetaCustoPorSeguidor) additionalMetrics.push({ label: "Custo/Seguidor", value: formatCurrency(meta.custoPorSeguidor) });
    if (metricsConfig.showMetaCliques) additionalMetrics.push({ label: "Cliques Link", value: formatNumber(meta.cliques) });
    if (metricsConfig.showMetaCtr) additionalMetrics.push({ label: "CTR (%)", value: `${toSafeNumber(meta.ctr).toFixed(2)}%` });
    if (metricsConfig.showMetaCpc) additionalMetrics.push({ label: "CPC", value: formatCurrency(meta.cpc) });
    if (metricsConfig.showMetaAlcance) additionalMetrics.push({ label: "Alcance", value: formatNumber(meta.alcance) });
    if (metricsConfig.showMetaFrequencia) additionalMetrics.push({ label: "Frequência", value: toSafeNumber(meta.frequencia).toFixed(2) });
    if (metricsConfig.showMetaLeads) additionalMetrics.push({ label: "Leads", value: formatNumber(meta.leads) });
    if (metricsConfig.showMetaConversoes) additionalMetrics.push({ label: "Conversões", value: formatNumber(meta.conversoes) });
    if (metricsConfig.showMetaRoas) additionalMetrics.push({ label: "ROAS", value: `${toSafeNumber(meta.roas).toFixed(2)}x` });
    if (metricsConfig.showMetaRoasValor) additionalMetrics.push({ label: "ROAS (R$)", value: formatCurrency(meta.roasValor) });
    if (metricsConfig.showMetaCurtidasPagina) additionalMetrics.push({ label: "Curtidas Página", value: formatNumber(meta.curtidasPagina) });
    if (metricsConfig.showMetaSeguidores) additionalMetrics.push({ label: "Seguidores", value: formatNumber(meta.seguidores) });
    if (metricsConfig.showMetaCompartilhamentos) additionalMetrics.push({ label: "Compartilhamentos", value: formatNumber(meta.compartilhamentos) });
    if (metricsConfig.showMetaSalvos) additionalMetrics.push({ label: "Salvos", value: formatNumber(meta.salvos) });
    if (metricsConfig.showMetaComentarios) additionalMetrics.push({ label: "Comentários", value: formatNumber(meta.comentarios) });
    if (metricsConfig.showMetaVisualizacoesVideo) additionalMetrics.push({ label: "Views Vídeo", value: formatNumber(meta.visualizacoesVideo) });
    if (metricsConfig.showMetaRetencaoVideo) additionalMetrics.push({ label: "Retenção Vídeo", value: `${toSafeNumber(meta.retencaoVideo).toFixed(2)}%` });
    if (metricsConfig.showMetaMensagensIniciadas) additionalMetrics.push({ label: "Mensagens", value: formatNumber(meta.mensagensIniciadas) });
    if (metricsConfig.showMetaAgendamentos) additionalMetrics.push({ label: "Agendamentos", value: formatNumber(meta.agendamentos) });
    if (metricsConfig.showMetaCheckins) additionalMetrics.push({ label: "Check-ins", value: formatNumber(meta.checkins) });
    if (metricsConfig.showMetaCompras) additionalMetrics.push({ label: "Compras", value: formatNumber(meta.compras) });
    if (metricsConfig.showMetaVisitasProduto) additionalMetrics.push({ label: "Visitas Produto", value: formatNumber(meta.visitasProduto) });
    if (metricsConfig.showMetaAdicoesCarrinho) additionalMetrics.push({ label: "Add Carrinho", value: formatNumber(meta.adicoesCarrinho) });
    if (metricsConfig.showMetaVendas) additionalMetrics.push({ label: "Vendas", value: formatNumber(meta.vendas) });
    if (metricsConfig.showMetaCustoPorVisita) additionalMetrics.push({ label: "Custo/Visita", value: formatCurrency(meta.custoPorVisita) });
    if (metricsConfig.showMetaCustoPorAdicaoCarrinho) additionalMetrics.push({ label: "Custo/Add Carrinho", value: formatCurrency(meta.custoPorAdicaoCarrinho) });
    if (metricsConfig.showMetaCustoPorVenda) additionalMetrics.push({ label: "Custo/Venda", value: formatCurrency(meta.custoPorVenda) });

    return (
        <div className="mb-6 sm:mb-8 p-4 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-black/60 to-black/30 border border-[#ffb500]/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb500]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="flex items-center mb-6 sm:mb-8 relative">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#ffb500]/20 to-transparent rounded-xl sm:rounded-2xl border border-[#ffb500]/20 shadow-[0_0_15px_rgba(255,181,0,0.1)]">
                        <MetaLogo className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-[0.15em] sm:tracking-[0.2em] uppercase">Meta Ads</h3>
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
