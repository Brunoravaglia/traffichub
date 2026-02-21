import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    Calculator,
    TrendingUp,
    Target,
    MousePointerClick,
    Eye,
    Users,
    Heart,
    DollarSign,
    BarChart3,
    Percent,
    ArrowRight,
    GitBranch,
    Link2,
    Type,
    Stethoscope,
    Gauge,
    PieChart,
    Layers,
    RefreshCw,
    Activity,
    Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ToolItem {
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    popular?: boolean;
    cta?: string;
    premium?: boolean;
}

const sections: { title: string; emoji: string; tools: ToolItem[] }[] = [
    {
        title: "Calculadoras Essenciais",
        emoji: "🔥",
        tools: [
            { slug: "roas", title: "ROAS", subtitle: "Return on Ad Spend", description: "Calcule o retorno do investimento em anúncios", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", popular: true },
            { slug: "roi", title: "ROI", subtitle: "Return on Investment", description: "Retorno sobre o investimento total do negócio", icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", popular: true },
            { slug: "cpm", title: "CPM", subtitle: "Custo por Mil Impressões", description: "Quanto custa para exibir 1.000 vezes seu anúncio", icon: Eye, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { slug: "cpa", title: "CPA", subtitle: "Custo por Aquisição", description: "Custo para adquirir cada novo cliente", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", popular: true },
            { slug: "cpc", title: "CPC", subtitle: "Custo por Clique", description: "Quanto você paga por cada clique no anúncio", icon: MousePointerClick, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
            { slug: "ctr", title: "CTR", subtitle: "Taxa de Clique", description: "Taxa de cliques dos seus anúncios", icon: Percent, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
        ],
    },
    {
        title: "Métricas de Assinatura (Premium)",
        emoji: "✨",
        tools: [
            { slug: "ltv-cac", title: "LTV / CAC", subtitle: "Unit Economics", description: "Analise a saúde financeira da aquisição de clientes", icon: PieChart, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", premium: true, popular: true },
            { slug: "churn-rate", title: "Churn Rate", subtitle: "Taxa de Cancelamento", description: "Calcule a perda de assinantes e receita mensal", icon: RefreshCw, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", premium: true },
            { slug: "cohort", title: "Análise de Coorte", subtitle: "Retenção por Período", description: "Entenda como grupos de clientes se comportam no tempo", icon: Layers, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", premium: true },
            { slug: "payback", title: "Payback Period", subtitle: "Tempo de Retorno", description: "Quanto tempo leva para recuperar o custo de aquisição", icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", premium: true },
        ],
    },
    {
        title: "Simuladores Estratégicos",
        emoji: "📊",
        tools: [
            { slug: "simulador-meta", title: "Simulador Meta Ads", subtitle: "Orçamento > Leads > Vendas", description: "Simule resultados de campanhas com benchmarks por nicho", icon: Target, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", popular: true, cta: "Simular agora" },
            { slug: "simulador-funil", title: "Simulador de Funil", subtitle: "Visualize seu pipeline", description: "Projete vendas e faturamento com suas taxas de conversão", icon: GitBranch, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", popular: true, cta: "Simular agora" },
        ],
    },
];

const InternalUtilities = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <header className="mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        Ferramentas de Assinante
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight">
                        Central de <span className="text-primary">Estratégia</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Acesso exclusivo às calculadoras e simuladores avançados para turbinar sua gestão de tráfego.
                    </p>
                </motion.div>
            </header>

            <div className="space-y-16">
                {sections.map((section, si) => (
                    <section key={section.title}>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl">{section.emoji}</span>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                {section.title}
                            </h2>
                            <div className="flex-1 h-px bg-border/50 ml-4 hidden md:block" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {section.tools.map((calc, i) => (
                                <motion.div
                                    key={calc.slug}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: si * 0.1 + i * 0.05 }}
                                    className="flex h-full"
                                >
                                    <Link
                                        to={`/utilidades/${calc.slug}`}
                                        className={`group relative flex flex-col w-full p-7 rounded-[2rem] bg-card/50 backdrop-blur-sm border ${calc.border} hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden`}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                                        {calc.premium && (
                                            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-600 border-none text-[10px] font-black uppercase text-white shadow-lg">
                                                Premium
                                            </Badge>
                                        )}

                                        {!calc.premium && calc.popular && (
                                            <Badge variant="outline" className="absolute top-4 right-4 border-primary/30 text-primary text-[10px] font-black uppercase">
                                                Popular
                                            </Badge>
                                        )}

                                        <div className="flex-1">
                                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${calc.bg} mb-5 group-hover:scale-110 transition-transform`}>
                                                <calc.icon className={`w-6 h-6 ${calc.color}`} />
                                            </div>

                                            <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                                                {calc.title}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.2em] mb-3 opacity-70">
                                                {calc.subtitle}
                                            </p>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {calc.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 mt-6 text-sm text-primary font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                            <span>{calc.cta || "Acessar ferramenta"}</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default InternalUtilities;
