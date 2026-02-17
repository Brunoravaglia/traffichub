import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { CalcInput, formatCurrency } from "@/components/calculators/CalcShared";
import { motion } from "framer-motion";

const SimuladorFunilPage = () => {
    const [visitantes, setVisitantes] = useState("");
    const [taxaLP, setTaxaLP] = useState("");
    const [taxaQualificacao, setTaxaQualificacao] = useState("");
    const [taxaFechamento, setTaxaFechamento] = useState("");
    const [ticketMedio, setTicketMedio] = useState("");

    const vis = parseFloat(visitantes) || 0;
    const tlp = (parseFloat(taxaLP) || 0) / 100;
    const tq = (parseFloat(taxaQualificacao) || 0) / 100;
    const tf = (parseFloat(taxaFechamento) || 0) / 100;
    const ticket = parseFloat(ticketMedio) || 0;

    const leads = Math.round(vis * tlp);
    const qualificados = Math.round(leads * tq);
    const vendas = Math.round(qualificados * tf);
    const faturamento = vendas * ticket;

    const hasResult = vis > 0 && tlp > 0 && tq > 0 && tf > 0 && ticket > 0;

    const stages = [
        { label: "Visitantes", value: vis, color: "from-blue-500 to-blue-600", width: "100%" },
        { label: "Leads", value: leads, color: "from-sky-500 to-sky-600", width: `${vis > 0 ? Math.max((leads / vis) * 100, 15) : 100}%` },
        { label: "Qualificados", value: qualificados, color: "from-amber-500 to-amber-600", width: `${vis > 0 ? Math.max((qualificados / vis) * 100, 10) : 100}%` },
        { label: "Vendas", value: vendas, color: "from-green-500 to-green-600", width: `${vis > 0 ? Math.max((vendas / vis) * 100, 5) : 100}%` },
    ];

    return (
        <CalculatorLayout
            title="Simulador de Funil de Vendas"
            subtitle="Visualize seu pipeline"
            description="Simule cada etapa do funil de vendas e descubra quantas vendas você pode esperar com base nas suas taxas de conversão reais."
            seoTitle="Simulador de Funil de Vendas Online Grátis | Vurp"
            seoDescription="Simule seu funil de vendas completo: visitantes, leads, qualificados e vendas. Calcule faturamento projetado com base nas suas taxas de conversão."
            path="/utilidades/simulador-funil"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-blue-400 font-medium">Landing Page:</span> Taxas entre 15-40% são consideradas boas</p>
                    <p><span className="text-amber-400 font-medium">Qualificação:</span> 30-60% dos leads costumam ser qualificados</p>
                    <p><span className="text-green-400 font-medium">Fechamento:</span> 10-30% de conversão para vendas é saudável</p>
                    <p className="mt-3">Para melhorar cada etapa, otimize: criativo (topo), oferta (meio) e abordagem comercial (fundo).</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <CalcInput label="Visitantes / mês" placeholder="Ex: 5000" value={visitantes} onChange={setVisitantes} />
                    <CalcInput label="Taxa de conversão da LP (%)" placeholder="Ex: 25" value={taxaLP} onChange={setTaxaLP} hint="% de visitantes que viram leads" />
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <CalcInput label="Taxa de qualificação (%)" placeholder="Ex: 50" value={taxaQualificacao} onChange={setTaxaQualificacao} hint="% dos leads que são qualificados" />
                    <CalcInput label="Taxa de fechamento (%)" placeholder="Ex: 20" value={taxaFechamento} onChange={setTaxaFechamento} hint="% dos qualificados que compram" />
                    <CalcInput label="Ticket Médio (R$)" placeholder="Ex: 2000" value={ticketMedio} onChange={setTicketMedio} />
                </div>

                {hasResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Funnel Visual */}
                        <div className="space-y-3">
                            {stages.map((stage, i) => (
                                <motion.div
                                    key={stage.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-28 text-right text-sm font-medium text-muted-foreground shrink-0">
                                        {stage.label}
                                    </div>
                                    <div className="flex-1 h-10 rounded-lg bg-background/50 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: stage.width }}
                                            transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
                                            className={`h-full rounded-lg bg-gradient-to-r ${stage.color} flex items-center justify-center`}
                                        >
                                            <span className="text-sm font-bold text-white drop-shadow">
                                                {stage.value.toLocaleString("pt-BR")}
                                            </span>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Result */}
                        <div className="p-5 rounded-xl bg-background/80 border border-border/50">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-extrabold text-foreground">{leads.toLocaleString("pt-BR")}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Leads / mês</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-foreground">{qualificados.toLocaleString("pt-BR")}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Qualificados</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-green-400">{vendas.toLocaleString("pt-BR")}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Vendas</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold text-green-400">{formatCurrency(faturamento)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Faturamento</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </CalculatorLayout>
    );
};

export default SimuladorFunilPage;
