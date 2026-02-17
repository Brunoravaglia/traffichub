import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const CACCalcPage = () => {
    const [custoMkt, setCustoMkt] = useState("");
    const [custoVendas, setCustoVendas] = useState("");
    const [novosClientes, setNovosClientes] = useState("");

    const mkt = parseFloat(custoMkt) || 0;
    const vendas = parseFloat(custoVendas) || 0;
    const clientes = parseFloat(novosClientes) || 0;
    const cac = clientes > 0 ? (mkt + vendas) / clientes : 0;
    const hasResult = (mkt > 0 || vendas > 0) && clientes > 0;

    const getColor = () => {
        if (cac <= 50) return "text-green-400";
        if (cac <= 150) return "text-emerald-400";
        if (cac <= 300) return "text-yellow-400";
        if (cac <= 500) return "text-orange-400";
        return "text-red-400";
    };

    return (
        <CalculatorLayout
            title="Calculadora de CAC"
            subtitle="Customer Acquisition Cost (Custo de Aquisição de Cliente)"
            description="Calcule o custo total para adquirir um novo cliente, incluindo marketing e vendas. Fundamental para avaliar a sustentabilidade do negócio."
            seoTitle="Calculadora de CAC Online Grátis - Custo de Aquisição de Cliente | Vurp"
            seoDescription="Calcule o CAC (Customer Acquisition Cost) do seu negócio. Inclui custos de marketing e vendas. Ferramenta gratuita."
            path="/utilidades/cac"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="text-foreground/70"><strong>Regra de ouro:</strong> LTV / CAC deve ser ≥ 3</p>
                    <p><span className="text-green-400 font-medium">CAC baixo</span> - Aquisição eficiente, escale os canais</p>
                    <p><span className="text-yellow-400 font-medium">CAC médio</span> - Monitore e otimize o funil</p>
                    <p><span className="text-red-400 font-medium">CAC alto</span> - Revise canais, funil e proposta de valor</p>
                    <p className="mt-3"><strong>Diferença entre CPA e CAC:</strong></p>
                    <p>• CPA = custo de uma conversão específica (lead, venda)</p>
                    <p>• CAC = custo total de aquisição (inclui time, ferramentas, salários)</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <CalcInput label="Custos de Marketing (R$)" placeholder="Ex: 8000" value={custoMkt} onChange={setCustoMkt} hint="Anúncios + ferramentas + equipe mkt" />
                    <CalcInput label="Custos de Vendas (R$)" placeholder="Ex: 4000" value={custoVendas} onChange={setCustoVendas} hint="SDRs + comissões + CRM" />
                    <CalcInput label="Novos Clientes" placeholder="Ex: 25" value={novosClientes} onChange={setNovosClientes} hint="Clientes adquiridos no período" />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "CAC", value: formatCurrency(cac), color: getColor() },
                        { label: "Custo Total", value: formatCurrency(mkt + vendas) },
                        { label: "LTV Mínimo p/ Lucro", value: formatCurrency(cac * 3), color: "text-yellow-400" },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default CACCalcPage;
