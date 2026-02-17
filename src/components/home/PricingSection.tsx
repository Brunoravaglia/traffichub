import { motion } from "framer-motion";
import { Check, Star, Zap, Crown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
    {
        id: "solo",
        name: "Solo",
        description: "Para gestores independentes",
        price: "27",
        cents: "90",
        period: "/mês",
        icon: Zap,
        popular: false,
        features: [
            "Até 5 contas de anúncios",
            "1 gestor de tráfego",
            "Checklist por cliente",
            "Relatórios profissionais",
            "Exportação em PDF",
            "Calendário de entregas",
            "Gamificação e conquistas",
        ],
        extra: "+R$15 a cada 10 contas adicionais",
        cta: "Começar Agora",
        gradient: "from-zinc-500/10 to-transparent",
        borderColor: "border-border/50",
        priceColor: "text-foreground",
    },
    {
        id: "agency",
        name: "Agência",
        description: "Para donos de agência",
        price: "97",
        cents: "00",
        period: "/mês",
        icon: Star,
        popular: true,
        features: [
            "Até 50 contas de anúncios",
            "Até 3 gestores de tráfego",
            "Tudo do plano Solo",
            "Dashboard gerencial",
            "Gestão multi-gestor",
            "Controle de clientes avançado",
            "Previsão de saldo",
            "Modelos customizáveis",
        ],
        extra: "Cada plataforma (Google/Meta/TikTok/LinkedIn) = 1 conta",
        cta: "Escolher Agência",
        gradient: "from-primary/15 via-primary/5 to-transparent",
        borderColor: "border-primary/40",
        priceColor: "vcd-gradient-text",
    },
    {
        id: "agency-pro",
        name: "Agência Pro",
        description: "Para agências maiores",
        price: "197",
        cents: "00",
        period: "/mês",
        icon: Crown,
        popular: false,
        features: [
            "Até 50 contas de anúncios",
            "Até 5 gestores de tráfego",
            "Tudo do plano Agência",
            "Monitoramento de tempo",
            "Controle de acessos da equipe",
            "Relatórios de produtividade",
            "Dashboard de performance por gestor",
            "Suporte prioritário",
        ],
        extra: null,
        cta: "Escolher Pro",
        gradient: "from-violet-500/10 to-transparent",
        borderColor: "border-violet-500/30",
        priceColor: "text-foreground",
    },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } },
};

const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const } },
};

const PricingSection = () => {
    return (
        <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
            {/* BG */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/3 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                        Preços
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 text-foreground">
                        Planos que cabem no seu{" "}
                        <span className="vcd-gradient-text">bolso</span>
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
                        Sem taxa de setup. Sem surpresas. Cancele quando quiser.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
                >
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            variants={item}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className={`relative rounded-2xl border ${plan.borderColor} bg-gradient-to-b ${plan.gradient} backdrop-blur-sm p-8 flex flex-col ${plan.popular ? "shadow-[0_0_40px_rgba(255,181,0,0.12)] ring-1 ring-primary/20" : ""
                                }`}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-lg">
                                    Mais Popular
                                </div>
                            )}

                            {/* Icon & Name */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? "bg-primary/20 text-primary" : "bg-card border border-border/50 text-muted-foreground"
                                    }`}>
                                    <plan.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm text-muted-foreground">R$</span>
                                    <span className={`text-5xl font-extrabold tracking-tight ${plan.priceColor}`}>
                                        {plan.price}
                                    </span>
                                    <span className="text-lg text-muted-foreground">,{plan.cents}</span>
                                    <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-start gap-3">
                                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-primary" : "text-emerald-400"}`} />
                                        <span className="text-sm text-foreground/80">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Extra info */}
                            {plan.extra && (
                                <p className="text-xs text-muted-foreground mb-6 px-3 py-2 rounded-lg bg-card/50 border border-border/30">
                                    <Info className="w-3.5 h-3.5 inline-block mr-1 text-muted-foreground" />{plan.extra}
                                </p>
                            )}

                            {/* CTA */}
                            <Link to="/login" className="mt-auto">
                                <Button
                                    className={`w-full h-12 font-semibold text-base transition-all duration-300 ${plan.popular
                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow hover:scale-[1.02]"
                                        : "bg-card hover:bg-secondary text-foreground border border-border hover:border-primary/30"
                                        }`}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-sm text-muted-foreground mt-10"
                >
                    *Cada plataforma de anúncio (Google, Meta, TikTok, LinkedIn) por cliente conta como uma conta separada.
                </motion.p>
            </div>
        </section>
    );
};

export default PricingSection;
