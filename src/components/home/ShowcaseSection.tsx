import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    FileBarChart,
    CheckSquare,
    Calendar,
    BarChart3,
} from "lucide-react";

const tabs = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        title: "Visão geral completa",
        description:
            "Acompanhe todos os clientes, métricas de performance e pendências num painel único e intuitivo.",
        gradient: "from-primary/20 via-primary/5 to-transparent",
        mockupContent: (
            <div className="p-2 h-full">
                <img
                    src="/showcase/dashboard.png"
                    alt="Dashboard Real Vurp"
                    className="w-full h-full object-cover rounded-xl shadow-inner shadow-black/20"
                />
            </div>
        ),
    },
    {
        id: "reports",
        label: "Relatórios",
        icon: FileBarChart,
        title: "Relatórios que impressionam",
        description:
            "Crie relatórios profissionais com dados de Google, Meta, TikTok e LinkedIn. Exporte em PDF com sua marca.",
        gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
        mockupContent: (
            <div className="p-2 h-full">
                <img
                    src="/showcase/reports.png"
                    alt="Relatórios Profissionais Vurp"
                    className="w-full h-full object-cover rounded-xl shadow-inner shadow-black/20"
                />
            </div>
        ),
    },
    {
        id: "checklist",
        label: "Checklist",
        icon: CheckSquare,
        title: "Nunca mais esqueça uma tarefa",
        description:
            "Checklists personalizáveis por cliente. Acompanhe progresso e garanta que nada fique para trás.",
        gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
        mockupContent: (
            <div className="p-2 h-full">
                <img
                    src="/showcase/checklist.png"
                    alt="Checklist de Setup Vurp"
                    className="w-full h-full object-cover rounded-xl shadow-inner shadow-black/20"
                />
            </div>
        ),
    },
    {
        id: "calendar",
        label: "Calendário",
        icon: Calendar,
        title: "Organize suas entregas",
        description:
            "Calendário visual com lembretes, datas de recargas e entregas de relatórios.",
        gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
        mockupContent: (
            <div className="p-2 h-full">
                <img
                    src="/showcase/calendar.png"
                    alt="Calendário de Gestão Vurp"
                    className="w-full h-full object-cover rounded-xl shadow-inner shadow-black/20"
                />
            </div>
        ),
    },
    {
        id: "productivity",
        label: "Produtividade",
        icon: BarChart3,
        title: "Métricas de produtividade",
        description:
            "Acompanhe o desempenho da equipe com métricas claras de produtividade e eficiência.",
        gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
        mockupContent: (
            <div className="p-2 h-full">
                <img
                    src="/showcase/productivity.png"
                    alt="Produtividade e Conquistas Vurp"
                    className="w-full h-full object-cover rounded-xl shadow-inner shadow-black/20"
                />
            </div>
        ),
    },
];

const ShowcaseSection = () => {
    const [activeTab, setActiveTab] = useState("dashboard");
    const activeData = tabs.find((t) => t.id === activeTab)!;

    return (
        <section id="showcase" className="relative py-24 sm:py-32 overflow-hidden">
            {/* BG glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                        Showcase
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 text-foreground">
                        Veja o <span className="vcd-gradient-text">Vurp</span> em ação
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
                        Uma interface pensada para produtividade e clareza.
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap items-center justify-center gap-2 mb-10"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                                ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(255,181,0,0.1)]"
                                : "bg-card/50 text-muted-foreground border border-border/30 hover:text-foreground hover:border-border"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {/* Showcase Content */}
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Text */}
                    <motion.div
                        key={activeData.id + "-text"}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-4"
                    >
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                            {activeData.title}
                        </h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {activeData.description}
                        </p>
                    </motion.div>

                    {/* Mockup */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeData.id}
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.97 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className={`rounded-2xl border border-border/50 bg-gradient-to-b ${activeData.gradient} backdrop-blur-sm overflow-hidden shadow-2xl`}
                        >
                            {/* Window chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                <div className="ml-4 h-5 flex-1 max-w-xs rounded bg-card/60 border border-border/20" />
                            </div>
                            {activeData.mockupContent}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

export default ShowcaseSection;
