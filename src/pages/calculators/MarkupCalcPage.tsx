import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const MarkupCalcPage = () => {
    const [custo, setCusto] = useState("");
    const [markup, setMarkup] = useState("");

    const c = parseFloat(custo) || 0;
    const m = parseFloat(markup) || 0;
    const precoVenda = c * (1 + m / 100);
    const lucro = precoVenda - c;
    const margemLucro = precoVenda > 0 ? (lucro / precoVenda) * 100 : 0;
    const hasResult = c > 0 && m > 0;

    return (
        <CalculatorLayout
            title="Calculadora de Markup"
            subtitle="Markup e Margem de Lucro"
            description="Calcule o preço de venda ideal com base no seu custo e markup desejado. Entenda a diferença entre markup e margem de lucro."
            seoTitle="Calculadora de Markup Online Grátis - Preço de Venda e Margem | Vurp"
            seoDescription="Calcule o markup e a margem de lucro dos seus produtos e serviços. Ferramenta gratuita para gestores e empreendedores digitais."
            path="/utilidades/markup"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="text-foreground/70"><strong>Markup vs Margem:</strong></p>
                    <p>• <strong>Markup</strong> = percentual sobre o custo (base = custo)</p>
                    <p>• <strong>Margem</strong> = percentual sobre o preço de venda (base = receita)</p>
                    <p className="mt-3"><strong>Exemplo:</strong> Custo R$100 + Markup 100% = Venda R$200 = Margem 50%</p>
                    <p className="mt-3"><strong>Markups comuns no digital:</strong></p>
                    <p>• Infoprodutos: 200-500%</p>
                    <p>• SaaS: 300-800%</p>
                    <p>• Serviços (gestão de tráfego): 100-300%</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <CalcInput label="Custo do Produto/Serviço (R$)" placeholder="Ex: 50" value={custo} onChange={setCusto} />
                    <CalcInput label="Markup Desejado (%)" placeholder="Ex: 150" value={markup} onChange={setMarkup} hint="Percentual de acréscimo sobre o custo" />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "Preço de Venda", value: formatCurrency(precoVenda), color: "text-green-400" },
                        { label: "Lucro por Unidade", value: formatCurrency(lucro) },
                        { label: "Margem de Lucro", value: `${margemLucro.toFixed(1)}%`, color: "text-primary" },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default MarkupCalcPage;
