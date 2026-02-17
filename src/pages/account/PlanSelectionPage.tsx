import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { PLANS, formatPrice, redirectToCheckout } from "@/lib/stripe";

const icons = [Zap, Star, Crown];

const PlanSelectionPage = () => {
    const [annual, setAnnual] = useState(false);
    const currentPlanId = "agency"; // TODO: get from user context

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Trocar de Plano</h1>
                <p className="text-sm text-muted-foreground">Compare os planos e escolha o ideal para você.</p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Mensal</span>
                    <button
                        onClick={() => setAnnual(!annual)}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${annual ? "bg-primary" : "bg-border"
                            }`}
                    >
                        <motion.div
                            animate={{ x: annual ? 28 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                        />
                    </button>
                    <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
                        Anual
                        <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full ml-1">-20%</span>
                    </span>
                </div>
            </motion.div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLANS.map((plan, i) => {
                    const Icon = icons[i];
                    const price = annual ? plan.priceYearly / 12 : plan.priceMonthly;
                    const isCurrent = plan.id === currentPlanId;
                    const isUpgrade = PLANS.findIndex(p => p.id === currentPlanId) < i;

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className={`relative rounded-2xl border p-6 flex flex-col ${isCurrent
                                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 shadow-[0_0_30px_rgba(255,181,0,0.08)]"
                                    : "border-border/50 bg-card/30"
                                }`}
                        >
                            {isCurrent && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                    Plano Atual
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCurrent ? "bg-primary/20 text-primary" : "bg-card border border-border/50 text-muted-foreground"
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                                </div>
                            </div>

                            <div className="mb-5">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm text-muted-foreground">R$</span>
                                    <span className={`text-4xl font-extrabold ${isCurrent ? "vcd-gradient-text" : "text-foreground"}`}>
                                        {Math.floor(price)}
                                    </span>
                                    <span className="text-base text-muted-foreground">
                                        ,{String(Math.round((price % 1) * 100)).padStart(2, "0")}
                                    </span>
                                    <span className="text-sm text-muted-foreground ml-1">/mês</span>
                                </div>
                                {annual && (
                                    <p className="text-xs text-primary mt-1">
                                        {formatPrice(plan.priceYearly)}/ano
                                    </p>
                                )}
                            </div>

                            <ul className="space-y-2.5 mb-6 flex-1">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-start gap-2">
                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrent ? "text-primary" : "text-emerald-400"}`} />
                                        <span className="text-sm text-foreground/80">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <Button disabled className="w-full h-11 bg-card border border-border text-muted-foreground cursor-default">
                                    Plano Atual
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        const priceId = annual ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
                                        if (priceId) redirectToCheckout(priceId);
                                    }}
                                    className={`w-full h-11 font-semibold transition-all ${isUpgrade
                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow"
                                            : "bg-card hover:bg-secondary text-foreground border border-border"
                                        }`}
                                >
                                    {isUpgrade ? "Fazer Upgrade" : "Downgrade"}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Info */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-muted-foreground"
            >
                Mudanças de plano entram em vigor imediatamente. O valor é ajustado proporcionalmente.
            </motion.p>
        </div>
    );
};

const PlanSelectionPageWithLayout = () => (
    <AppLayout>
        <PlanSelectionPage />
    </AppLayout>
);

export default PlanSelectionPageWithLayout;
