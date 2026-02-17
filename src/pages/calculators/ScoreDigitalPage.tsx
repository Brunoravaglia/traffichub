import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Shield, Zap, Crown, Star } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";

const categorias = [
    { id: "presenca", label: "Presença Online", icon: "🌐" },
    { id: "trafego", label: "Tráfego Pago", icon: "📊" },
    { id: "conteudo", label: "Conteúdo", icon: "✍️" },
    { id: "automacao", label: "Automação", icon: "⚡" },
    { id: "dados", label: "Dados e Analytics", icon: "📈" },
];

const perguntas = [
    { categoria: "presenca", pergunta: "Seu site é responsivo e carrega em menos de 3 segundos?", opcoes: [{ texto: "Não tenho site", pontos: 0 }, { texto: "Tenho mas é lento/desatualizado", pontos: 1 }, { texto: "Site rápido e responsivo", pontos: 2 }, { texto: "Site otimizado com SSL, SEO e performance A+", pontos: 3 }] },
    { categoria: "presenca", pergunta: "Sua marca tem presença ativa em quantas redes sociais?", opcoes: [{ texto: "Nenhuma", pontos: 0 }, { texto: "1-2 redes com posts esporádicos", pontos: 1 }, { texto: "2-3 redes com frequência regular", pontos: 2 }, { texto: "3+ redes com estratégia definida", pontos: 3 }] },
    { categoria: "trafego", pergunta: "Você investe em anúncios pagos?", opcoes: [{ texto: "Nunca investi", pontos: 0 }, { texto: "Invisto ocasionalmente sem estratégia", pontos: 1 }, { texto: "Investimento constante com otimizações", pontos: 2 }, { texto: "Múltiplas plataformas com escala e ROAS positivo", pontos: 3 }] },
    { categoria: "trafego", pergunta: "Você utiliza remarketing e públicos personalizados?", opcoes: [{ texto: "Não sei o que é", pontos: 0 }, { texto: "Sei mas não uso", pontos: 1 }, { texto: "Uso remarketing básico", pontos: 2 }, { texto: "Lookalikes, remarketing dinâmico e segmentação avançada", pontos: 3 }] },
    { categoria: "conteudo", pergunta: "Qual a frequência de produção de conteúdo?", opcoes: [{ texto: "Nenhuma", pontos: 0 }, { texto: "1-2 posts por semana", pontos: 1 }, { texto: "3-5 posts por semana", pontos: 2 }, { texto: "Diário com calendário editorial e múltiplos formatos", pontos: 3 }] },
    { categoria: "conteudo", pergunta: "Você utiliza vídeo marketing?", opcoes: [{ texto: "Não produzo vídeos", pontos: 0 }, { texto: "Vídeos esporádicos e amadores", pontos: 1 }, { texto: "Reels/Stories regulares", pontos: 2 }, { texto: "Produção profissional com Reels, YouTube e UGC", pontos: 3 }] },
    { categoria: "automacao", pergunta: "Qual o nível de automação do seu marketing?", opcoes: [{ texto: "Tudo manual", pontos: 0 }, { texto: "Respostas automáticas básicas", pontos: 1 }, { texto: "Fluxos de email ou WhatsApp", pontos: 2 }, { texto: "CRM com automação completa e lead scoring", pontos: 3 }] },
    { categoria: "automacao", pergunta: "Você tem um CRM ou ferramenta de gestão de leads?", opcoes: [{ texto: "Não", pontos: 0 }, { texto: "Planilhas", pontos: 1 }, { texto: "CRM básico", pontos: 2 }, { texto: "CRM integrado com pipeline e automações", pontos: 3 }] },
    { categoria: "dados", pergunta: "Você monitora KPIs de marketing regularmente?", opcoes: [{ texto: "Não monitoro", pontos: 0 }, { texto: "Olho métricas ocasionalmente", pontos: 1 }, { texto: "Relatórios mensais", pontos: 2 }, { texto: "Dashboards em tempo real com metas e alertas", pontos: 3 }] },
    { categoria: "dados", pergunta: "Você consegue atribuir vendas ao canal de origem?", opcoes: [{ texto: "Não", pontos: 0 }, { texto: "Parcialmente, com UTMs manuais", pontos: 1 }, { texto: "Rastreamento com UTMs e GA4", pontos: 2 }, { texto: "Atribuição multi-touch com integração CRM", pontos: 3 }] },
];

const ScoreDigitalPage = () => {
    const [step, setStep] = useState(0);
    const [respostas, setRespostas] = useState<number[]>([]);
    const [finalizado, setFinalizado] = useState(false);

    const handleResposta = (pontos: number) => {
        const novas = [...respostas, pontos];
        setRespostas(novas);
        if (step < perguntas.length - 1) {
            setStep(step + 1);
        } else {
            setFinalizado(true);
        }
    };

    const score = respostas.reduce((a, b) => a + b, 0);
    const maxScore = perguntas.length * 3;
    const percentual = Math.round((score / maxScore) * 100);

    const getLevel = () => {
        if (percentual >= 80) return { label: "Expert", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: Crown };
        if (percentual >= 60) return { label: "Avançado", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: Zap };
        if (percentual >= 40) return { label: "Intermediário", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Star };
        return { label: "Iniciante", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: Shield };
    };

    const getScoreByCategoria = (catId: string) => {
        const catPerguntas = perguntas.map((p, i) => ({ ...p, index: i })).filter((p) => p.categoria === catId);
        const catScore = catPerguntas.reduce((acc, p) => acc + (respostas[p.index] || 0), 0);
        const catMax = catPerguntas.length * 3;
        return { score: catScore, max: catMax, percent: catMax > 0 ? Math.round((catScore / catMax) * 100) : 0 };
    };

    const handleReset = () => {
        setStep(0);
        setRespostas([]);
        setFinalizado(false);
    };

    const level = getLevel();

    return (
        <PublicLayout>
            <SEOHead
                title="Score de Maturidade Digital Grátis | Vurp"
                description="Descubra o nível de maturidade digital do seu negócio. Avalie presença online, tráfego pago, conteúdo, automação e analytics."
                path="/utilidades/score-digital"
                breadcrumbs={[
                    { name: "Utilidades", path: "/utilidades" },
                    { name: "Score Digital", path: "/utilidades/score-digital" },
                ]}
            />

            <div className="min-h-screen bg-background text-foreground">
                <section className="pt-28 pb-16">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6">
                        <Link
                            to="/utilidades"
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Todas as ferramentas
                        </Link>

                        {!finalizado ? (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                        <span>{categorias.find(c => c.id === perguntas[step].categoria)?.icon} {categorias.find(c => c.id === perguntas[step].categoria)?.label}</span>
                                        <span>{step + 1}/{perguntas.length}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-card border border-border/50 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-violet-500 to-primary rounded-full"
                                            animate={{ width: `${((step + 1) / perguntas.length) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold mb-6">{perguntas[step].pergunta}</h2>

                                <div className="space-y-3">
                                    {perguntas[step].opcoes.map((opcao, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleResposta(opcao.pontos)}
                                            className="w-full text-left p-4 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:bg-card/80 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="shrink-0 w-8 h-8 rounded-lg bg-background flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span className="text-sm font-medium text-foreground">{opcao.texto}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                {/* Score Header */}
                                <div className="text-center mb-8">
                                    <div className={`inline-flex p-4 rounded-2xl ${level.bg} border ${level.border} mb-4`}>
                                        <level.icon className={`w-10 h-10 ${level.color}`} />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-1">
                                        Score: <span className={level.color}>{percentual}/100</span>
                                    </h2>
                                    <p className={`text-lg font-medium ${level.color}`}>{level.label}</p>
                                </div>

                                {/* Radar by category */}
                                <div className="p-6 rounded-2xl bg-card border border-border/50 mb-6">
                                    <h3 className="font-bold mb-4">Score por Área</h3>
                                    <div className="space-y-4">
                                        {categorias.map((cat) => {
                                            const catData = getScoreByCategoria(cat.id);
                                            return (
                                                <div key={cat.id}>
                                                    <div className="flex justify-between text-sm mb-1.5">
                                                        <span className="font-medium text-foreground">{cat.icon} {cat.label}</span>
                                                        <span className="text-muted-foreground">{catData.percent}%</span>
                                                    </div>
                                                    <div className="h-3 rounded-full bg-background overflow-hidden">
                                                        <motion.div
                                                            className={`h-full rounded-full ${catData.percent >= 80 ? "bg-green-500" :
                                                                    catData.percent >= 60 ? "bg-amber-500" :
                                                                        catData.percent >= 40 ? "bg-orange-500" :
                                                                            "bg-red-500"
                                                                }`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${catData.percent}%` }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="p-6 rounded-2xl bg-card border border-border/50 mb-6">
                                    <h3 className="font-bold mb-4">Recomendações</h3>
                                    <div className="space-y-3">
                                        {categorias
                                            .map((cat) => ({ ...cat, data: getScoreByCategoria(cat.id) }))
                                            .filter((cat) => cat.data.percent < 70)
                                            .sort((a, b) => a.data.percent - b.data.percent)
                                            .map((cat) => (
                                                <div key={cat.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                                                    <span className="text-lg">{cat.icon}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{cat.label} ({cat.data.percent}%)</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {cat.id === "presenca" && "Invista em um site profissional e presença ativa nas redes sociais."}
                                                            {cat.id === "trafego" && "Comece ou escale seus investimentos em tráfego pago com estratégia."}
                                                            {cat.id === "conteudo" && "Crie um calendário editorial e produza conteúdo de forma consistente."}
                                                            {cat.id === "automacao" && "Implemente um CRM e automações para escalar sem aumentar equipe."}
                                                            {cat.id === "dados" && "Configure rastreamento correto e dashboards para tomar decisões baseadas em dados."}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground font-medium transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Refazer avaliação
                                    </button>
                                    <Link
                                        to="/signup"
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
                                    >
                                        Profissionalizar meu marketing
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default ScoreDigitalPage;
