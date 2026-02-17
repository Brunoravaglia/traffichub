import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    CheckSquare,
    FileBarChart,
    Trophy,
    CalendarDays,
    Wallet,
    BarChart3,
    Users,
    LayoutTemplate,
    ArrowRight,
    Shield,
    Zap,
    Globe,
    CheckCircle2,
    Star,
} from "lucide-react";
import { FaGoogle, FaMeta, FaTiktok, FaLinkedin } from "react-icons/fa6";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";

const features = [
    {
        icon: CheckSquare,
        title: "Checklist Inteligente",
        description:
            "Crie checklists personalizáveis para cada cliente. Defina tarefas recorrentes, acompanhe progresso em tempo real e nunca mais esqueça uma etapa.",
        highlights: ["Tarefas recorrentes", "Progresso em tempo real", "Templates reutilizáveis"],
        color: "from-emerald-500/20 to-emerald-500/5",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        gradient: "from-emerald-400 to-green-500",
        progress: 92,
    },
    {
        icon: FileBarChart,
        title: "Relatórios Profissionais",
        description:
            "Relatórios completos com métricas de Google Ads, Meta Ads, TikTok Ads e LinkedIn Ads. Exporte em PDF com a marca da sua agência.",
        highlights: ["Multi-plataforma", "Exportação em PDF", "Marca personalizada"],
        color: "from-blue-500/20 to-blue-500/5",
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/10",
        border: "border-blue-500/20",
        gradient: "from-blue-400 to-cyan-500",
        progress: 65,
    },
    {
        icon: Trophy,
        title: "Gamificação & Conquistas",
        description:
            "Sistema de gamificação que mantém você e sua equipe motivados. Desbloqueie conquistas conforme completa tarefas e atinge metas.",
        highlights: ["Conquistas desbloqueáveis", "Rankings da equipe", "Metas personalizadas"],
        color: "from-amber-500/20 to-amber-500/5",
        iconColor: "text-amber-400",
        iconBg: "bg-amber-500/10",
        border: "border-amber-500/20",
        gradient: "from-amber-400 to-yellow-500",
        progress: 84,
    },
    {
        icon: CalendarDays,
        title: "Calendário de Entregas",
        description:
            "Organize datas de recargas, entregas de relatórios e reuniões em um calendário visual. Receba lembretes e nunca perca um prazo.",
        highlights: ["Lembretes automáticos", "Visualização mensal", "Integração com tarefas"],
        color: "from-purple-500/20 to-purple-500/5",
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/10",
        border: "border-purple-500/20",
        gradient: "from-purple-400 to-violet-500",
        progress: 47,
    },
    {
        icon: Wallet,
        title: "Controle Financeiro",
        description:
            "Acompanhe investimentos por cliente, previsão de saldo e controle de verba. Visibilidade total sobre a saúde financeira de cada conta.",
        highlights: ["Previsão de saldo", "Controle por cliente", "Histórico de investimentos"],
        color: "from-green-500/20 to-green-500/5",
        iconColor: "text-green-400",
        iconBg: "bg-green-500/10",
        border: "border-green-500/20",
        gradient: "from-green-400 to-emerald-500",
        progress: 73,
    },
    {
        icon: BarChart3,
        title: "Dashboard Gerencial",
        description:
            "Visão panorâmica de todos os clientes, métricas de produtividade e performance da equipe. Tudo num painel único e intuitivo.",
        highlights: ["Visão 360°", "KPIs em tempo real", "Filtros avançados"],
        color: "from-cyan-500/20 to-cyan-500/5",
        iconColor: "text-cyan-400",
        iconBg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        gradient: "from-cyan-400 to-blue-500",
        progress: 58,
    },
    {
        icon: Users,
        title: "Gestão Multi-Gestor",
        description:
            "Gerencie equipes com múltiplos gestores de tráfego. Atribua clientes, controle acessos e monitore o desempenho de cada membro.",
        highlights: ["Controle de acessos", "Atribuição de clientes", "Monitoramento"],
        color: "from-rose-500/20 to-rose-500/5",
        iconColor: "text-rose-400",
        iconBg: "bg-rose-500/10",
        border: "border-rose-500/20",
        gradient: "from-rose-400 to-pink-500",
        progress: 89,
    },
    {
        icon: LayoutTemplate,
        title: "Modelos Customizáveis",
        description:
            "Crie e reutilize templates de relatórios. Padronize a comunicação com seus clientes e economize tempo na geração de reports.",
        highlights: ["Templates salvos", "Personalização total", "Economia de tempo"],
        color: "from-indigo-500/20 to-indigo-500/5",
        iconColor: "text-indigo-400",
        iconBg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        gradient: "from-indigo-400 to-violet-500",
        progress: 35,
    },
];

const platforms = [
    { name: "Google Ads", icon: FaGoogle },
    { name: "Meta Ads", icon: FaMeta },
    { name: "TikTok Ads", icon: FaTiktok },
    { name: "LinkedIn Ads", icon: FaLinkedin },
];

const stats = [
    { value: "500+", label: "Gestores ativos" },
    { value: "10k+", label: "Relatórios gerados" },
    { value: "99.9%", label: "Uptime garantido" },
    { value: "4.9", label: "Nota média", extra: "★" },
];

const FeaturesPage = () => {
    return (
        <PublicLayout>
            <SEOHead
                title="Funcionalidades"
                description="Checklist inteligente, relatórios multi-plataforma, gamificação, calendário de entregas, controle financeiro e mais. Conheça tudo que o Vurp oferece."
                path="/features"
                breadcrumbs={[
                    { name: "Funcionalidades", path: "/features" },
                ]}
            />

            {/* ═══════ HERO ═══════ */}
            <section className="pt-20 sm:pt-28 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <Zap className="w-4 h-4" />
                            8 módulos integrados
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-tight">
                            Tudo que você precisa.
                            <br />
                            <span className="vcd-gradient-text">
                                Num só lugar.
                            </span>
                        </h1>
                        <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg">
                            O Vurp reúne organização, relatórios, financeiro e gamificação
                            para gestores de tráfego que querem escalar com profissionalismo.
                        </p>
                    </motion.div>

                    {/* Platforms */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-3 mb-8"
                    >
                        <span className="text-sm text-muted-foreground mr-2">Plataformas:</span>
                        {platforms.map((p) => (
                            <div key={p.name} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground">
                                <p.icon className="w-4 h-4 text-primary" />
                                {p.name}
                            </div>
                        ))}
                    </motion.div>

                    {/* Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12"
                    >
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center p-4 rounded-xl bg-card/50 border border-border/50">
                                <p className="text-2xl sm:text-3xl font-black text-foreground">
                                    {stat.value}
                                    {stat.extra && <span className="text-primary ml-1 text-lg">{stat.extra}</span>}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ FEATURE SHOWCASE (alternating layout) ═══════ */}
            <section className="pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.6 }}
                            className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "" : ""}`}
                        >
                            {/* Text Side */}
                            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                                <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6`}>
                                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{feature.title}</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed mb-6">{feature.description}</p>
                                <div className="space-y-2 mb-6">
                                    {feature.highlights.map((h) => (
                                        <div key={h} className="flex items-center gap-2 text-sm text-foreground/80">
                                            <CheckCircle2 className={`w-4 h-4 ${feature.iconColor} flex-shrink-0`} />
                                            {h}
                                        </div>
                                    ))}
                                </div>
                                <Link to="/signup">
                                    <Button variant="outline" className="border-border text-foreground hover:bg-primary/10 hover:border-primary/30">
                                        Experimentar agora
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Visual Card - Mockup UI */}
                            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                                <div className={`rounded-2xl border ${feature.border} bg-gradient-to-b ${feature.color} p-1 shadow-lg`}>
                                    <div className="rounded-xl bg-card/80 backdrop-blur-sm overflow-hidden">
                                        {/* Browser Chrome */}
                                        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                                                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                                            </div>
                                            <div className="flex-1 mx-4">
                                                <div className="bg-background/50 rounded-md px-3 py-1 text-xs text-muted-foreground text-center">
                                                    app.vurp.com.br
                                                </div>
                                            </div>
                                        </div>
                                        {/* Content Area */}
                                        <div className="p-6 space-y-4 min-h-[260px]">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                                                    <feature.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                                                    <p className="text-xs text-muted-foreground">Vurp Pro</p>
                                                </div>
                                            </div>
                                            {/* Simulated UI Rows */}
                                            {[1, 2, 3].map((row) => (
                                                <div key={row} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.gradient} opacity-20 flex-shrink-0`} />
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className="h-2.5 rounded-full bg-foreground/10 w-3/4" />
                                                        <div className="h-2 rounded-full bg-foreground/5 w-1/2" />
                                                    </div>
                                                    <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${feature.iconBg} ${feature.iconColor}`}>
                                                        {row === 1 ? "Ativo" : row === 2 ? "50%" : "Novo"}
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Progress Indicator */}
                                            <div className="pt-2">
                                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                    <span>Progresso</span>
                                                    <span className={feature.iconColor}>{feature.progress}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-background/50 overflow-hidden">
                                                    <motion.div
                                                        className={`h-full rounded-full bg-gradient-to-r ${feature.gradient}`}
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${feature.progress}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 1, delay: 0.3 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════ TRUST BAR ═══════ */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                    >
                        {[
                            { icon: Shield, label: "Dados 100% seguros", desc: "Não armazenamos senhas ou APIs" },
                            { icon: Zap, label: "Ultra rápido", desc: "Interface leve e responsiva" },
                            { icon: Globe, label: "4 plataformas de Ads", desc: "Google, Meta, TikTok, LinkedIn" },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-border bg-card/50 p-6 text-center hover:border-primary/30 transition-colors">
                                <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════ TESTIMONIAL ═══════ */}
            <section className="py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="rounded-2xl bg-gradient-to-br from-primary/5 to-amber-500/5 border border-primary/10 p-8 sm:p-12 text-center"
                    >
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-5 h-5 fill-primary text-primary" />
                            ))}
                        </div>
                        <blockquote className="text-lg sm:text-xl text-foreground font-medium leading-relaxed mb-6">
                            "O Vurp mudou completamente a forma como gerencio meus clientes.
                            Economizo pelo menos 2 horas por dia com a automação de relatórios e checklists."
                        </blockquote>
                        <p className="text-sm text-muted-foreground">
                            - Gestor de tráfego com 15+ clientes ativos
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══════ CTA ═══════ */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center space-y-6"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                            Comece a usar{" "}
                            <span className="vcd-gradient-text">todas as funcionalidades</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            7 dias grátis, sem cartão de crédito. Cancele quando quiser.
                        </p>
                        <Link to="/signup">
                            <Button size="lg" className="h-14 px-10 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow group">
                                Experimentar Grátis
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default FeaturesPage;
