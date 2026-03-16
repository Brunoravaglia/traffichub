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

const getMetricValueSizeClass = (value: string | number, isPrimary: boolean) => {
    const length = String(value).trim().length;

    if (isPrimary) {
        if (length >= 14) return "text-sm sm:text-base";
        if (length >= 11) return "text-base sm:text-lg";
        if (length >= 9) return "text-lg sm:text-xl";
        return "text-xl sm:text-2xl";
    }

    if (length >= 14) return "text-xs sm:text-sm";
    if (length >= 11) return "text-sm sm:text-base";
    if (length >= 9) return "text-sm sm:text-base";
    return "text-base sm:text-lg";
};

export const MetaAdsMetricsView = ({ meta, metricsConfig }: MetaAdsMetricsViewProps) => {
    const additionalMetrics: { label: string; value: string }[] = [];
    const primaryMetrics = [
        { label: "Impressões", value: formatNumber(meta.impressoes), icon: "👁️", visible: true },
        { label: "Engajamento", value: formatNumber(meta.engajamento), icon: "🔄", visible: !!metricsConfig.showMetaEngajamento },
        { label: "Conversas", value: formatNumber(meta.conversas), icon: "💬", visible: !!metricsConfig.showMetaConversas },
        { label: "Investido", value: formatCurrency(meta.investido), icon: "💰", visible: true },
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4 relative">
                {primaryMetrics.map((m) => (
                    <div key={m.label} className="min-w-0 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-[#ffb500]/30 transition-all duration-500 overflow-hidden">
                        <p className={`${getMetricValueSizeClass(m.value, true)} font-black text-white mb-3 sm:mb-4 tracking-tight leading-tight tabular-nums whitespace-nowrap overflow-hidden`} title={String(m.value)}>
                            {m.value}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] sm:text-[10px] opacity-40 flex-shrink-0">{m.icon}</span>
                            <p className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] sm:tracking-[0.15em] leading-tight">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Metrics */}
            {additionalMetrics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 relative">
                    {additionalMetrics.map((metric) => (
                        <div key={metric.label} className="min-w-0 p-3 sm:p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden">
                            <p className={`${getMetricValueSizeClass(metric.value, false)} font-bold text-[#ffb500] mb-2 tracking-tight leading-tight tabular-nums whitespace-nowrap overflow-hidden`} title={String(metric.value)}>
                                {metric.value}
                            </p>
                            <p className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] sm:tracking-[0.12em] leading-tight">{metric.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
