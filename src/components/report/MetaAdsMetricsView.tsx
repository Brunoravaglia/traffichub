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
        <div className="mb-8 p-8 rounded-3xl bg-[#1e293b]/50 border border-purple-500/20 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-500/15 rounded-xl border border-purple-500/30">
                    <MetaLogo className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-purple-400 tracking-[0.2em] uppercase">TRÁFEGO META ADS</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {[
                    { label: "Impressões", value: formatNumber(meta.impressoes) },
                    { label: "Engajamento", value: formatNumber(meta.engajamento) },
                    { label: "Conversas", value: formatNumber(meta.conversas) },
                    { label: "Investidos", value: formatCurrency(meta.investido) }
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
                            <p className={`text-xl font-black ${metric.color} mb-1`}>{metric.value}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{metric.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
