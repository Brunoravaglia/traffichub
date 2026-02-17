import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { PlatformSelector, CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const CPACalcPage = () => {
    const [platform, setPlatform] = useState("meta");
    const [custo, setCusto] = useState("");
    const [aquisicoes, setAquisicoes] = useState("");

    const c = parseFloat(custo) || 0;
    const a = parseFloat(aquisicoes) || 0;
    const cpa = a > 0 ? c / a : 0;
    const hasResult = c > 0 && a > 0;

    const getColor = () => {
        if (cpa <= 20) return "text-green-400";
        if (cpa <= 50) return "text-emerald-400";
        if (cpa <= 100) return "text-yellow-400";
        if (cpa <= 200) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <CalculatorLayout
            title="Calculadora de CPA"
            subtitle="Cost Per Acquisition (Custo por Aquisição)"
            description="Calcule quanto custa adquirir cada novo cliente. O CPA é fundamental para entender se suas campanhas são sustentáveis."
            seoTitle="Calculadora de CPA Online Grátis - Custo por Aquisição | Vurp"
            seoDescription="Calcule o CPA (Custo por Aquisição) das suas campanhas de marketing digital. Ferramenta gratuita para gestores de tráfego pago."
            path="/utilidades/cpa"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-green-400 font-medium">Até R$20</span> - Excelente, custo de aquisição muito baixo</p>
                    <p><span className="text-emerald-400 font-medium">R$20 - R$50</span> - Bom, dentro do esperado para e-commerce</p>
                    <p><span className="text-yellow-400 font-medium">R$50 - R$100</span> - Aceitável para produtos/serviços de ticket médio</p>
                    <p><span className="text-orange-400 font-medium">R$100 - R$200</span> - Alto, ok apenas para high ticket</p>
                    <p><span className="text-red-400 font-medium">R$200+</span> - Muito alto, revise funil e segmentação</p>
                    <p className="mt-3 text-foreground/70"><strong>Dica:</strong> Compare seu CPA com o ticket médio do produto. O CPA saudável deve ser no máximo 1/3 do ticket médio.</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <PlatformSelector value={platform} onChange={setPlatform} />
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <CalcInput label="Custo Total da Campanha (R$)" placeholder="Ex: 3000" value={custo} onChange={setCusto} />
                    <CalcInput label="Número de Aquisições/Vendas" placeholder="Ex: 45" value={aquisicoes} onChange={setAquisicoes} />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "CPA", value: formatCurrency(cpa), color: getColor() },
                        { label: "Aquisições por R$1k", value: Math.round(1000 / cpa).toString() },
                        { label: "Taxa de Conversão", value: `${((a / (c / 2)) * 100).toFixed(1)}%` },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default CPACalcPage;
