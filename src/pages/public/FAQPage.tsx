import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";

interface FAQ {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQ[] = [
    // Geral
    { category: "Geral", question: "O que é o Vurp?", answer: "O Vurp é uma plataforma SaaS completa para gestores de tráfego pago. Ele centraliza a gestão de clientes, checklists, relatórios, calendário, produtividade e finanças num único sistema." },
    { category: "Geral", question: "Para quem o Vurp é indicado?", answer: "Para gestores de tráfego independentes, freelancers de mídia paga, e donos de agências que gerenciam campanhas em Google Ads, Meta Ads, TikTok Ads e LinkedIn Ads." },
    { category: "Geral", question: "Preciso instalar algo?", answer: "Não! O Vurp é 100% online. Basta acessar pelo navegador em qualquer dispositivo. Funciona em desktop, tablet e celular." },
    { category: "Geral", question: "O Vurp funciona em dispositivos móveis?", answer: "Sim, a plataforma é totalmente responsiva e funciona perfeitamente em smartphones e tablets." },
    // Planos
    { category: "Planos", question: "O que conta como uma 'conta' no plano?", answer: "Cada plataforma de anúncios de um cliente conta como uma conta separada. Por exemplo, se o cliente João usa Google Ads e Meta Ads, isso equivale a 2 contas no sistema." },
    { category: "Planos", question: "Posso mudar de plano a qualquer momento?", answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A mudança entra em vigor imediatamente e o valor é ajustado proporcionalmente." },
    { category: "Planos", question: "Existe um período de teste grátis?", answer: "Sim, oferecemos 7 dias grátis para testar todas as funcionalidades sem compromisso. Não pedimos cartão de crédito no cadastro." },
    { category: "Planos", question: "Qual a diferença entre Agência e Agência Pro?", answer: "O plano Agência suporta até 3 gestores, enquanto o Pro suporta até 5 gestores e inclui monitoramento de tempo e controle de acessos da equipe." },
    { category: "Planos", question: "Existe desconto para plano anual?", answer: "Sim! No plano anual você economiza 20% comparado ao pagamento mensal. O desconto é aplicado automaticamente na página de preços." },
    // Pagamento
    { category: "Pagamento", question: "Quais formas de pagamento são aceitas?", answer: "Aceitamos cartão de crédito (Visa, Mastercard, Elo, Amex), PIX e boleto bancário. Os pagamentos são processados de forma segura via Stripe." },
    { category: "Pagamento", question: "Como funciona o cancelamento?", answer: "Você pode cancelar a qualquer momento diretamente pelo painel de configurações da sua conta. Não há fidelidade ou multa por cancelamento. Seu acesso continua até o fim do período pago." },
    { category: "Pagamento", question: "Emitem nota fiscal?", answer: "Sim, emitimos nota fiscal para todos os planos. A nota é enviada automaticamente para o email cadastrado após a confirmação do pagamento." },
    // Técnico
    { category: "Técnico", question: "Como funciona o controle de gestores?", answer: "No plano Agência, você pode ter até 3 gestores com acesso ao sistema, cada um com login próprio, checklist e métricas. No Pro, são até 5 gestores com monitoramento de tempo." },
    { category: "Técnico", question: "Quais plataformas de anúncios são suportadas?", answer: "Google Ads, Meta Ads (Facebook/Instagram), TikTok Ads e LinkedIn Ads. Nossos relatórios permitem métricas de todas essas plataformas." },
    { category: "Técnico", question: "Posso personalizar os relatórios?", answer: "Sim! Você pode adicionar seu logo, personalizar cores e usar modelos customizáveis. Os PDFs exportados ficam com a cara da sua agência." },
    { category: "Técnico", question: "Meus dados estão seguros?", answer: "Seus dados são armazenados com criptografia em trânsito e em repouso. Todo acesso é protegido por autenticação e cada gestor tem credenciais exclusivas." },
    { category: "Técnico", question: "Posso exportar meus dados?", answer: "Sim, você pode exportar relatórios em PDF e exportar dados de clientes a qualquer momento. Seus dados são seus." },
];

const categories = ["Todos", "Geral", "Planos", "Pagamento", "Técnico"];

const FAQPage = () => {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const filtered = useMemo(() => {
        return faqs.filter((faq) => {
            const matchesCategory = activeCategory === "Todos" || faq.category === activeCategory;
            const matchesSearch =
                !search ||
                faq.question.toLowerCase().includes(search.toLowerCase()) ||
                faq.answer.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [search, activeCategory]);

    return (
        <PublicLayout>
            <SEOHead
                title="Perguntas Frequentes"
                description="Respostas rápidas sobre o Vurp: planos, pagamento, funcionalidades, segurança e mais. Tudo o que gestores de tráfego precisam saber."
                path="/faq"
                breadcrumbs={[
                    { name: "Perguntas Frequentes", path: "/faq" },
                ]}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: faqs.map((faq) => ({
                        "@type": "Question",
                        name: faq.question,
                        acceptedAnswer: {
                            "@type": "Answer",
                            text: faq.answer,
                        },
                    })),
                }}
            />
            <section className="py-16 sm:py-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground">
                            Perguntas <span className="vcd-gradient-text">Frequentes</span>
                        </h1>
                        <p className="text-muted-foreground mt-4 text-lg">
                            Encontre respostas rápidas para suas dúvidas.
                        </p>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative mb-8"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar pergunta..."
                            className="pl-12 h-12 bg-card/40 border-border/50 text-base"
                        />
                    </motion.div>

                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-2 mb-8"
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat
                                    ? "bg-primary/15 text-primary border border-primary/30"
                                    : "bg-card/50 text-muted-foreground border border-border/30 hover:text-foreground"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </motion.div>

                    {/* FAQ Items */}
                    <div className="space-y-3">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Nenhuma pergunta encontrada para "{search}"</p>
                            </div>
                        ) : (
                            filtered.map((faq, i) => {
                                const isOpen = openIndex === i;
                                return (
                                    <motion.div
                                        key={faq.question}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: i * 0.03 }}
                                        className={`rounded-xl border transition-all duration-300 ${isOpen
                                            ? "border-primary/30 bg-card/60 shadow-[0_0_20px_rgba(255,181,0,0.06)]"
                                            : "border-border/50 bg-card/30 hover:border-border"
                                            }`}
                                    >
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : i)}
                                            className="w-full flex items-center justify-between px-6 py-5 text-left"
                                        >
                                            <div className="pr-4">
                                                <span className="text-xs text-primary/60 font-medium uppercase tracking-wider">{faq.category}</span>
                                                <span className={`block text-sm sm:text-base font-medium mt-1 transition-colors ${isOpen ? "text-primary" : "text-foreground"}`}>
                                                    {faq.question}
                                                </span>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="flex-shrink-0"
                                            >
                                                <ChevronDown className={`w-5 h-5 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
                                            </motion.div>
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

                    {/* Contact CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="mt-12 rounded-2xl border border-border/50 bg-card/30 p-8 text-center"
                    >
                        <p className="text-foreground font-medium mb-2">Não encontrou o que procura?</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            Nossa equipe está pronta para ajudar.
                        </p>
                        <a href="/support">
                            <button className="text-primary font-semibold text-sm hover:underline">
                                Falar com suporte →
                            </button>
                        </a>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default FAQPage;
