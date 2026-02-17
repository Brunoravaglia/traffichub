import { motion } from "framer-motion";
import { CreditCard, Calendar, FileText, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { formatPrice, redirectToCustomerPortal } from "@/lib/stripe";

const invoices = [
    { date: "01/02/2026", amount: 97, status: "Pago", id: "INV-2026-0201" },
    { date: "01/01/2026", amount: 97, status: "Pago", id: "INV-2026-0101" },
    { date: "01/12/2025", amount: 97, status: "Pago", id: "INV-2025-1201" },
    { date: "01/11/2025", amount: 27.9, status: "Pago", id: "INV-2025-1101" },
];

const BillingPage = () => {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl font-bold text-foreground mb-1">Faturamento & Assinatura</h1>
                <p className="text-sm text-muted-foreground">Gerencie seu plano, métodos de pagamento e faturas.</p>
            </motion.div>

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
                                Ativo
                            </div>
                            <span className="text-xs text-muted-foreground">Plano Mensal</span>
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Plano Agência</h2>
                        <p className="text-sm text-muted-foreground mt-1">Até 50 contas · Até 3 gestores</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-extrabold vcd-gradient-text">{formatPrice(97)}</div>
                        <span className="text-xs text-muted-foreground">/mês</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                    <Button
                        onClick={() => redirectToCustomerPortal()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Gerenciar no Stripe
                    </Button>
                    <a href="/account/plan">
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                            Trocar de Plano
                        </Button>
                    </a>
                </div>
            </motion.div>

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
                    <p className="text-sm font-medium text-foreground">Próxima cobrança</p>
                    <p className="text-xs text-muted-foreground">01 de março de 2026 - {formatPrice(97)}</p>
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
                        <p className="text-sm font-medium text-foreground">Método de pagamento</p>
                        <p className="text-xs text-muted-foreground">Visa terminando em •••• 4242</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => redirectToCustomerPortal()}
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    Alterar
                </Button>
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
                    {invoices.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-card/40 transition-colors">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <div>
                                    <p className="text-sm text-foreground">{inv.id}</p>
                                    <p className="text-xs text-muted-foreground">{inv.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-foreground">{formatPrice(inv.amount)}</p>
                                <p className="text-xs text-emerald-400">{inv.status}</p>
                            </div>
                        </div>
                    ))}
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
                    <p className="text-sm text-foreground font-medium">Quer cancelar?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Você pode cancelar a qualquer momento pelo portal do Stripe. Seu acesso continua até o final do período pago.
                        Sem multa ou fidelidade.
                    </p>
                    <button
                        onClick={() => redirectToCustomerPortal()}
                        className="text-xs text-amber-400 hover:underline mt-2 inline-block"
                    >
                        Abrir portal de cancelamento →
                    </button>
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
