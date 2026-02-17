import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { PlatformSelector, CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const CPMCalcPage = () => {
    const [platform, setPlatform] = useState("meta");
    const [custo, setCusto] = useState("");
    const [impressoes, setImpressoes] = useState("");

    const c = parseFloat(custo) || 0;
    const imp = parseFloat(impressoes) || 0;
    const cpm = imp > 0 ? (c / imp) * 1000 : 0;
    const hasResult = c > 0 && imp > 0;

    const getColor = () => {
        if (cpm <= 5) return "text-green-400";
        if (cpm <= 15) return "text-emerald-400";
        if (cpm <= 30) return "text-yellow-400";
        if (cpm <= 50) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <CalculatorLayout
            title="Calculadora de CPM"
            subtitle="Cost Per Mille (Custo por Mil Impressões)"
            description="Calcule quanto custa para exibir seus anúncios 1.000 vezes. O CPM é a métrica base para campanhas de alcance e reconhecimento de marca."
            seoTitle="Calculadora de CPM Online Grátis - Custo por Mil Impressões | Vurp"
            seoDescription="Calcule o CPM (Custo por Mil Impressões) das suas campanhas. Ferramenta gratuita para Meta Ads, Google Ads, TikTok Ads e LinkedIn Ads."
            path="/utilidades/cpm"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-green-400 font-medium">R$0 - R$5</span> - Excelente, custo muito baixo por mil impressões</p>
                    <p><span className="text-emerald-400 font-medium">R$5 - R$15</span> - Bom, dentro da média para a maioria dos nichos</p>
                    <p><span className="text-yellow-400 font-medium">R$15 - R$30</span> - Aceitável, comum em nichos competitivos</p>
                    <p><span className="text-orange-400 font-medium">R$30 - R$50</span> - Alto, considere otimizar segmentação</p>
                    <p><span className="text-red-400 font-medium">R$50+</span> - Muito alto, revise público e posicionamento</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <PlatformSelector value={platform} onChange={setPlatform} />
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <CalcInput label="Custo Total (R$)" placeholder="Ex: 500" value={custo} onChange={setCusto} />
                    <CalcInput label="Impressões" placeholder="Ex: 100000" value={impressoes} onChange={setImpressoes} />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "CPM", value: formatCurrency(cpm), color: getColor() },
                        { label: "Custo por Impressão", value: `R$ ${(c / imp).toFixed(4)}` },
                        { label: "Impressões / R$1", value: Math.round(imp / c).toLocaleString("pt-BR") },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default CPMCalcPage;
