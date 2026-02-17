import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { CalcInput, CalcResult, formatCurrency } from "@/components/calculators/CalcShared";

const LTVCalcPage = () => {
    const [ticketMedio, setTicketMedio] = useState("");
    const [comprasMes, setComprasMes] = useState("");
    const [mesesRetencao, setMesesRetencao] = useState("");

    const ticket = parseFloat(ticketMedio) || 0;
    const compras = parseFloat(comprasMes) || 0;
    const meses = parseFloat(mesesRetencao) || 0;
    const ltv = ticket * compras * meses;
    const hasResult = ticket > 0 && compras > 0 && meses > 0;

    return (
        <CalculatorLayout
            title="Calculadora de LTV"
            subtitle="Lifetime Value (Valor Vitalício do Cliente)"
            description="Calcule quanto um cliente gera de receita durante todo o relacionamento. O LTV é crucial para definir orçamentos de aquisição sustentáveis."
            seoTitle="Calculadora de LTV Online Grátis - Lifetime Value do Cliente | Vurp"
            seoDescription="Calcule o LTV (Lifetime Value) dos seus clientes. Ferramenta gratuita para marketing digital e gestão de negócios."
            path="/utilidades/ltv"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="text-foreground/70"><strong>LTV &gt; 3x CAC</strong> - Negócio saudável e escalável</p>
                    <p className="text-foreground/70"><strong>LTV = 1-3x CAC</strong> - Sustentável, mas com espaço para melhorar</p>
                    <p className="text-foreground/70"><strong>LTV &lt; CAC</strong> - Insustentável, o negócio perde dinheiro por cliente</p>
                    <p className="mt-3"><strong>Como aumentar o LTV:</strong></p>
                    <p>• Aumentar o ticket médio (upsell, cross-sell)</p>
                    <p>• Aumentar a frequência de compra (recorrência)</p>
                    <p>• Aumentar o tempo de retenção (experiência, fidelização)</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <CalcInput label="Ticket Médio (R$)" placeholder="Ex: 150" value={ticketMedio} onChange={setTicketMedio} hint="Valor médio por compra" />
                    <CalcInput label="Compras por Mês" placeholder="Ex: 2" value={comprasMes} onChange={setComprasMes} hint="Frequência mensal de compra" />
                    <CalcInput label="Meses de Retenção" placeholder="Ex: 12" value={mesesRetencao} onChange={setMesesRetencao} hint="Tempo médio como cliente" />
                </div>
                {hasResult && (
                    <CalcResult items={[
                        { label: "LTV", value: formatCurrency(ltv), color: "text-green-400" },
                        { label: "Receita Mensal / Cliente", value: formatCurrency(ticket * compras) },
                        { label: "CAC Máximo Sugerido", value: formatCurrency(ltv / 3), color: "text-yellow-400" },
                    ]} />
                )}
            </div>
        </CalculatorLayout>
    );
};

export default LTVCalcPage;
