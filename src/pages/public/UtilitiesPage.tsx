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
    Sparkles,
    Megaphone,
    GitBranch,
    Link2,
    Type,
    Stethoscope,
    Gauge,
} from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { GoogleLogo, MetaLogo, LinkedInLogo } from "@/components/BrandLogos";

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
            { slug: "cpl", title: "CPL", subtitle: "Custo por Lead", description: "Quanto custa gerar cada lead qualificado", icon: Users, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
            { slug: "ltv", title: "LTV", subtitle: "Lifetime Value", description: "Valor vitalício de cada cliente no seu negócio", icon: Heart, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", popular: true },
            { slug: "cac", title: "CAC", subtitle: "Custo de Aquisição de Cliente", description: "Custo total para adquirir um cliente", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
            { slug: "markup", title: "Markup", subtitle: "Markup e Margem de Lucro", description: "Calcule preço de venda e margem ideal", icon: Calculator, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
        ],
    },
    {
        title: "Simuladores Estratégicos",
        emoji: "📊",
        tools: [
            { slug: "simulador-meta", title: "Simulador Meta Ads", subtitle: "Orçamento > Leads > Vendas", description: "Simule resultados de campanhas com benchmarks por nicho", icon: MetaLogo, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", popular: true, cta: "Simular agora" },
            { slug: "simulador-funil", title: "Simulador de Funil", subtitle: "Visualize seu pipeline", description: "Projete vendas e faturamento com suas taxas de conversão", icon: GitBranch, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", popular: true, cta: "Simular agora" },
        ],
    },
    {
        title: "Ferramentas Técnicas",
        emoji: "🧠",
        tools: [
            { slug: "gerador-utm", title: "Gerador de UTMs", subtitle: "Campaign URL Builder", description: "Monte URLs com parâmetros UTM para rastrear campanhas", icon: Link2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", popular: true, cta: "Gerar UTM" },
            { slug: "gerador-headlines", title: "Gerador de Headlines", subtitle: "Copy persuasiva em segundos", description: "Gere headlines de alta conversão para anúncios e LPs", icon: Type, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", cta: "Gerar headlines" },
        ],
    },
    {
        title: "Diagnósticos",
        emoji: "🏢",
        tools: [
            { slug: "diagnostico-marketing", title: "Diagnóstico de Marketing", subtitle: "Quiz - 10 perguntas", description: "Avalie o nível do marketing digital do seu negócio", icon: Stethoscope, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", popular: true, cta: "Fazer diagnóstico" },
            { slug: "score-digital", title: "Score de Maturidade Digital", subtitle: "Avaliação completa", description: "Descubra seu score em 5 áreas do marketing digital", icon: Gauge, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", cta: "Avaliar agora" },
        ],
    },
];

const totalTools = sections.reduce((acc, s) => acc + s.tools.length, 0);

const UtilitiesPage = () => {
    return (
        <PublicLayout>
            <SEOHead
                title="Ferramentas de Marketing Digital Grátis | Vurp"
                description="Hub completo de ferramentas para gestores de tráfego: calculadoras, simuladores, geradores e diagnósticos. Grátis e sem cadastro."
                path="/utilidades"
                breadcrumbs={[{ name: "Utilidades", path: "/utilidades" }]}
            />

            <div className="min-h-screen bg-background text-foreground">
                {/* Hero */}
                <section className="pt-24 sm:pt-28 pb-12">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                                <Calculator className="w-4 h-4" />
                                {totalTools} Ferramentas Gratuitas
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                                Ferramentas para{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                                    Gestores de Tráfego
                                </span>
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Calculadoras, simuladores, geradores e diagnósticos em um só lugar.
                                Grátis, sem cadastro, resultados instantâneos.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Tool Sections */}
                <section className="pb-20">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                        {sections.map((section, si) => (
                            <div key={section.title}>
                                <motion.h2
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: si * 0.1 }}
                                    className="text-xl font-bold mb-4 flex items-center gap-2"
                                >
                                    <span>{section.emoji}</span>
                                    {section.title}
                                </motion.h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                                className={`group relative flex flex-col w-full p-7 rounded-[2rem] bg-card border ${calc.border} hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1`}
                                            >
                                                {calc.popular && (
                                                    <span className="absolute top-4 right-4 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full backdrop-blur-sm border border-primary/20">
                                                        Popular
                                                    </span>
                                                )}

                                                <div className="flex-1">
                                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${calc.bg} mb-5`}>
                                                        <calc.icon className={`w-6 h-6 ${calc.color}`} />
                                                    </div>

                                                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                                                        {calc.title}
                                                    </h3>
                                                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.2em] mb-3 opacity-70">
                                                        {calc.subtitle}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                        {calc.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 mt-6 text-sm text-primary font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                                    <span>{calc.cta || "Calcular agora"}</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 p-8 sm:p-12 text-center">
                            <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                                Chega de calculadora manual
                            </h2>
                            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                                O Vurp gera relatórios completos com todas essas métricas automaticamente.
                                Conecte suas contas e tenha dashboards em tempo real.
                            </p>
                            <Link to="/signup">
                                <Button className="h-12 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow transition-all hover:scale-105 group">
                                    Começar Grátis
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default UtilitiesPage;
