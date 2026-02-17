import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
    {
        question: "O que conta como uma 'conta' no plano?",
        answer:
            "Cada plataforma de anúncios de um cliente conta como uma conta separada. Por exemplo, se o cliente João usa Google Ads e Meta Ads, isso equivale a 2 contas no sistema. Isso nos permite oferecer preços justos baseados no volume real de trabalho.",
    },
    {
        question: "Posso mudar de plano a qualquer momento?",
        answer:
            "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A mudança entra em vigor imediatamente e o valor é ajustado proporcionalmente no próximo ciclo de cobrança.",
    },
    {
        question: "Existe um período de teste grátis?",
        answer:
            "Sim, oferecemos 7 dias grátis para você testar todas as funcionalidades sem compromisso. Não pedimos cartão de crédito no cadastro. Ao final do período, você escolhe o plano que melhor se encaixa.",
    },
    {
        question: "Como funciona o controle de gestores no plano Agência?",
        answer:
            "No plano Agência, você pode ter até 3 gestores de tráfego com acesso ao sistema. Cada gestor tem seu próprio login, checklist e métricas de produtividade. No plano Agência Pro, são até 5 gestores com monitoramento de tempo e controle de acessos.",
    },
    {
        question: "Quais plataformas de anúncios são suportadas?",
        answer:
            "Atualmente suportamos Google Ads, Meta Ads (Facebook/Instagram), TikTok Ads e LinkedIn Ads. Nossos relatórios permitem inserir métricas de todas essas plataformas e gerar análises comparativas.",
    },
    {
        question: "Posso personalizar os relatórios com minha marca?",
        answer:
            "Com certeza! Você pode adicionar seu logo, personalizar cores e usar modelos de relatório customizáveis. Os PDFs exportados ficam com a cara da sua agência, prontos para enviar ao cliente.",
    },
    {
        question: "Meus dados estão seguros?",
        answer:
            "Seus dados são armazenados de forma segura usando Supabase com criptografia em trânsito e em repouso. Todo o acesso é protegido por autenticação e cada gestor tem suas próprias credenciais.",
    },
];

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="relative py-24 sm:py-32 overflow-hidden">
            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                        FAQ
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 text-foreground">
                        Perguntas <span className="vcd-gradient-text">frequentes</span>
                    </h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        Tire suas dúvidas antes de começar.
                    </p>
                </motion.div>

                {/* FAQ Items */}
                <div className="space-y-3">
                    {faqs.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className={`rounded-xl border transition-all duration-300 ${isOpen
                                        ? "border-primary/30 bg-card/60 shadow-[0_0_20px_rgba(255,181,0,0.06)]"
                                        : "border-border/50 bg-card/30 hover:border-border"
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                                >
                                    <span className={`text-sm sm:text-base font-medium pr-4 transition-colors ${isOpen ? "text-primary" : "text-foreground"}`}>
                                        {faq.question}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex-shrink-0"
                                    >
                                        <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
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
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
