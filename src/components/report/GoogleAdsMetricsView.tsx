import { formatCurrency, formatNumber } from "@/lib/utils";
import { GoogleLogo } from "@/components/BrandLogos";

interface GoogleAdsMetricsViewProps {
    google: any;
    metricsConfig: any;
}

export const GoogleAdsMetricsView = ({ google, metricsConfig }: GoogleAdsMetricsViewProps) => {
    const additionalMetrics = [];
    const showGoogleCpl = metricsConfig.showGoogleCustoPorLead ?? metricsConfig.showGoogleCustoLead;
    if (showGoogleCpl) additionalMetrics.push({ label: "Custo por Lead", value: formatCurrency(google.custoPorLead), color: "text-green-400" });
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
        <div className="mb-8 p-10 rounded-[2.5rem] bg-gradient-to-br from-black/60 to-black/30 border border-[#ffb500]/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb500]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="flex items-center justify-between mb-10 relative">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-[#ffb500]/20 to-transparent rounded-2xl border border-[#ffb500]/20 shadow-[0_0_15px_rgba(255,181,0,0.1)]">
                        <GoogleLogo className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-[0.2em] uppercase">Google Ads</h3>
                        <p className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">Network Performance</p>
                    </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-[#ffb500]/10 border border-[#ffb500]/20">
                    <span className="text-[10px] font-black text-[#ffb500] tracking-widest uppercase">Verified Data</span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 relative">
                {[
                    { label: "Cliques", value: formatNumber(google.cliques), icon: "🖱️" },
                    { label: "Impressões", value: formatNumber(google.impressoes), icon: "👁️" },
                    { label: "Conversões", value: formatNumber(google.contatos), icon: "🎯" },
                    { label: "Investido", value: formatCurrency(google.investido), icon: "💰" }
                ].map((m) => (
                    <div key={m.label} className="min-w-0 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:border-[#ffb500]/30 transition-all duration-500 group/item">
                        <p className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(1.05rem,2.35vw,2.2rem)] leading-tight font-black text-white mb-2 tracking-tight group-hover:text-[#ffb500] transition-colors">{m.value}</p>
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
                        <div key={metric.label} className="min-w-0 p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.04] transition-all duration-300">
                            <p className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(0.95rem,1.45vw,1.15rem)] font-bold text-[#ffb500] mb-1 tracking-tight">{metric.value}</p>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em]">{metric.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
