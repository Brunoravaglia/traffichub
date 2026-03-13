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

export const MetaAdsMetricsView = ({ meta, metricsConfig }: MetaAdsMetricsViewProps) => {
    const additionalMetrics = [];
    const primaryMetrics = [
        { label: "Impressões", value: formatNumber(meta.impressoes), icon: "👁️", visible: true },
        { label: "Engajamento", value: formatNumber(meta.engajamento), icon: "🔄", visible: !!metricsConfig.showMetaEngajamento },
        { label: "Conversas", value: formatNumber(meta.conversas), icon: "💬", visible: !!metricsConfig.showMetaConversas },
        { label: "Investido", value: formatCurrency(meta.investido), icon: "💰", visible: true },
    ].filter((metric) => metric.visible);
    const showMetaCpl = metricsConfig.showMetaCustoPorLead ?? metricsConfig.showMetaCustoLead;
    if (showMetaCpl) additionalMetrics.push({ label: "Custo por Lead", value: formatCurrency(meta.custoPorLead), color: "text-green-400" });
    if (metricsConfig.showMetaCpm) additionalMetrics.push({ label: "CPM", value: formatCurrency(meta.cpm), color: "text-yellow-400" });
    if (metricsConfig.showMetaCustoPorSeguidor) additionalMetrics.push({ label: "Custo/Seguidor", value: formatCurrency(meta.custoPorSeguidor), color: "text-pink-400" });
    if (metricsConfig.showMetaCliques) additionalMetrics.push({ label: "Cliques Link", value: formatNumber(meta.cliques), color: "text-blue-400" });
    if (metricsConfig.showMetaCtr) additionalMetrics.push({ label: "CTR (%)", value: `${toSafeNumber(meta.ctr).toFixed(2)}%`, color: "text-cyan-400" });
    if (metricsConfig.showMetaCpc) additionalMetrics.push({ label: "CPC", value: formatCurrency(meta.cpc), color: "text-orange-400" });
    if (metricsConfig.showMetaAlcance) additionalMetrics.push({ label: "Alcance", value: formatNumber(meta.alcance), color: "text-indigo-400" });
    if (metricsConfig.showMetaFrequencia) additionalMetrics.push({ label: "Frequência", value: toSafeNumber(meta.frequencia).toFixed(2), color: "text-violet-400" });
    if (metricsConfig.showMetaLeads) additionalMetrics.push({ label: "Leads", value: formatNumber(meta.leads), color: "text-emerald-400" });
    if (metricsConfig.showMetaConversoes) additionalMetrics.push({ label: "Conversões", value: formatNumber(meta.conversoes), color: "text-teal-400" });
    if (metricsConfig.showMetaRoas) additionalMetrics.push({ label: "ROAS", value: `${toSafeNumber(meta.roas).toFixed(2)}x`, color: "text-rose-400" });
    if (metricsConfig.showMetaRoasValor) additionalMetrics.push({ label: "ROAS (R$)", value: formatCurrency(meta.roasValor), color: "text-fuchsia-400" });
    if (metricsConfig.showMetaCurtidasPagina) additionalMetrics.push({ label: "Curtidas Página", value: formatNumber(meta.curtidasPagina), color: "text-red-400" });
    if (metricsConfig.showMetaSeguidores) additionalMetrics.push({ label: "Seguidores", value: formatNumber(meta.seguidores), color: "text-fuchsia-400" });
    if (metricsConfig.showMetaCompartilhamentos) additionalMetrics.push({ label: "Compartilhamentos", value: formatNumber(meta.compartilhamentos), color: "text-sky-400" });
    if (metricsConfig.showMetaSalvos) additionalMetrics.push({ label: "Salvos", value: formatNumber(meta.salvos), color: "text-amber-400" });
    if (metricsConfig.showMetaComentarios) additionalMetrics.push({ label: "Comentários", value: formatNumber(meta.comentarios), color: "text-lime-400" });
    if (metricsConfig.showMetaVisualizacoesVideo) additionalMetrics.push({ label: "Views Vídeo", value: formatNumber(meta.visualizacoesVideo), color: "text-cyan-400" });
    if (metricsConfig.showMetaRetencaoVideo) additionalMetrics.push({ label: "Retenção Vídeo", value: `${toSafeNumber(meta.retencaoVideo).toFixed(2)}%`, color: "text-teal-400" });
    if (metricsConfig.showMetaMensagensIniciadas) additionalMetrics.push({ label: "Mensagens", value: formatNumber(meta.mensagensIniciadas), color: "text-blue-400" });
    if (metricsConfig.showMetaAgendamentos) additionalMetrics.push({ label: "Agendamentos", value: formatNumber(meta.agendamentos), color: "text-green-400" });
    if (metricsConfig.showMetaCheckins) additionalMetrics.push({ label: "Check-ins", value: formatNumber(meta.checkins), color: "text-orange-400" });
    if (metricsConfig.showMetaCompras) additionalMetrics.push({ label: "Compras", value: formatNumber(meta.compras), color: "text-emerald-400" });
    if (metricsConfig.showMetaVisitasProduto) additionalMetrics.push({ label: "Visitas Produto", value: formatNumber(meta.visitasProduto), color: "text-sky-400" });
    if (metricsConfig.showMetaAdicoesCarrinho) additionalMetrics.push({ label: "Add Carrinho", value: formatNumber(meta.adicoesCarrinho), color: "text-orange-400" });
    if (metricsConfig.showMetaVendas) additionalMetrics.push({ label: "Vendas", value: formatNumber(meta.vendas), color: "text-green-400" });
    if (metricsConfig.showMetaCustoPorVisita) additionalMetrics.push({ label: "Custo/Visita", value: formatCurrency(meta.custoPorVisita), color: "text-cyan-400" });
    if (metricsConfig.showMetaCustoPorAdicaoCarrinho) additionalMetrics.push({ label: "Custo/Add Carrinho", value: formatCurrency(meta.custoPorAdicaoCarrinho), color: "text-yellow-400" });
    if (metricsConfig.showMetaCustoPorVenda) additionalMetrics.push({ label: "Custo/Venda", value: formatCurrency(meta.custoPorVenda), color: "text-red-400" });

    return (
        <div className="mb-8 p-5 sm:p-10 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-black/60 to-black/30 border border-[#ffb500]/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb500]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="flex items-center mb-8 relative">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#ffb500]/20 to-transparent rounded-2xl border border-[#ffb500]/20 shadow-[0_0_15px_rgba(255,181,0,0.1)]">
                        <MetaLogo className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-[0.2em] uppercase">Meta Ads</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 relative">
                {primaryMetrics.map((m) => (
                    <div key={m.label} className="min-w-0 min-h-[144px] p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-[#ffb500]/30 transition-all duration-500 group/item">
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
                    {additionalMetrics.map((metric) => (
                        <div key={metric.label} className="min-w-0 min-h-[108px] p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] transition-all duration-300">
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
