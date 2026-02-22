import { formatCurrency, formatNumber } from "@/lib/utils";
import { MetaLogo } from "@/components/BrandLogos";

interface MetaAdsMetricsViewProps {
    meta: any;
    metricsConfig: any;
}

export const MetaAdsMetricsView = ({ meta, metricsConfig }: MetaAdsMetricsViewProps) => {
    const additionalMetrics = [];
    if (metricsConfig.showMetaCustoLead) additionalMetrics.push({ label: "Custo por Lead", value: formatCurrency(meta.custoPorLead), color: "text-green-400" });
    if (metricsConfig.showMetaCpm) additionalMetrics.push({ label: "CPM", value: formatCurrency(meta.cpm), color: "text-yellow-400" });
    if (metricsConfig.showMetaCustoPorSeguidor) additionalMetrics.push({ label: "Custo/Seguidor", value: formatCurrency(meta.custoPorSeguidor), color: "text-pink-400" });
    if (metricsConfig.showMetaCliques) additionalMetrics.push({ label: "Cliques Link", value: formatNumber(meta.cliques), color: "text-blue-400" });
    if (metricsConfig.showMetaCtr) additionalMetrics.push({ label: "CTR (%)", value: `${meta.ctr.toFixed(2)}%`, color: "text-cyan-400" });
    if (metricsConfig.showMetaCpc) additionalMetrics.push({ label: "CPC", value: formatCurrency(meta.cpc), color: "text-orange-400" });
    if (metricsConfig.showMetaAlcance) additionalMetrics.push({ label: "Alcance", value: formatNumber(meta.alcance), color: "text-indigo-400" });
    if (metricsConfig.showMetaFrequencia) additionalMetrics.push({ label: "Frequência", value: meta.frequencia.toFixed(2), color: "text-violet-400" });
    if (metricsConfig.showMetaLeads) additionalMetrics.push({ label: "Leads", value: formatNumber(meta.leads), color: "text-emerald-400" });
    if (metricsConfig.showMetaConversoes) additionalMetrics.push({ label: "Conversões", value: formatNumber(meta.conversoes), color: "text-teal-400" });
    if (metricsConfig.showMetaRoas) additionalMetrics.push({ label: "ROAS", value: `${meta.roas.toFixed(2)}x`, color: "text-rose-400" });
    if (metricsConfig.showMetaRoasValor) additionalMetrics.push({ label: "ROAS (R$)", value: formatCurrency(meta.roasValor), color: "text-fuchsia-400" });
    if (metricsConfig.showMetaCurtidasPagina) additionalMetrics.push({ label: "Curtidas Página", value: formatNumber(meta.curtidasPagina), color: "text-red-400" });
    if (metricsConfig.showMetaSeguidores) additionalMetrics.push({ label: "Seguidores", value: formatNumber(meta.seguidores), color: "text-fuchsia-400" });
    if (metricsConfig.showMetaCompartilhamentos) additionalMetrics.push({ label: "Compartilhamentos", value: formatNumber(meta.compartilhamentos), color: "text-sky-400" });
    if (metricsConfig.showMetaSalvos) additionalMetrics.push({ label: "Salvos", value: formatNumber(meta.salvos), color: "text-amber-400" });
    if (metricsConfig.showMetaComentarios) additionalMetrics.push({ label: "Comentários", value: formatNumber(meta.comentarios), color: "text-lime-400" });
    if (metricsConfig.showMetaVisualizacoesVideo) additionalMetrics.push({ label: "Views Vídeo", value: formatNumber(meta.visualizacoesVideo), color: "text-cyan-400" });
    if (metricsConfig.showMetaRetencaoVideo) additionalMetrics.push({ label: "Retenção Vídeo", value: `${meta.retencaoVideo.toFixed(2)}%`, color: "text-teal-400" });
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
        <div className="mb-8 p-10 rounded-[2.5rem] bg-gradient-to-br from-black/60 to-black/30 border border-[#ffb500]/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb500]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="flex items-center justify-between mb-10 relative">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#ffb500]/20 to-transparent rounded-2xl border border-[#ffb500]/20 shadow-[0_0_15px_rgba(255,181,0,0.1)]">
                        <MetaLogo className="w-7 h-7 text-[#ffb500]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-[0.2em] uppercase">Meta Ads</h3>
                        <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">Social Intelligence</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-[#ffb500]/10 border border-[#ffb500]/20">
                    <span className="text-[10px] font-black text-[#ffb500] tracking-widest uppercase">Certified Metrics</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 relative">
                {[
                    { label: "Impressões", value: formatNumber(meta.impressoes), icon: "👁️" },
                    { label: "Engajamento", value: formatNumber(meta.engajamento), icon: "🔄" },
                    { label: "Conversas", value: formatNumber(meta.conversas), icon: "💬" },
                    { label: "Investido", value: formatCurrency(meta.investido), icon: "💰" }
                ].map((m) => (
                    <div key={m.label} className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-[#ffb500]/30 transition-all duration-500 group/item">
                        <p className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-[#ffb500] transition-colors">{m.value}</p>
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
                        <div key={metric.label} className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] transition-all duration-300">
                            <p className="text-lg font-bold text-[#ffb500] mb-1 tracking-tight">{metric.value}</p>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em]">{metric.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
