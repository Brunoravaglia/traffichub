import { useState } from "react";
import CalculatorLayout from "@/components/calculators/CalculatorLayout";
import { motion } from "framer-motion";
import { Copy, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const presets = {
    source: ["facebook", "instagram", "google", "tiktok", "linkedin", "email", "whatsapp", "youtube"],
    medium: ["cpc", "cpm", "social", "email", "organic", "referral", "banner", "video"],
};

const GeradorUTMPage = () => {
    const [url, setUrl] = useState("");
    const [source, setSource] = useState("");
    const [medium, setMedium] = useState("");
    const [campaign, setCampaign] = useState("");
    const [term, setTerm] = useState("");
    const [content, setContent] = useState("");
    const [copied, setCopied] = useState(false);

    const buildUTM = () => {
        if (!url) return "";
        const params = new URLSearchParams();
        if (source) params.set("utm_source", source.toLowerCase().trim());
        if (medium) params.set("utm_medium", medium.toLowerCase().trim());
        if (campaign) params.set("utm_campaign", campaign.toLowerCase().trim().replace(/\s+/g, "-"));
        if (term) params.set("utm_term", term.toLowerCase().trim().replace(/\s+/g, "-"));
        if (content) params.set("utm_content", content.toLowerCase().trim().replace(/\s+/g, "-"));
        const separator = url.includes("?") ? "&" : "?";
        return params.toString() ? `${url}${separator}${params.toString()}` : url;
    };

    const finalUrl = buildUTM();
    const hasResult = url && source && medium && campaign;

    const handleCopy = () => {
        navigator.clipboard.writeText(finalUrl);
        setCopied(true);
        toast.success("URL copiada!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setUrl("");
        setSource("");
        setMedium("");
        setCampaign("");
        setTerm("");
        setContent("");
    };

    return (
        <CalculatorLayout
            title="Gerador de UTMs"
            subtitle="Campaign URL Builder"
            description="Monte URLs com parâmetros UTM para rastrear a origem dos seus cliques no Google Analytics. Saiba exatamente de onde vem cada lead."
            seoTitle="Gerador de UTMs Online Grátis - Google Analytics | Vurp"
            seoDescription="Gere URLs com parâmetros UTM para rastrear campanhas no Google Analytics. Monte links trackados para Meta Ads, Google Ads, e-mail e mais."
            path="/utilidades/gerador-utm"
            interpretation={
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="text-primary font-medium">utm_source:</span> De onde vem o tráfego (facebook, google, email)</p>
                    <p><span className="text-primary font-medium">utm_medium:</span> Tipo de mídia (cpc, social, email, banner)</p>
                    <p><span className="text-primary font-medium">utm_campaign:</span> Nome da campanha para identificação</p>
                    <p><span className="text-primary font-medium">utm_term:</span> Palavra-chave paga (opcional)</p>
                    <p><span className="text-primary font-medium">utm_content:</span> Variação do anúncio para testes A/B (opcional)</p>
                </div>
            }
        >
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50">
                {/* URL */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">URL de Destino *</label>
                    <input
                        type="url"
                        placeholder="https://seusite.com.br/pagina"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors"
                    />
                </div>

                {/* Source */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">utm_source *</label>
                    <input
                        type="text"
                        placeholder="Ex: facebook"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors mb-2"
                    />
                    <div className="flex flex-wrap gap-1.5">
                        {presets.source.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSource(s)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${source === s
                                        ? "bg-primary/10 text-primary border border-primary/30"
                                        : "text-muted-foreground hover:text-foreground border border-border/50 hover:border-border"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Medium */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">utm_medium *</label>
                    <input
                        type="text"
                        placeholder="Ex: cpc"
                        value={medium}
                        onChange={(e) => setMedium(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors mb-2"
                    />
                    <div className="flex flex-wrap gap-1.5">
                        {presets.medium.map((m) => (
                            <button
                                key={m}
                                onClick={() => setMedium(m)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${medium === m
                                        ? "bg-primary/10 text-primary border border-primary/30"
                                        : "text-muted-foreground hover:text-foreground border border-border/50 hover:border-border"
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Campaign */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">utm_campaign *</label>
                    <input
                        type="text"
                        placeholder="Ex: lancamento-produto-janeiro"
                        value={campaign}
                        onChange={(e) => setCampaign(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors"
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {/* Term */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">utm_term (opcional)</label>
                        <input
                            type="text"
                            placeholder="Palavra-chave"
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors"
                        />
                    </div>
                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">utm_content (opcional)</label>
                        <input
                            type="text"
                            placeholder="Variação do anúncio"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-foreground transition-colors"
                        />
                    </div>
                </div>

                {/* Result */}
                {hasResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        <label className="block text-sm font-medium text-foreground">URL com UTMs</label>
                        <div className="p-4 rounded-xl bg-background/80 border border-border/50 break-all text-sm text-primary font-mono">
                            {finalUrl}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copiado!" : "Copiar URL"}
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted-foreground font-medium text-sm hover:text-foreground hover:border-border/80 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Limpar
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </CalculatorLayout>
    );
};

export default GeradorUTMPage;
