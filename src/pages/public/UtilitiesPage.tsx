import { LazyMotion, domAnimation, m } from "framer-motion";
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
    Info,
} from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

            <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-background text-foreground">
                {/* Hero */}
                <section className="pb-8 pt-20 sm:pt-24">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                                <Calculator className="w-4 h-4" />
                                {totalTools} Ferramentas Gratuitas
                            </div>
                            <h1 className="mb-3 text-[clamp(1.75rem,5.2vw,3.35rem)] font-extrabold tracking-tight">
                                Ferramentas para{" "}
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    Gestores de Tráfego
                                </span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-[clamp(0.95rem,1.55vw,1.05rem)] leading-relaxed text-muted-foreground">
                                Calculadoras, simuladores, geradores e diagnósticos em um só lugar.
                                Grátis, sem cadastro, resultados instantâneos.
                            </p>
                        </m.div>
                    </div>
                </section>

                {/* Tool Sections */}
                <section className="pb-14">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                        <TooltipProvider delayDuration={120}>
                        {sections.map((section, si) => (
                            <div key={section.title}>
                                <m.h2
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: si * 0.1 }}
                                    className="mb-4 flex items-center gap-2 text-[1.08rem] font-bold sm:text-xl"
                                >
                                    <span>{section.emoji}</span>
                                    {section.title}
                                </m.h2>
                                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
                                    {section.tools.map((calc, i) => (
                                        <m.div
                                            key={calc.slug}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: si * 0.1 + i * 0.05 }}
                                            className="flex h-full"
                                        >
                                            <article className={`group relative flex w-full flex-col rounded-2xl border bg-card/80 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_0_26px_hsl(var(--primary)/0.10)] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/25 ${calc.border}`}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            aria-label={`Explicacao da calculadora ${calc.title}`}
                                                            className="absolute right-1.5 top-1.5 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card/95 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                                        >
                                                            <Info className="h-4 w-4" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="max-w-[220px] border-border/80 bg-background/95 text-xs leading-relaxed text-foreground">
                                                        {calc.description}
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Link
                                                    to={`/utilidades/${calc.slug}`}
                                                    className="flex h-full flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                                >
                                                    {calc.popular && (
                                                        <span className="mb-1.5 inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
                                                            Popular
                                                        </span>
                                                    )}

                                                    <div className="flex-1">
                                                        <div className="mb-2.5 flex items-start justify-between gap-2 pr-10">
                                                            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 ${calc.bg}`}>
                                                                <calc.icon className={`h-5 w-5 ${calc.color}`} />
                                                            </div>
                                                        </div>

                                                        <h3 className="mb-0.5 text-[1rem] font-bold leading-tight transition-colors group-hover:text-primary sm:text-[1.08rem]">
                                                            {calc.title}
                                                        </h3>
                                                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/85">
                                                            {calc.subtitle}
                                                        </p>
                                                        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:text-[12px]">
                                                            {calc.description}
                                                        </p>
                                                    </div>

                                                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-primary opacity-85 transition-all group-hover:translate-x-0.5 sm:text-xs sm:opacity-0 sm:group-hover:opacity-100">
                                                        <span>{calc.cta || "Calcular agora"}</span>
                                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </Link>
                                            </article>
                                        </m.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        </TooltipProvider>
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
                                <Button className="h-12 bg-primary px-8 text-base font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/70 group vcd-button-glow">
                                    Começar Grátis
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
            </LazyMotion>
        </PublicLayout>
    );
};

export default UtilitiesPage;
