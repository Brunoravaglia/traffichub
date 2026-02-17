import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const nichos = [
    { id: "ecommerce", label: "E-commerce", cplRange: [8, 25], taxaConversao: 0.03 },
    { id: "imobiliario", label: "Imobiliário", cplRange: [15, 60], taxaConversao: 0.015 },
    { id: "saude", label: "Saúde / Estética", cplRange: [10, 35], taxaConversao: 0.04 },
    { id: "educacao", label: "Educação / Cursos", cplRange: [5, 20], taxaConversao: 0.025 },
    { id: "servicos", label: "Serviços Locais", cplRange: [8, 30], taxaConversao: 0.035 },
    { id: "saas", label: "SaaS / Tecnologia", cplRange: [20, 80], taxaConversao: 0.02 },
    { id: "alimentacao", label: "Alimentação", cplRange: [3, 12], taxaConversao: 0.05 },
    { id: "fitness", label: "Fitness / Academia", cplRange: [6, 18], taxaConversao: 0.04 },
];

const SimuladorMetaPage = () => {
    const [nicho, setNicho] = useState("ecommerce");
    const [orcamentoDiario, setOrcamentoDiario] = useState("");
    const [ticketMedio, setTicketMedio] = useState("");
    const [diasCampanha, setDiasCampanha] = useState("30");

    const orcamento = parseFloat(orcamentoDiario) || 0;
    const ticket = parseFloat(ticketMedio) || 0;
    const dias = parseInt(diasCampanha) || 30;
    const nichoData = nichos.find((n) => n.id === nicho) || nichos[0];

    const investimentoTotal = orcamento * dias;
    const cplMedio = (nichoData.cplRange[0] + nichoData.cplRange[1]) / 2;
    const leadsEstimados = Math.round(investimentoTotal / cplMedio);
    const vendasEstimadas = Math.round(leadsEstimados * nichoData.taxaConversao);
    const receitaEstimada = vendasEstimadas * ticket;
    const roasEstimado = investimentoTotal > 0 ? receitaEstimada / investimentoTotal : 0;

    const hasResult = orcamento > 0 && ticket > 0;

    const getRoasColor = () => {
        if (roasEstimado >= 5) return "text-green-400";
        if (roasEstimado >= 3) return "text-emerald-400";
        if (roasEstimado >= 2) return "text-yellow-400";
        if (roasEstimado >= 1) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <CalculatorLayout
            title="Simulador de Meta Ads"
            subtitle="Orçamento > Leads > Vendas"
            description="Simule os resultados da sua campanha de Meta Ads com base no seu nicho, orçamento e ticket médio. Projeções baseadas em benchmarks reais do mercado."
            seoTitle="Simulador de Meta Ads Grátis - Projete Leads e Vendas | Vurp"
            seoDescription="Simule resultados de campanhas Meta Ads (Facebook e Instagram). Estime leads, vendas e ROAS com base no seu nicho e orçamento. Ferramenta gratuita."
            path="/utilidades/simulador-meta"
            interpretation={
                <div className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                        Os valores são estimativas baseadas em benchmarks médios do mercado brasileiro para o nicho selecionado.
                        Resultados reais podem variar de acordo com criativo, público, oferta e sazonalidade.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                            <p className="font-medium text-foreground mb-1">CPL do nicho: {nichoData.label}</p>
                            <p className="text-muted-foreground">
                                {formatCurrency(nichoData.cplRange[0])} - {formatCurrency(nichoData.cplRange[1])}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                            <p className="font-medium text-foreground mb-1">Taxa de conversão média</p>
                            <p className="text-muted-foreground">{(nichoData.taxaConversao * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                {/* Nicho Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Nicho do Cliente</label>
                    <div className="flex flex-wrap gap-2">
                        {nichos.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => setNicho(n.id)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${nicho === n.id
                                        ? "bg-primary/10 text-primary border border-primary/30"
                                        : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
                                    }`}
                            >
                                {n.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <CalcInput label="Orçamento Diário (R$)" placeholder="Ex: 100" value={orcamentoDiario} onChange={setOrcamentoDiario} />
                    <CalcInput label="Ticket Médio (R$)" placeholder="Ex: 500" value={ticketMedio} onChange={setTicketMedio} />
                    <CalcInput label="Dias de Campanha" placeholder="30" value={diasCampanha} onChange={setDiasCampanha} />
                </div>

                {hasResult && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-background/80 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Investimento</p>
                            <p className="text-2xl font-extrabold text-foreground">{formatCurrency(investimentoTotal)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{dias} dias x {formatCurrency(orcamento)}/dia</p>
                        </div>

                        <CalcResult items={[
                            { label: "Leads Estimados", value: leadsEstimados.toLocaleString("pt-BR") },
                            { label: "CPL Médio", value: formatCurrency(cplMedio) },
                            { label: "Vendas Estimadas", value: vendasEstimadas.toLocaleString("pt-BR") },
                        ]} />

                        <CalcResult items={[
                            { label: "Receita Estimada", value: formatCurrency(receitaEstimada), color: "text-green-400" },
                            { label: "ROAS Projetado", value: `${roasEstimado.toFixed(2)}x`, color: getRoasColor() },
                            { label: "Lucro Bruto", value: formatCurrency(receitaEstimada - investimentoTotal), color: receitaEstimada - investimentoTotal >= 0 ? "text-green-400" : "text-red-400" },
                        ]} />
                    </div>
                )}
            </div>
        </CalculatorLayout>
    );
};

export default SimuladorMetaPage;
