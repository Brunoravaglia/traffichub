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
            <div className="space-y-4 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <div className="h-3 w-32 rounded bg-foreground/20" />
                    <div className="ml-auto h-3 w-20 rounded bg-primary/30" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl bg-card/80 border border-border/30 p-4 space-y-2">
                            <div className="h-2.5 w-16 rounded bg-muted-foreground/20" />
                            <div className="text-2xl font-bold vcd-gradient-text">
                                {i === 1 ? "24" : i === 2 ? "89%" : "R$12k"}
                            </div>
                            <div className="h-2 w-24 rounded bg-muted-foreground/10" />
                        </div>
                    ))}
                </div>
                <div className="h-40 rounded-xl bg-card/60 border border-border/30 p-4 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 85, 75, 95, 70].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/60 to-primary/20" style={{ height: `${h}%` }} />
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl bg-card/60 border border-border/30 p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10" />
                            <div className="space-y-1 flex-1">
                                <div className="h-2 w-20 rounded bg-foreground/15" />
                                <div className="h-2 w-14 rounded bg-muted-foreground/10" />
                            </div>
                        </div>
                    ))}
                </div>
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
            <div className="space-y-4 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        <div className="h-3 w-40 rounded bg-foreground/20" />
                        <div className="h-2 w-28 rounded bg-muted-foreground/10" />
                    </div>
                    <div className="h-9 w-28 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <span className="text-xs text-blue-400 font-medium">Exportar PDF</span>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {["Impressões", "Cliques", "CTR", "CPL"].map((label, i) => (
                        <div key={i} className="rounded-lg bg-card/80 border border-border/30 p-3 text-center">
                            <div className="text-xs text-muted-foreground mb-1">{label}</div>
                            <div className="text-lg font-bold text-foreground">
                                {i === 0 ? "145k" : i === 1 ? "8.2k" : i === 2 ? "5.6%" : "R$12"}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="h-32 rounded-xl bg-card/60 border border-border/30 p-4 flex items-end gap-1">
                    {Array.from({ length: 30 }, (_, i) => 20 + Math.sin(i * 0.5) * 30 + Math.random() * 20).map((h, i) => (
                        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-blue-500/60 to-blue-500/20" style={{ height: `${h}%` }} />
                    ))}
                </div>
                <div className="space-y-2">
                    {["Google Ads", "Meta Ads", "TikTok Ads"].map((platform, i) => (
                        <div key={i} className="rounded-lg bg-card/60 border border-border/30 p-3 flex items-center justify-between">
                            <span className="text-sm text-foreground/80">{platform}</span>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>R${(3500 + i * 1200).toLocaleString()}</span>
                                <span className="text-emerald-400">+{12 + i * 3}%</span>
                            </div>
                        </div>
                    ))}
                </div>
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
            <div className="space-y-3 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-3 w-36 rounded bg-foreground/20" />
                    <div className="text-sm text-emerald-400 font-medium">75%</div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-card/80 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all" />
                </div>
                <div className="space-y-2 mt-4">
                    {[
                        { text: "Criar campanhas de conversão", done: true },
                        { text: "Configurar pixel de rastreamento", done: true },
                        { text: "Definir público-alvo lookalike", done: true },
                        { text: "Configurar remarketing", done: false },
                        { text: "Otimizar lances automáticos", done: false },
                        { text: "Criar relatório de performance", done: false },
                        { text: "Ajustar orçamento diário", done: false },
                        { text: "Enviar relatório ao cliente", done: false },
                    ].map((task, i) => (
                        <div key={i} className={`rounded-lg border p-3 flex items-center gap-3 transition-all ${task.done
                                ? "bg-emerald-500/5 border-emerald-500/20"
                                : "bg-card/60 border-border/30"
                            }`}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${task.done
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground/30"
                                }`}>
                                {task.done && <span className="text-xs text-primary-foreground font-bold">✓</span>}
                            </div>
                            <span className={`text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                {task.text}
                            </span>
                        </div>
                    ))}
                </div>
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
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-semibold text-foreground">Fevereiro 2026</div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-card/80 border border-border/30 flex items-center justify-center text-muted-foreground text-sm">←</div>
                        <div className="w-8 h-8 rounded-lg bg-card/80 border border-border/30 flex items-center justify-center text-muted-foreground text-sm">→</div>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                        <div key={i} className="text-center text-xs text-muted-foreground py-2">{d}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                        const day = i - 1;
                        const isValid = day >= 0 && day < 28;
                        const isToday = day === 15;
                        const hasEvent = [3, 7, 14, 20, 25].includes(day);
                        return (
                            <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative ${isToday
                                    ? "bg-primary/20 border border-primary/40 text-primary font-bold"
                                    : isValid
                                        ? "text-foreground/70 hover:bg-card/60"
                                        : "text-muted-foreground/20"
                                }`}>
                                {isValid && day + 1}
                                {hasEvent && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 absolute bottom-1" />}
                            </div>
                        );
                    })}
                </div>
                <div className="space-y-2 mt-2">
                    {[
                        { label: "Recarga - Cliente ABC", color: "bg-purple-400" },
                        { label: "Envio relatório - XYZ", color: "bg-primary" },
                    ].map((event, i) => (
                        <div key={i} className="rounded-lg bg-card/60 border border-border/30 p-3 flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${event.color}`} />
                            <span className="text-sm text-foreground/80">{event.label}</span>
                        </div>
                    ))}
                </div>
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
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: "Tarefas concluídas", value: "142", change: "+18%" },
                        { label: "Tempo médio", value: "23min", change: "-12%" },
                        { label: "Clientes atendidos", value: "28", change: "+5" },
                        { label: "Eficiência", value: "94%", change: "+3%" },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-xl bg-card/80 border border-border/30 p-4">
                            <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                            <div className="text-xl font-bold text-foreground">{stat.value}</div>
                            <div className="text-xs text-emerald-400 mt-1">{stat.change}</div>
                        </div>
                    ))}
                </div>
                <div className="rounded-xl bg-card/60 border border-border/30 p-4">
                    <div className="text-sm font-medium mb-3">Ranking da equipe</div>
                    {[
                        { name: "Bruno R.", score: 94 },
                        { name: "Maria S.", score: 87 },
                        { name: "João P.", score: 82 },
                    ].map((member, i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                            <div className="w-6 text-center text-sm font-bold text-primary">{i + 1}º</div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {member.name.substring(0, 2)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-foreground/80">{member.name}</span>
                                    <span className="text-muted-foreground">{member.score}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-card/80 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400" style={{ width: `${member.score}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
