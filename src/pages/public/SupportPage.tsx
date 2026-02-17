import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MessageCircle, Clock, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PublicLayout from "@/components/home/PublicLayout";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

const topics = [
    "Dúvida sobre planos",
    "Problemas técnicos",
    "Conta e assinatura",
    "Sugestão de funcionalidade",
    "Relatórios e exportação",
    "Outro",
];

const helpArticles = [
    { title: "Como criar meu primeiro relatório", category: "Relatórios" },
    { title: "Configurando o checklist por cliente", category: "Checklist" },
    { title: "Gerenciando múltiplos gestores", category: "Equipe" },
    { title: "Entendendo o controle financeiro", category: "Financeiro" },
    { title: "Exportando relatórios em PDF", category: "Relatórios" },
    { title: "Trocando ou cancelando meu plano", category: "Assinatura" },
];

const SupportPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [topic, setTopic] = useState("");
    const [message, setMessage] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: integrate with email service/Supabase
        console.log("Support form:", { name, email, topic, message });
        setSent(true);
    };

    return (
        <PublicLayout>
            <SEOHead
                title="Suporte"
                description="Precisa de ajuda? Acesse a Central de Suporte do Vurp - formulário de contato, WhatsApp, email e base de conhecimento com artigos rápidos."
                path="/support"
                breadcrumbs={[
                    { name: "Suporte", path: "/support" },
                ]}
            />
            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground">
                            Central de <span className="vcd-gradient-text">Suporte</span>
                        </h1>
                        <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
                            Estamos aqui para ajudar. Entre em contato ou explore nossos recursos.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {sent ? (
                                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Mensagem enviada!</h3>
                                    <p className="text-muted-foreground">
                                        Recebemos sua mensagem e responderemos em até 24 horas úteis.
                                    </p>
                                    <Button variant="ghost" onClick={() => setSent(false)} className="mt-4 text-primary">
                                        Enviar outra mensagem
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-8 space-y-5">
                                    <h2 className="text-xl font-bold text-foreground mb-2">Formulário de Contato</h2>

                                    <div>
                                        <label className="text-sm text-muted-foreground mb-1.5 block">Nome</label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Seu nome"
                                            required
                                            className="bg-card/60 border-border/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            required
                                            className="bg-card/60 border-border/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm text-muted-foreground mb-1.5 block">Assunto</label>
                                        <select
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            required
                                            className="w-full rounded-md border border-border/50 bg-card/60 text-foreground text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">Selecione um assunto</option>
                                            {topics.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-muted-foreground mb-1.5 block">Mensagem</label>
                                        <Textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Descreva sua dúvida ou problema em detalhes..."
                                            required
                                            rows={5}
                                            className="bg-card/60 border-border/50 resize-none"
                                        />
                                    </div>

                                    <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar Mensagem
                                    </Button>
                                </form>
                            )}
                        </motion.div>

                        {/* Contact Info & Resources */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Contact channels */}
                            <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
                                <h3 className="text-lg font-bold text-foreground mb-4">Canais de contato</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Email</p>
                                            <p className="text-sm text-muted-foreground">suporte@vurp.com.br</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                            <MessageCircle className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">WhatsApp</p>
                                            <p className="text-sm text-muted-foreground">(11) 99999-9999</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Horário de Atendimento</p>
                                            <p className="text-sm text-muted-foreground">Seg–Sex, 9h às 18h (BRT)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick links */}
                            <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-bold text-foreground">Base de Conhecimento</h3>
                                </div>
                                <div className="space-y-2">
                                    {helpArticles.map((article) => (
                                        <div
                                            key={article.title}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-card/60 transition-colors cursor-pointer group"
                                        >
                                            <div>
                                                <p className="text-sm text-foreground group-hover:text-primary transition-colors">{article.title}</p>
                                                <p className="text-xs text-muted-foreground">{article.category}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FAQ link */}
                            <Link to="/faq" className="block">
                                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center hover:bg-primary/10 transition-colors">
                                    <p className="text-sm font-medium text-foreground mb-1">Procurando a resposta rápida?</p>
                                    <p className="text-primary font-semibold">Acesse nosso FAQ →</p>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default SupportPage;
