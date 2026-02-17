import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Star, Crown, Calculator, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/home/PublicLayout";
import { PLANS, formatPrice, redirectToCheckout } from "@/lib/stripe";
import SEOHead from "@/components/SEOHead";

const featureComparison = [
    { feature: "Contas de anúncios", solo: "Até 5", agency: "Até 50", pro: "Até 50" },
    { feature: "Gestores de tráfego", solo: "1", agency: "Até 3", pro: "Até 5" },
    { feature: "Checklist por cliente", solo: "✓", agency: "✓", pro: "✓" },
    { feature: "Relatórios profissionais", solo: "✓", agency: "✓", pro: "✓" },
    { feature: "Exportação em PDF", solo: "✓", agency: "✓", pro: "✓" },
    { feature: "Calendário de entregas", solo: "✓", agency: "✓", pro: "✓" },
    { feature: "Gamificação e conquistas", solo: "✓", agency: "✓", pro: "✓" },
    { feature: "Dashboard gerencial", solo: "-", agency: "✓", pro: "✓" },
    { feature: "Gestão multi-gestor", solo: "-", agency: "✓", pro: "✓" },
    { feature: "Previsão de saldo", solo: "-", agency: "✓", pro: "✓" },
    { feature: "Modelos customizáveis", solo: "-", agency: "✓", pro: "✓" },
    { feature: "Monitoramento de tempo", solo: "-", agency: "-", pro: "✓" },
    { feature: "Controle de acessos", solo: "-", agency: "-", pro: "✓" },
    { feature: "Relatórios de produtividade", solo: "-", agency: "-", pro: "✓" },
    { feature: "Suporte prioritário", solo: "-", agency: "-", pro: "✓" },
];

const PricingPage = () => {
    const [annual, setAnnual] = useState(false);

    const icons = [Zap, Star, Crown];
    const borderColors = ["border-border/50", "border-primary/40", "border-violet-500/30"];
    const gradients = [
        "from-zinc-500/10 to-transparent",
        "from-primary/15 via-primary/5 to-transparent",
        "from-violet-500/10 to-transparent",
    ];

    return (
        <PublicLayout>
            <SEOHead
                title="Preços e Planos"
                description="Planos a partir de R$27,90/mês. Solo, Agência e Agência Pro - sem taxa de setup, sem surpresas. Cancele quando quiser. 7 dias grátis."
                path="/pricing"
                breadcrumbs={[
                    { name: "Preços", path: "/pricing" },
                ]}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: "Vurp",
                    description: "Plataforma de gestão para gestores de tráfego pago",
                    offers: [
                        { "@type": "Offer", name: "Solo", price: "27.90", priceCurrency: "BRL", availability: "https://schema.org/InStock" },
                        { "@type": "Offer", name: "Agência", price: "97.00", priceCurrency: "BRL", availability: "https://schema.org/InStock" },
                        { "@type": "Offer", name: "Agência Pro", price: "197.00", priceCurrency: "BRL", availability: "https://schema.org/InStock" },
                    ],
                }}
            />
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground">
                            Escolha seu <span className="vcd-gradient-text">plano</span>
                        </h1>
                        <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
                            Sem taxa de setup. Sem surpresas. Cancele quando quiser.
                        </p>

                        {/* Toggle */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
                                Mensal
                            </span>
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
                                Anual{" "}
                                <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full ml-1">
                                    -20%
                                </span>
                            </span>
                        </div>
                    </motion.div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
                        {PLANS.map((plan, i) => {
                            const Icon = icons[i];
                            const price = annual ? plan.priceYearly / 12 : plan.priceMonthly;
                            const isPopular = i === 1;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.15 }}
                                    whileHover={{ y: -8 }}
                                    className={`relative rounded-2xl border ${borderColors[i]} bg-gradient-to-b ${gradients[i]} backdrop-blur-sm p-8 flex flex-col ${isPopular ? "shadow-[0_0_40px_rgba(255,181,0,0.12)] ring-1 ring-primary/20" : ""
                                        }`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-lg">
                                            Mais Popular
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPopular ? "bg-primary/20 text-primary" : "bg-card border border-border/50 text-muted-foreground"
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                                            <p className="text-xs text-muted-foreground">{plan.description}</p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm text-muted-foreground">R$</span>
                                            <span className={`text-5xl font-extrabold tracking-tight ${isPopular ? "vcd-gradient-text" : "text-foreground"}`}>
                                                {Math.floor(price)}
                                            </span>
                                            <span className="text-lg text-muted-foreground">
                                                ,{String(Math.round((price % 1) * 100)).padStart(2, "0")}
                                            </span>
                                            <span className="text-sm text-muted-foreground ml-1">/mês</span>
                                        </div>
                                        {annual && (
                                            <p className="text-xs text-primary mt-1">
                                                {formatPrice(plan.priceYearly)}/ano - economia de {formatPrice(plan.priceMonthly * 12 - plan.priceYearly)}
                                            </p>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, j) => (
                                            <li key={j} className="flex items-start gap-3">
                                                <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isPopular ? "text-primary" : "text-emerald-400"}`} />
                                                <span className="text-sm text-foreground/80">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => {
                                            const priceId = annual ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
                                            if (priceId) redirectToCheckout(priceId);
                                        }}
                                        className={`w-full h-12 font-semibold text-base transition-all duration-300 ${isPopular
                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow hover:scale-[1.02]"
                                            : "bg-card hover:bg-secondary text-foreground border border-border hover:border-primary/30"
                                            }`}
                                    >
                                        Começar Agora
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Feature Comparison Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8">
                            Comparativo <span className="vcd-gradient-text">completo</span>
                        </h2>

                        <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-4 bg-card/60 border-b border-border/30">
                                <div className="p-4 text-sm font-semibold text-muted-foreground">Funcionalidade</div>
                                <div className="p-4 text-sm font-semibold text-center text-foreground">Solo</div>
                                <div className="p-4 text-sm font-semibold text-center text-primary">Agência</div>
                                <div className="p-4 text-sm font-semibold text-center text-foreground">Pro</div>
                            </div>
                            {/* Table rows */}
                            {featureComparison.map((row, i) => (
                                <div
                                    key={i}
                                    className={`grid grid-cols-4 border-b border-border/20 last:border-b-0 ${i % 2 === 0 ? "bg-transparent" : "bg-card/20"
                                        }`}
                                >
                                    <div className="p-4 text-sm text-foreground/80">{row.feature}</div>
                                    <div className={`p-4 text-sm text-center ${row.solo === "✓" ? "text-emerald-400" : row.solo === "-" ? "text-muted-foreground/30" : "text-foreground/70"}`}>
                                        {row.solo}
                                    </div>
                                    <div className={`p-4 text-sm text-center ${row.agency === "✓" ? "text-primary" : row.agency === "-" ? "text-muted-foreground/30" : "text-foreground/70"}`}>
                                        {row.agency}
                                    </div>
                                    <div className={`p-4 text-sm text-center ${row.pro === "✓" ? "text-emerald-400" : row.pro === "-" ? "text-muted-foreground/30" : "text-foreground/70"}`}>
                                        {row.pro}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Account Calculator */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 max-w-xl mx-auto"
                    >
                        <AccountCalculator />
                    </motion.div>

                    {/* Note */}
                    <p className="text-center text-sm text-muted-foreground mt-10">
                        *Cada plataforma de anúncio (Google, Meta, TikTok, LinkedIn) por cliente conta como uma conta separada.
                    </p>
                </div>
            </section>
        </PublicLayout>
    );
};

function AccountCalculator() {
    const [clients, setClients] = useState(5);
    const [platforms, setPlatforms] = useState(2);
    const total = clients * platforms;

    const recommendedPlan = total <= 5 ? "Solo" : total <= 50 ? "Agência" : "Agência Pro";

    return (
        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <Calculator className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Calculadora de Contas</h3>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                        Quantos clientes você gerencia?
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={30}
                        value={clients}
                        onChange={(e) => setClients(Number(e.target.value))}
                        className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">1</span>
                        <span className="text-foreground font-bold">{clients} clientes</span>
                        <span className="text-muted-foreground">30</span>
                    </div>
                </div>

                <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                        Quantas plataformas por cliente em média?
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={4}
                        value={platforms}
                        onChange={(e) => setPlatforms(Number(e.target.value))}
                        className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">1</span>
                        <span className="text-foreground font-bold">{platforms} plataformas</span>
                        <span className="text-muted-foreground">4</span>
                    </div>
                </div>

                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total de contas</div>
                    <div className="text-3xl font-extrabold vcd-gradient-text">{total}</div>
                    <div className="text-sm text-foreground/70 mt-2">
                        Plano recomendado: <span className="text-primary font-semibold">{recommendedPlan}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PricingPage;
