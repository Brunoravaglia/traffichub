import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, XCircle, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";

const perguntas = [
    {
        id: 1,
        pergunta: "Qual é o principal canal de aquisição de clientes do seu negócio?",
        opcoes: [
            { texto: "Indicação boca a boca", pontos: 1 },
            { texto: "Redes sociais orgânicas", pontos: 2 },
            { texto: "Tráfego pago (Meta/Google Ads)", pontos: 4 },
            { texto: "Múltiplos canais integrados", pontos: 5 },
        ],
    },
    {
        id: 2,
        pergunta: "Você sabe exatamente quanto custa adquirir um cliente (CAC)?",
        opcoes: [
            { texto: "Não faço ideia", pontos: 1 },
            { texto: "Tenho uma noção, mas não calculo", pontos: 2 },
            { texto: "Calculo mensalmente", pontos: 4 },
            { texto: "Monitoro em tempo real com dashboards", pontos: 5 },
        ],
    },
    {
        id: 3,
        pergunta: "Como você acompanha os resultados das campanhas de marketing?",
        opcoes: [
            { texto: "Não acompanho regularmente", pontos: 1 },
            { texto: "Olho as métricas do gerenciador de anúncios", pontos: 2 },
            { texto: "Tenho planilhas com KPIs", pontos: 3 },
            { texto: "Dashboards automatizados com metas definidas", pontos: 5 },
        ],
    },
    {
        id: 4,
        pergunta: "Seu negócio tem uma landing page otimizada para conversão?",
        opcoes: [
            { texto: "Não tenho landing page", pontos: 1 },
            { texto: "Tenho, mas nunca testei variações", pontos: 2 },
            { texto: "Tenho e faço testes A/B ocasionais", pontos: 4 },
            { texto: "Testo e otimizo continuamente", pontos: 5 },
        ],
    },
    {
        id: 5,
        pergunta: "Com que frequência você produz conteúdo para sua marca?",
        opcoes: [
            { texto: "Raramente ou nunca", pontos: 1 },
            { texto: "1-2 vezes por semana", pontos: 2 },
            { texto: "3-5 vezes por semana", pontos: 4 },
            { texto: "Diariamente com calendário editorial", pontos: 5 },
        ],
    },
    {
        id: 6,
        pergunta: "Você tem um funil de vendas definido?",
        opcoes: [
            { texto: "Não sei o que é funil de vendas", pontos: 1 },
            { texto: "Tenho noção mas nada documentado", pontos: 2 },
            { texto: "Tenho funil definido mas sem automação", pontos: 3 },
            { texto: "Funil completo com automação e remarketing", pontos: 5 },
        ],
    },
    {
        id: 7,
        pergunta: "Qual o investimento mensal em marketing digital?",
        opcoes: [
            { texto: "Não invisto", pontos: 1 },
            { texto: "Até R$ 1.000/mês", pontos: 2 },
            { texto: "R$ 1.000 - R$ 5.000/mês", pontos: 3 },
            { texto: "Acima de R$ 5.000/mês", pontos: 5 },
        ],
    },
    {
        id: 8,
        pergunta: "Você utiliza email marketing ou WhatsApp para nutrir leads?",
        opcoes: [
            { texto: "Não uso nenhum", pontos: 1 },
            { texto: "Uso WhatsApp de forma manual", pontos: 2 },
            { texto: "Tenho sequências de email/WhatsApp", pontos: 4 },
            { texto: "Automação completa com segmentação", pontos: 5 },
        ],
    },
    {
        id: 9,
        pergunta: "Seu site é otimizado para SEO?",
        opcoes: [
            { texto: "Não tenho site ou ele é básico", pontos: 1 },
            { texto: "Tenho site mas sem estratégia de SEO", pontos: 2 },
            { texto: "Faço SEO básico (títulos, meta descriptions)", pontos: 3 },
            { texto: "Estratégia de SEO completa com blog ativo", pontos: 5 },
        ],
    },
    {
        id: 10,
        pergunta: "Você tem processos documentados para marketing?",
        opcoes: [
            { texto: "Nada documentado", pontos: 1 },
            { texto: "Algumas anotações soltas", pontos: 2 },
            { texto: "Processos básicos em planilhas", pontos: 3 },
            { texto: "SOPs completos em ferramenta de gestão", pontos: 5 },
        ],
    },
];

const DiagnosticoMarketingPage = () => {
    const [step, setStep] = useState(0);
    const [respostas, setRespostas] = useState<number[]>([]);
    const [finalizado, setFinalizado] = useState(false);

    const handleResposta = (pontos: number) => {
        const novasRespostas = [...respostas, pontos];
        setRespostas(novasRespostas);

        if (step < perguntas.length - 1) {
            setStep(step + 1);
        } else {
            setFinalizado(true);
        }
    };

    const score = respostas.reduce((a, b) => a + b, 0);
    const maxScore = perguntas.length * 5;
    const percentual = Math.round((score / maxScore) * 100);

    const getLevel = () => {
        if (percentual >= 80) return { label: "Avançado", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: CheckCircle, desc: "Seu marketing digital está maduro. Foque em escalar e otimizar." };
        if (percentual >= 60) return { label: "Intermediário", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: CheckCircle, desc: "Boa base, mas existem gaps importantes para fechar." };
        if (percentual >= 40) return { label: "Em Desenvolvimento", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: AlertTriangle, desc: "Você tem potencial, mas precisa estruturar melhor seus processos." };
        return { label: "Iniciante", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: XCircle, desc: "Hora de profissionalizar. Cada real investido em estrutura vai multiplicar seus resultados." };
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
                title="Diagnóstico de Marketing Digital Grátis | Vurp"
                description="Faça um diagnóstico rápido do marketing digital do seu negócio. 10 perguntas para descobrir onde melhorar e como escalar seus resultados."
                path="/utilidades/diagnostico-marketing"
                breadcrumbs={[
                    { name: "Utilidades", path: "/utilidades" },
                    { name: "Diagnóstico de Marketing", path: "/utilidades/diagnostico-marketing" },
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
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {/* Progress */}
                                <div className="mb-8">
                                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                        <span>Pergunta {step + 1} de {perguntas.length}</span>
                                        <span>{Math.round(((step) / perguntas.length) * 100)}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-card border border-border/50 overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full"
                                            initial={{ width: `${((step) / perguntas.length) * 100}%` }}
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
                                className="text-center"
                            >
                                <div className={`inline-flex p-4 rounded-2xl ${level.bg} border ${level.border} mb-6`}>
                                    <level.icon className={`w-12 h-12 ${level.color}`} />
                                </div>

                                <h2 className="text-3xl font-bold mb-2">Seu nível: <span className={level.color}>{level.label}</span></h2>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto">{level.desc}</p>

                                {/* Score Circle */}
                                <div className="relative w-40 h-40 mx-auto mb-8">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" className="text-border" strokeWidth="8" fill="none" />
                                        <motion.circle
                                            cx="80" cy="80" r="70"
                                            stroke="currentColor"
                                            className={level.color}
                                            strokeWidth="8"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={440}
                                            initial={{ strokeDashoffset: 440 }}
                                            animate={{ strokeDashoffset: 440 - (440 * percentual) / 100 }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-4xl font-extrabold ${level.color}`}>{percentual}</span>
                                        <span className="text-xs text-muted-foreground">de 100</span>
                                    </div>
                                </div>

                                {/* Score breakdown */}
                                <div className="p-6 rounded-2xl bg-card border border-border/50 text-left mb-6">
                                    <h3 className="font-bold mb-4">Pontuação por área</h3>
                                    <div className="space-y-3">
                                        {perguntas.map((p, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-foreground truncate">{p.pergunta}</p>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                        <div
                                                            key={n}
                                                            className={`w-2 h-2 rounded-full ${n <= respostas[i] ? "bg-primary" : "bg-border"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground font-medium transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Refazer diagnóstico
                                    </button>
                                    <Link
                                        to="/signup"
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all"
                                    >
                                        Começar a melhorar
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

export default DiagnosticoMarketingPage;
