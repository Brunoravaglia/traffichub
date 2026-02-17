import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    DollarSign,
    Share2,
    TrendingUp,
    UserPlus,
    Clock,
    BarChart3,
    Repeat,
    Gift,
    CheckCircle2,
} from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";

const steps = [
    {
        icon: UserPlus,
        title: "Cadastre-se",
        description: "Crie sua conta de afiliado gratuitamente em menos de 2 minutos.",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    {
        icon: Share2,
        title: "Compartilhe",
        description: "Use seu link exclusivo para indicar gestores de tráfego.",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
    {
        icon: DollarSign,
        title: "Receba",
        description: "Ganhe 40% recorrente sobre cada assinatura indicada - todo mês.",
        color: "text-green-400",
        bg: "bg-green-500/10",
    },
];

const benefits = [
    {
        icon: Repeat,
        title: "Comissão Recorrente",
        description: "Enquanto seu indicado pagar, você ganha. Todo mês, sem limite.",
    },
    {
        icon: TrendingUp,
        title: "Dashboard em Tempo Real",
        description: "Acompanhe cliques, conversões e ganhos em um painel exclusivo.",
    },
    {
        icon: Clock,
        title: "Pagamentos Mensais",
        description: "Receba via PIX ou transferência bancária até o dia 10 de cada mês.",
    },
    {
        icon: Gift,
        title: "Materiais Prontos",
        description: "Banners, textos e vídeos para facilitar sua divulgação.",
    },
    {
        icon: BarChart3,
        title: "Sem Limite de Ganhos",
        description: "Quanto mais indicações, mais você ganha. Sem teto de comissão.",
    },
    {
        icon: CheckCircle2,
        title: "Produto que Vende Sozinho",
        description: "Gestores de tráfego precisam do Vurp - conversão natural.",
    },
];

const faqs = [
    {
        q: "Quanto eu ganho por indicação?",
        a: "Você ganha 40% do valor da assinatura mensal ou anual de cada cliente que indicar. Se o cliente paga R$97/mês, você recebe R$38,80/mês enquanto ele for assinante.",
    },
    {
        q: "Quando recebo os pagamentos?",
        a: "Os pagamentos são processados até o dia 10 de cada mês, referente às comissões do mês anterior. Você pode receber via PIX ou transferência bancária.",
    },
    {
        q: "Preciso ser gestor de tráfego para ser afiliado?",
        a: "Não! Qualquer pessoa pode se tornar afiliado. Porém, se você atua no mercado de marketing digital, suas indicações tendem a converter muito mais.",
    },
    {
        q: "Posso acumular comissões de vários indicados?",
        a: "Sim! Não há limite de indicações. Cada novo assinante gera uma comissão recorrente que se acumula com as anteriores.",
    },
    {
        q: "E se o cliente cancelar e depois voltar?",
        a: "O cookie de rastreamento tem validade de 90 dias. Se o cliente retornar e assinar dentro desse período, a comissão é mantida para você.",
    },
];

const AffiliatePage = () => {
    return (
        <PublicLayout>
            <SEOHead
                title="Programa de Afiliados - Ganhe 40% Recorrente | Vurp"
                description="Seja afiliado do Vurp e ganhe 40% de comissão recorrente sobre cada assinatura indicada. Programa de indicação para gestores de tráfego."
                path="/afiliados"
                breadcrumbs={[{ name: "Afiliados", path: "/afiliados" }]}
            />

            <div className="min-h-screen bg-background text-foreground">
                {/* ═══════ HERO ═══════ */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent" />
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6"
                        >
                            <DollarSign className="w-4 h-4" />
                            Programa de Afiliados
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                        >
                            Ganhe{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                40% recorrente
                            </span>
                            <br />
                            indicando o Vurp
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
                        >
                            Indique gestores de tráfego e receba comissão mensal enquanto eles
                            forem assinantes. Simples, transparente e sem limite de ganhos.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <a href="https://forms.gle/AFFILIATE_FORM" target="_blank" rel="noopener noreferrer">
                                <Button
                                    size="lg"
                                    className="h-14 px-8 text-lg font-bold bg-green-500 hover:bg-green-600 text-white transition-all duration-300 hover:scale-105 group"
                                >
                                    Quero ser Afiliado
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </a>
                            <button
                                onClick={() => document.querySelector("#como-funciona")?.scrollIntoView({ behavior: "smooth" })}
                                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                Como funciona ↓
                            </button>
                        </motion.div>

                        {/* Earnings simulator */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="mt-12 max-w-md mx-auto p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50"
                        >
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                                Simulação de ganhos
                            </p>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-foreground">10</p>
                                    <p className="text-xs text-muted-foreground">indicados</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-400">R$388</p>
                                    <p className="text-xs text-muted-foreground">/ mês</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-400">R$4.656</p>
                                    <p className="text-xs text-muted-foreground">/ ano</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-3">
                                *Baseado no plano Solo (R$97/mês) com 40% de comissão
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ═══════ COMO FUNCIONA ═══════ */}
                <section id="como-funciona" className="py-20">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Como funciona</h2>
                            <p className="text-muted-foreground">3 passos simples para começar a ganhar</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 }}
                                    className="text-center"
                                >
                                    <div className="relative inline-flex mb-4">
                                        <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center`}>
                                            <step.icon className={`w-8 h-8 ${step.color}`} />
                                        </div>
                                        <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                    <p className="text-muted-foreground text-sm">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════ BENEFÍCIOS ═══════ */}
                <section className="py-20 bg-card/30">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Por que ser afiliado Vurp?</h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {benefits.map((b, i) => (
                                <motion.div
                                    key={b.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                                >
                                    <b.icon className="w-6 h-6 text-primary mb-3" />
                                    <h3 className="font-semibold mb-2">{b.title}</h3>
                                    <p className="text-sm text-muted-foreground">{b.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════ FAQ ═══════ */}
                <section className="py-20">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6">
                        <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <motion.details
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group p-5 rounded-xl bg-card border border-border/50 cursor-pointer"
                                >
                                    <summary className="flex items-center justify-between font-medium text-foreground list-none">
                                        {faq.q}
                                        <span className="ml-2 text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
                                    </summary>
                                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                                </motion.details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════ CTA Final ═══════ */}
                <section className="py-20">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                        <div className="p-10 rounded-2xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20">
                            <h2 className="text-3xl font-bold mb-4">
                                Comece a ganhar <span className="text-green-400">agora</span>
                            </h2>
                            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                                Cadastre-se gratuitamente e comece a indicar. Cada gestor de tráfego
                                que assinar vira uma comissão recorrente no seu bolso.
                            </p>
                            <a href="https://forms.gle/AFFILIATE_FORM" target="_blank" rel="noopener noreferrer">
                                <Button
                                    size="lg"
                                    className="h-14 px-10 text-lg font-bold bg-green-500 hover:bg-green-600 text-white transition-all duration-300 hover:scale-105 group"
                                >
                                    Quero ser Afiliado - É Grátis
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default AffiliatePage;
