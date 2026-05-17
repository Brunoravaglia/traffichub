import { motion } from "framer-motion";
import { CreditCard, Calendar, FileText, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { FOUNDER_ACCESS_BADGE, formatPrice, getBillingOverview, isFounderPartnerAgency, redirectToCreditCheckout, PLANS } from "@/lib/billing";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useGestor } from "@/contexts/GestorContext";

const BillingPage = () => {
    const [creditsToBuy, setCreditsToBuy] = useState(10);
    const { gestor, agencia } = useGestor();
    const isFounderPartner = isFounderPartnerAgency(agencia);
    const missingBillingDocument = gestor?.agencia_id ? !agencia?.cnpj : !gestor?.cpf;
    const missingPhone = !gestor?.telefone;

    const { data: billingOverview, isLoading: billingLoading } = useQuery({
        queryKey: ["billing-overview", gestor?.id],
        queryFn: () => getBillingOverview(gestor?.id, agencia),
        enabled: !!gestor?.id,
    });

    const wallet = billingOverview?.wallet;
    const planId = billingOverview?.subscription.planId ?? "free";
    const billingInterval = billingOverview?.subscription.interval ?? null;
    const plan = PLANS.find((item) => item.id === planId);
    const isFreePlan = planId === "free";
    const intervalLabel = isFounderPartner
        ? "Acesso institucional"
        : isFreePlan
        ? "Plano gratuito"
        : billingInterval === "yearly"
        ? "Assinatura anual"
        : "Assinatura mensal";
    const headline = isFounderPartner ? "Agência Pro Infinito" : isFreePlan ? "Plano Free" : plan?.name ?? "Plano ativo";
    const referencePrice = billingInterval === "yearly" ? plan?.priceYearly ?? 0 : plan?.priceMonthly ?? 0;
    const priceLabel = isFounderPartner ? "Especial" : isFreePlan ? "R$0" : formatPrice(referencePrice);

    const buyCredits = async () => {
        try {
            if (!Number.isInteger(creditsToBuy) || creditsToBuy <= 0) {
                throw new Error("Informe uma quantidade válida de créditos.");
            }
            await redirectToCreditCheckout(creditsToBuy);
        } catch (err) {
            toast({
                title: "Erro ao comprar créditos",
                description: err instanceof Error ? err.message : "Tente novamente em alguns instantes.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl font-bold text-foreground mb-1">Faturamento & Assinatura</h1>
                <p className="text-sm text-muted-foreground">
                    {isFounderPartner ? "Acesso especial de parceria fundadora." : "Gerencie seu plano, métodos de pagamento e faturas."}
                </p>
            </motion.div>

            {missingBillingDocument || missingPhone ? (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3"
                >
                    <p className="text-sm font-medium text-foreground">Complete seus dados de cobranca antes de pagar</p>
                    <p className="text-xs text-muted-foreground">
                        {gestor?.agencia_id
                            ? "Para contas de agência, informe telefone do gestor e CNPJ da agência."
                            : "Para contas individuais, informe telefone e CPF do gestor."}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {!gestor?.agencia_id ? (
                            <Button asChild variant="outline">
                                <Link to="/account">Atualizar minha conta</Link>
                            </Button>
                        ) : null}
                        {gestor?.agencia_id ? (
                            <Button asChild variant="outline">
                                <Link to="/agencia/configuracoes">Atualizar dados da agência</Link>
                            </Button>
                        ) : null}
                    </div>
                </motion.div>
            ) : null}

            {/* Current Plan */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/8 to-transparent p-6"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider">
                                {isFounderPartner ? FOUNDER_ACCESS_BADGE : billingOverview?.subscription.status === "active" ? "Ativo" : "Pendente"}
                            </div>
                            <span className="text-xs text-muted-foreground">{intervalLabel}</span>
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{headline}</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isFounderPartner
                                ? "Conta institucional da Você Digital com acesso permanente liberado por parceria fundadora."
                                : isFreePlan
                                ? `${billingOverview?.freeReportsRemaining ?? 3} relatórios grátis restantes antes do consumo de créditos`
                                : plan?.description ?? "Plano pago ativo"}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-extrabold vcd-gradient-text">{priceLabel}</div>
                        <span className="text-xs text-muted-foreground">
                            {isFounderPartner
                                ? "sem cobrança recorrente"
                                : isFreePlan
                                ? "sem cobrança"
                                : billingInterval === "yearly"
                                ? "ciclo anual"
                                : "ciclo mensal"}
                        </span>
                    </div>
                    </div>

                {isFounderPartner ? (
                    <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <p className="text-sm font-medium text-foreground">Parceiro fundador reconhecido</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Esta conta não deve receber CTA de cobrança, upgrade ou limite de relatórios. A experiência aqui precisa refletir o acordo institucional.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-3 mt-6">
                        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                            <Link to="/account/plan">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {isFreePlan ? "Assinar agora" : "Trocar de Plano"}
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                            <Link to="/support">Falar com suporte</Link>
                        </Button>
                    </div>
                )}
            </motion.div>

            {/* Credits Wallet */}
            {!isFounderPartner ? (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4"
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Créditos de Relatório</p>
                        <h2 className="text-xl font-bold text-foreground">
                            {billingLoading ? "Carregando..." : `${wallet?.saldoCreditos ?? 0} créditos`}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isFreePlan
                                ? `Conta grátis: ${billingOverview?.freeReportsRemaining ?? 3} relatórios restantes antes de consumir créditos.`
                                : "Plano pago ativo: relatórios ilimitados, créditos continuam úteis para fluxos avulsos."}
                        </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                        <p>Total comprado: <span className="text-foreground">{wallet?.totalComprados ?? 0}</span></p>
                        <p>Total consumido: <span className="text-foreground">{wallet?.totalConsumidos ?? 0}</span></p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                    <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">Quantidade para comprar</label>
                        <input
                            type="number"
                            min={1}
                            step={1}
                            value={creditsToBuy}
                            onChange={(e) => setCreditsToBuy(Math.max(1, Number(e.target.value) || 1))}
                            className="w-full h-11 rounded-xl border border-border/60 bg-card/40 px-3 text-sm text-foreground"
                        />
                    </div>
                    <Button onClick={buyCredits} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                        Comprar créditos ({formatPrice(creditsToBuy)})
                    </Button>
                </div>

                <p className="text-[11px] text-muted-foreground">
                    Cada crédito custa {formatPrice(1)} e libera 1 novo relatório.
                </p>
            </motion.div>
            ) : null}

            {/* Usage */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid sm:grid-cols-2 gap-4"
            >
                <div className="rounded-xl border border-border/50 bg-card/30 p-5">
                    <p className="text-xs text-muted-foreground mb-1">Contas de Anúncios</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">12</span>
                        <span className="text-sm text-muted-foreground">/ 50</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: "24%" }} />
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/30 p-5">
                    <p className="text-xs text-muted-foreground mb-1">Gestores de Tráfego</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">2</span>
                        <span className="text-sm text-muted-foreground">/ 3</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: "66%" }} />
                    </div>
                </div>
            </motion.div>

            {/* Next billing */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-xl border border-border/50 bg-card/30 p-5 flex items-center gap-4"
            >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">{isFounderPartner ? "Parceria ativa" : isFreePlan ? "Assinatura pendente" : "Cobranca recorrente ativa"}</p>
                    <p className="text-xs text-muted-foreground">
                        {isFounderPartner
                            ? "A conta da Você Digital permanece ativa sem cobrança recorrente e sem necessidade de upgrade manual."
                            : isFreePlan
                            ? "Escolha um plano para liberar a área paga e relatórios sem limite."
                            : "Seu plano pago segue em recorrencia via Abacate Pay no metodo cadastrado durante o checkout."}
                    </p>
                </div>
            </motion.div>

            {/* Payment method */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border/50 bg-card/30 p-5 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">{isFounderPartner ? "Reconhecimento da parceria" : "Método de pagamento"}</p>
                    <p className="text-xs text-muted-foreground">
                        {isFounderPartner
                            ? "Conta institucional sem cobrança recorrente ativa."
                            : isFreePlan
                            ? "Planos pagos usam cartao recorrente; creditos avulsos aceitam PIX ou cartao."
                            : "Assinatura recorrente gerenciada pelo checkout seguro do Abacate Pay."}
                    </p>
                </div>
            </div>
                {!isFounderPartner ? (
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    <Link to="/support">Solicitar alteração</Link>
                </Button>
                ) : null}
            </motion.div>

            {/* Invoice History */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden"
            >
                <div className="p-5 border-b border-border/30 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Histórico de Faturas</h3>
                </div>
                <div className="divide-y divide-border/20">
                    <div className="flex items-center justify-between px-5 py-4 hover:bg-card/40 transition-colors">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <div>
                                <p className="text-sm text-foreground">{isFounderPartner ? "Acesso fundador ativo" : isFreePlan ? "Conta Free ativa" : `Plano ${headline}`}</p>
                                <p className="text-xs text-muted-foreground">
                                    {isFounderPartner
                                        ? "Conta institucional da Você Digital com acesso permanente reconhecido no sistema."
                                        : isFreePlan
                                        ? `${billingOverview?.reportsGenerated ?? 0} relatórios gerados até agora`
                                        : "Pagamentos confirmados via Abacate Pay aparecem após os eventos do webhook"}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{isFounderPartner ? "Founder" : isFreePlan ? "R$0" : priceLabel}</p>
                            <p className="text-xs text-emerald-400">{isFounderPartner ? "Ativo" : billingOverview?.subscription.status === "active" ? "Ativo" : "Pendente"}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Cancel info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-start gap-3"
            >
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm text-foreground font-medium">{isFounderPartner ? "Conta institucional" : "Quer cancelar?"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isFounderPartner
                            ? "Qualquer ajuste dessa conta deve ser tratado como decisão interna de parceria, não como fluxo padrão de cancelamento."
                            : "Você pode solicitar cancelamento a qualquer momento pelo suporte. Seu acesso continua até o final do período pago. Sem multa ou fidelidade."}
                    </p>
                    {!isFounderPartner ? (
                        <Link to="/support" className="text-xs text-amber-400 hover:underline mt-2 inline-block">
                            Falar com suporte sobre cancelamento →
                        </Link>
                    ) : null}
                </div>
            </motion.div>
        </div>
    );
};

const BillingPageWithLayout = () => (
    <AppLayout>
        <BillingPage />
    </AppLayout>
);

export default BillingPageWithLayout;
