import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { PlatformSelector, CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const ROICalcPage = () => {
    const [platform, setPlatform] = useState("meta");
    const [custo, setCusto] = useState("");
    const [receita, setReceita] = useState("");

    const c = parseFloat(custo) || 0;
    const r = parseFloat(receita) || 0;
    const roi = c > 0 ? ((r - c) / c) * 100 : 0;
    const hasResult = c > 0 && r > 0;

    const getColor = () => {
        if (roi >= 200) return "text-green-400";
        if (roi >= 100) return "text-emerald-400";
        if (roi >= 50) return "text-yellow-400";
        if (roi >= 0) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <CalculatorLayout
            title="Calculadora de ROI"
            subtitle="Return on Investment"
            description="Calcule o retorno sobre o investimento total das suas campanhas. Diferente do ROAS, o ROI considera todos os custos (ferramentas, equipe, produção)."
            seoTitle="Calculadora de ROI Online Grátis - Marketing Digital | Vurp"
            seoDescription="Calcule o ROI (Return on Investment) das suas campanhas de marketing digital. Ferramenta gratuita para gestores de tráfego pago."
            path="/utilidades/roi"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-green-400 font-medium">200%+</span> - Retorno excelente</p>
                    <p><span className="text-emerald-400 font-medium">100% - 200%</span> - Muito bom</p>
                    <p><span className="text-yellow-400 font-medium">50% - 100%</span> - Bom</p>
                    <p><span className="text-orange-400 font-medium">0% - 50%</span> - Marginal</p>
                    <p><span className="text-red-400 font-medium">Negativo</span> - Prejuízo</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <PlatformSelector value={platform} onChange={setPlatform} />
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <CalcInput label="Custo Total (R$)" placeholder="Ex: 10000" value={custo} onChange={setCusto} hint="Investimento + fees + ferramentas + mão de obra" />
                    <CalcInput label="Receita Gerada (R$)" placeholder="Ex: 35000" value={receita} onChange={setReceita} />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "ROI", value: `${roi.toFixed(1)}%`, color: getColor() },
                        { label: "Retorno Líquido", value: formatCurrency(r - c) },
                        { label: "Para cada R$1", value: `R$ ${(r / c).toFixed(2)}` },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default ROICalcPage;
