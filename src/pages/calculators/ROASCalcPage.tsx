import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { PlatformSelector, CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const ROASCalcPage = () => {
    const [platform, setPlatform] = useState("meta");
    const [investimento, setInvestimento] = useState("");
    const [receita, setReceita] = useState("");

    const inv = parseFloat(investimento) || 0;
    const rec = parseFloat(receita) || 0;
    const roas = inv > 0 ? rec / inv : 0;
    const hasResult = inv > 0 && rec > 0;

    const getColor = () => {
        if (roas >= 5) return "text-green-400";
        if (roas >= 3) return "text-emerald-400";
        if (roas >= 2) return "text-yellow-400";
        if (roas >= 1) return "text-orange-400";
        return "text-red-400";
    };

    const getLabel = () => {
        if (roas >= 5) return "Excelente! 🚀";
        if (roas >= 3) return "Muito bom! ✅";
        if (roas >= 2) return "Bom 👍";
        if (roas >= 1) return "Break-even ⚠️";
        return "Negativo ❌";
    };

    return (
        <CalculatorLayout
            title="Calculadora de ROAS"
            subtitle="Return on Ad Spend"
            description="Calcule o retorno do seu investimento em anúncios. O ROAS mostra quanto de receita é gerada para cada real investido em publicidade."
            seoTitle="Calculadora de ROAS Online Grátis - Meta, Google, TikTok, LinkedIn | Vurp"
            seoDescription="Calcule o ROAS (Return on Ad Spend) das suas campanhas de tráfego pago. Ferramenta gratuita para Meta Ads, Google Ads, TikTok Ads e LinkedIn Ads."
            path="/utilidades/roas"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-green-400 font-medium">5x+</span> - Excelente performance, escalável</p>
                    <p><span className="text-emerald-400 font-medium">3x - 5x</span> - Muito bom, acima da média do mercado</p>
                    <p><span className="text-yellow-400 font-medium">2x - 3x</span> - Bom, dentro do esperado para maioria dos nichos</p>
                    <p><span className="text-orange-400 font-medium">1x - 2x</span> - Break-even, considere otimizar criativos e públicos</p>
                    <p><span className="text-red-400 font-medium">&lt;1x</span> - Prejuízo, pause e revise a estratégia</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <PlatformSelector value={platform} onChange={setPlatform} />
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <CalcInput label="Investimento em Ads (R$)" placeholder="Ex: 5000" value={investimento} onChange={setInvestimento} />
                    <CalcInput label="Receita Gerada (R$)" placeholder="Ex: 25000" value={receita} onChange={setReceita} />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "ROAS", value: `${roas.toFixed(2)}x`, color: getColor() },
                        { label: "Lucro Bruto", value: formatCurrency(rec - inv) },
                        { label: "Avaliação", value: getLabel() },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default ROASCalcPage;
