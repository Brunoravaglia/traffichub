import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { PlatformSelector, CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const CPLCalcPage = () => {
    const [platform, setPlatform] = useState("meta");
    const [custo, setCusto] = useState("");
    const [leads, setLeads] = useState("");

    const c = parseFloat(custo) || 0;
    const l = parseFloat(leads) || 0;
    const cpl = l > 0 ? c / l : 0;
    const hasResult = c > 0 && l > 0;

    const getColor = () => {
        if (cpl <= 5) return "text-green-400";
        if (cpl <= 15) return "text-emerald-400";
        if (cpl <= 30) return "text-yellow-400";
        if (cpl <= 60) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <CalculatorLayout
            title="Calculadora de CPL"
            subtitle="Cost Per Lead (Custo por Lead)"
            description="Calcule quanto custa gerar cada lead. Essencial para campanhas de geração de leads e funis de vendas."
            seoTitle="Calculadora de CPL Online Grátis - Custo por Lead | Vurp"
            seoDescription="Calcule o CPL (Custo por Lead) das suas campanhas de marketing digital. Ferramenta gratuita para gestores de tráfego pago."
            path="/utilidades/cpl"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-green-400 font-medium">Até R$5</span> - Excelente, lead barato</p>
                    <p><span className="text-emerald-400 font-medium">R$5 - R$15</span> - Bom para maioria dos nichos</p>
                    <p><span className="text-yellow-400 font-medium">R$15 - R$30</span> - Aceitável para nichos B2B</p>
                    <p><span className="text-orange-400 font-medium">R$30 - R$60</span> - Alto, ok apenas para serviços premium</p>
                    <p><span className="text-red-400 font-medium">R$60+</span> - Muito alto, otimize landing page e formulário</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <PlatformSelector value={platform} onChange={setPlatform} />
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <CalcInput label="Custo Total da Campanha (R$)" placeholder="Ex: 2000" value={custo} onChange={setCusto} />
                    <CalcInput label="Número de Leads Gerados" placeholder="Ex: 180" value={leads} onChange={setLeads} />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "CPL", value: formatCurrency(cpl), color: getColor() },
                        { label: "Leads por R$1k", value: Math.round(1000 / cpl).toLocaleString("pt-BR") },
                        { label: "Investimento Total", value: formatCurrency(c) },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default CPLCalcPage;
