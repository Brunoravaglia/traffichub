import { motion } from "framer-motion";
import {
    CheckSquare,
    FileBarChart,
    Trophy,
    CalendarDays,
    Wallet,
    BarChart3,
    Users,
    LayoutTemplate,
} from "lucide-react";

const features = [
    {
        icon: CheckSquare,
        title: "Checklist Inteligente",
        description:
            "Acompanhe tarefas por cliente com checklists personalizáveis. Nunca mais esqueça uma etapa.",
        color: "from-emerald-500/20 to-emerald-500/5",
        iconColor: "text-emerald-400",
    },
    {
        icon: FileBarChart,
        title: "Relatórios Profissionais",
        description:
            "Gere relatórios completos com métricas de todas as plataformas. Exporte em PDF com a sua marca.",
        color: "from-blue-500/20 to-blue-500/5",
        iconColor: "text-blue-400",
    },
    {
        icon: Trophy,
        title: "Gamificação & Conquistas",
        description:
            "Desbloqueie conquistas conforme evolui. Mantenha a motivação da equipe em alta.",
        color: "from-amber-500/20 to-amber-500/5",
        iconColor: "text-amber-400",
    },
    {
        icon: CalendarDays,
        title: "Calendário de Entregas",
        description:
            "Organize datas de recargas, entregas de relatórios e reuniões em um calendário visual.",
        color: "from-purple-500/20 to-purple-500/5",
        iconColor: "text-purple-400",
    },
    {
        icon: Wallet,
        title: "Controle Financeiro",
        description:
            "Previsão de saldo, controle de investimentos e acompanhamento de verba por cliente.",
        color: "from-green-500/20 to-green-500/5",
        iconColor: "text-green-400",
    },
    {
        icon: BarChart3,
        title: "Dashboard Gerencial",
        description:
            "Visão panorâmica de todos os clientes, produtividade e performance da equipe.",
        color: "from-cyan-500/20 to-cyan-500/5",
        iconColor: "text-cyan-400",
    },
    {
        icon: Users,
        title: "Gestão Multi-Gestor",
        description:
            "Gerencie equipes com múltiplos gestores. Controle de acessos e monitoramento de tempo.",
        color: "from-rose-500/20 to-rose-500/5",
        iconColor: "text-rose-400",
    },
    {
        icon: LayoutTemplate,
        title: "Modelos Customizáveis",
        description:
            "Crie e reutilize templates de relatórios. Padronize a comunicação com seus clientes.",
        color: "from-indigo-500/20 to-indigo-500/5",
        iconColor: "text-indigo-400",
    },
];

const container = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } },
};

const FeaturesSection = () => {
    return (
        <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 sm:mb-20"
                >
                    <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                        Funcionalidades
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 text-foreground">
                        Tudo que você precisa,{" "}
                        <span className="vcd-gradient-text">num só lugar</span>
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
                        Ferramentas poderosas projetadas especificamente para
                        gestores de tráfego pago.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={item}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(255,181,0,0.08)] cursor-default"
                        >
                            {/* Gradient background on hover */}
                            <div
                                className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                            />

                            <div className="relative z-10">
                                <div
                                    className={`w-12 h-12 rounded-xl bg-card border border-border/50 flex items-center justify-center mb-4 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesSection;
