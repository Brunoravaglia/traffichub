import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { PlatformSelector, CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const CPCCalcPage = () => {
    const [platform, setPlatform] = useState("meta");
    const [custo, setCusto] = useState("");
    const [cliques, setCliques] = useState("");

    const c = parseFloat(custo) || 0;
    const cl = parseFloat(cliques) || 0;
    const cpc = cl > 0 ? c / cl : 0;
    const hasResult = c > 0 && cl > 0;

    const getColor = () => {
        if (cpc <= 0.5) return "text-green-400";
        if (cpc <= 1.5) return "text-emerald-400";
        if (cpc <= 3) return "text-yellow-400";
        if (cpc <= 5) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <CalculatorLayout
            title="Calculadora de CPC"
            subtitle="Cost Per Click (Custo por Clique)"
            description="Calcule quanto você paga por cada clique nos seus anúncios. O CPC é uma das métricas mais importantes para otimizar campanhas de tráfego."
            seoTitle="Calculadora de CPC Online Grátis - Custo por Clique | Vurp"
            seoDescription="Calcule o CPC (Custo por Clique) das suas campanhas. Ferramenta gratuita para Meta Ads, Google Ads, TikTok Ads e LinkedIn Ads."
            path="/utilidades/cpc"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-green-400 font-medium">Até R$0,50</span> - Excelente, custo por clique muito baixo</p>
                    <p><span className="text-emerald-400 font-medium">R$0,50 - R$1,50</span> - Bom, dentro da média</p>
                    <p><span className="text-yellow-400 font-medium">R$1,50 - R$3,00</span> - Aceitável para nichos competitivos</p>
                    <p><span className="text-orange-400 font-medium">R$3,00 - R$5,00</span> - Alto, otimize anúncios e públicos</p>
                    <p><span className="text-red-400 font-medium">R$5,00+</span> - Muito alto, revise a estratégia completa</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <PlatformSelector value={platform} onChange={setPlatform} />
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <CalcInput label="Custo Total da Campanha (R$)" placeholder="Ex: 1500" value={custo} onChange={setCusto} />
                    <CalcInput label="Total de Cliques" placeholder="Ex: 3200" value={cliques} onChange={setCliques} />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "CPC", value: formatCurrency(cpc), color: getColor() },
                        { label: "Cliques por R$100", value: Math.round(100 / cpc).toLocaleString("pt-BR") },
                        { label: "Custo Total", value: formatCurrency(c) },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default CPCCalcPage;
