import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { motion } from "framer-motion";
import { Copy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const templates = {
    urgente: [
        "Último dia: {produto} com {desconto}% OFF para {publico}",
        "{publico}: vagas limitadas para {produto}",
        "Atenção {publico}! {beneficio} antes que acabe",
        "Só hoje: {produto} pela metade do preço para {publico}",
        "Corra! Restam poucas unidades de {produto}",
        "Faltam 24h para você garantir {beneficio}",
        "{publico}, essa oferta de {produto} não vai durar",
        "Alerta: {produto} nunca esteve tão acessível",
    ],
    aspiracional: [
        "Como {publico} estão alcançando {beneficio} com {produto}",
        "O segredo dos melhores {publico}: {produto}",
        "Imagine {beneficio} em apenas 30 dias",
        "{beneficio}: o passo que falta para {publico} de sucesso",
        "De {publico} comum a referência no mercado com {produto}",
        "A estratégia que mudou o jogo para {publico}",
        "{publico} que usam {produto} faturam 3x mais",
        "Transforme seus resultados: {produto} para {publico}",
    ],
    educativo: [
        "Guia completo: como {publico} podem {beneficio}",
        "5 erros de {publico} que impedem {beneficio}",
        "O que todo {publico} precisa saber sobre {produto}",
        "Passo a passo: {beneficio} usando {produto}",
        "{produto}: tudo que {publico} precisam dominar",
        "3 estratégias de {produto} que {publico} ignoram",
        "Como calcular {beneficio} do seu {produto}",
        "O guia definitivo de {produto} para {publico}",
    ],
    social: [
        "🔥 {publico}, {produto} que transforma {beneficio}",
        "✅ Comprovado: {produto} gera {beneficio} para {publico}",
        "📊 Dados mostram: {publico} com {produto} têm {beneficio}",
        "💡 {publico}! Descubra como {produto} gera {beneficio}",
        "🚀 De 0 a {beneficio}: {produto} para {publico}",
        "⚡ {publico} que descobriram {produto} não voltam atrás",
        "🎯 {produto}: a arma secreta dos {publico} de elite",
        "📈 {beneficio} garantido com {produto} para {publico}",
    ],
};

const tons = [
    { id: "urgente", label: "Urgência", emoji: "🔴" },
    { id: "aspiracional", label: "Aspiracional", emoji: "⭐" },
    { id: "educativo", label: "Educativo", emoji: "📚" },
    { id: "social", label: "Social Media", emoji: "📱" },
];

const GeradorHeadlinesPage = () => {
    const [nicho, setNicho] = useState("");
    const [produto, setProduto] = useState("");
    const [publico, setPublico] = useState("");
    const [beneficio, setBeneficio] = useState("");
    const [desconto, setDesconto] = useState("50");
    const [tom, setTom] = useState("urgente");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [seed, setSeed] = useState(0);

    const hasInput = produto && publico && beneficio;

    const generateHeadlines = () => {
        const tmps = templates[tom as keyof typeof templates] || templates.urgente;
        return tmps.map((t) =>
            t
                .replace(/\{produto\}/g, produto)
                .replace(/\{publico\}/g, publico)
                .replace(/\{beneficio\}/g, beneficio)
                .replace(/\{desconto\}/g, desconto)
        );
    };

    const headlines = hasInput ? generateHeadlines() : [];

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success("Headline copiada!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <CalculatorLayout
            title="Gerador de Headlines"
            subtitle="Copy persuasiva em segundos"
            description="Gere headlines de alta conversão para anúncios, landing pages e posts. Escolha o tom e receba sugestões prontas para usar."
            seoTitle="Gerador de Headlines para Anúncios Grátis | Vurp"
            seoDescription="Gere headlines persuasivas para Facebook Ads, Google Ads, landing pages e redes sociais. Ferramenta gratuita com templates de alta conversão."
            path="/utilidades/gerador-headlines"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-red-400 font-medium">Urgência:</span> Ideal para promoções, prazos e escassez</p>
                    <p><span className="text-amber-400 font-medium">Aspiracional:</span> Para produtos premium e transformação</p>
                    <p><span className="text-blue-400 font-medium">Educativo:</span> Para autoridade e conteúdo de valor</p>
                    <p><span className="text-pink-400 font-medium">Social Media:</span> Otimizado para engajamento em redes sociais</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                {/* Tom selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Tom da Headline</label>
                    <div className="flex flex-wrap gap-2">
                        {tons.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTom(t.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${tom === t.id
                                        ? "bg-primary/10 text-primary border border-primary/30"
                                        : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
                                    }`}
                            >
                                <span>{t.emoji}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Produto / Serviço *</label>
                        <input
                            type="text"
                            placeholder="Ex: consultoria de marketing"
                            value={produto}
                            onChange={(e) => setProduto(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Público-alvo *</label>
                        <input
                            type="text"
                            placeholder="Ex: donos de e-commerce"
                            value={publico}
                            onChange={(e) => setPublico(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Benefício principal *</label>
                        <input
                            type="text"
                            placeholder="Ex: dobrar o faturamento"
                            value={beneficio}
                            onChange={(e) => setBeneficio(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Desconto % (opcional)</label>
                        <input
                            type="number"
                            placeholder="50"
                            value={desconto}
                            onChange={(e) => setDesconto(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors"
                        />
                    </div>
                </div>

                {/* Headlines Result */}
                {headlines.length > 0 && (
                    <motion.div
                        key={`${tom}-${seed}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-foreground">{headlines.length} headlines geradas</p>
                            <button
                                onClick={() => setSeed(seed + 1)}
                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Gerar mais
                            </button>
                        </div>
                        {headlines.map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-all group"
                            >
                                <span className="text-xs text-muted-foreground font-mono w-5 shrink-0">{i + 1}.</span>
                                <p className="flex-1 text-sm text-foreground">{h}</p>
                                <button
                                    onClick={() => handleCopy(h, i)}
                                    className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </CalculatorLayout>
    );
};

export default GeradorHeadlinesPage;
