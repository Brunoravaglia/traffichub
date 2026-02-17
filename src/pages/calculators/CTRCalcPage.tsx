import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { PlatformSelector, CalcInput, CalcResult } from "@/components/calculators/CalcShared";

const CTRCalcPage = () => {
    const [platform, setPlatform] = useState("meta");
    const [cliques, setCliques] = useState("");
    const [impressoes, setImpressoes] = useState("");

    const cl = parseFloat(cliques) || 0;
    const imp = parseFloat(impressoes) || 0;
    const ctr = imp > 0 ? (cl / imp) * 100 : 0;
    const hasResult = cl > 0 && imp > 0;

    const getColor = () => {
        if (ctr >= 5) return "text-green-400";
        if (ctr >= 3) return "text-emerald-400";
        if (ctr >= 1.5) return "text-yellow-400";
        if (ctr >= 0.5) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <CalculatorLayout
            title="Calculadora de CTR"
            subtitle="Click-Through Rate (Taxa de Clique)"
            description="Calcule a taxa de cliques dos seus anúncios. O CTR indica a relevância e atratividade dos seus criativos para o público alvo."
            seoTitle="Calculadora de CTR Online Grátis - Taxa de Clique | Vurp"
            seoDescription="Calcule o CTR (Click-Through Rate) das suas campanhas. Ferramenta gratuita para Meta Ads, Google Ads, TikTok Ads e LinkedIn Ads."
            path="/utilidades/ctr"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-green-400 font-medium">5%+</span> - Excelente, anúncio muito relevante</p>
                    <p><span className="text-emerald-400 font-medium">3% - 5%</span> - Muito bom, acima da média</p>
                    <p><span className="text-yellow-400 font-medium">1,5% - 3%</span> - Bom, dentro do esperado</p>
                    <p><span className="text-orange-400 font-medium">0,5% - 1,5%</span> - Abaixo da média, melhore criativos</p>
                    <p><span className="text-red-400 font-medium">&lt;0,5%</span> - Baixo, revise copy e segmentação</p>
                    <p className="mt-3 text-foreground/70"><strong>Dica:</strong> No Google Search Ads, CTR médio é 3-5%. Em Meta/Display, 0,9-1,5% é normal.</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <PlatformSelector value={platform} onChange={setPlatform} />
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <CalcInput label="Total de Cliques" placeholder="Ex: 450" value={cliques} onChange={setCliques} />
                    <CalcInput label="Total de Impressões" placeholder="Ex: 15000" value={impressoes} onChange={setImpressoes} />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "CTR", value: `${ctr.toFixed(2)}%`, color: getColor() },
                        { label: "Cliques / 1000 Impressões", value: Math.round(ctr * 10).toString() },
                        { label: "Avaliação", value: ctr >= 3 ? "Acima da média ✅" : ctr >= 1 ? "Na média 👍" : "Abaixo ⚠️" },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default CTRCalcPage;
