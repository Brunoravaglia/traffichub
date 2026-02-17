import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Shield,
    Lock,
    Eye,
    Trash2,
    Server,
    ArrowRight,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    KeyRound,
    DatabaseZap,
    FileWarning,
} from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";

const securityFeatures = [
    {
        icon: KeyRound,
        title: "Sem senhas armazenadas",
        desc: "O Vurp nunca armazena senhas de plataformas de anúncios. Sua gestão é 100% independente - não conectamos às suas contas de ads.",
        color: "text-green-400",
        bg: "bg-green-500/10",
    },
    {
        icon: DatabaseZap,
        title: "Sem pixels ou APIs de clientes",
        desc: "Não hospedamos pixels de rastreamento nem APIs dos seus clientes. Seus dados de campanha ficam nas plataformas oficiais - aqui você só organiza.",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    {
        icon: Server,
        title: "Zero risco de hacking",
        desc: "Como não temos acesso às suas contas, não existe superfície de ataque. Mesmo que nosso servidor sofresse um ataque, seus ads e pixels estariam 100% seguros.",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
    {
        icon: Lock,
        title: "Criptografia AES-256",
        desc: "Todos os dados que você insere no Vurp são criptografados em repouso e em trânsito com AES-256, o mesmo padrão usado por bancos.",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
    },
];

const lgpdPoints = [
    {
        icon: Eye,
        title: "Consentimento explícito",
        desc: "Você sabe exatamente quais dados coletamos e para que servem. Nada é coletado sem sua autorização.",
    },
    {
        icon: Trash2,
        title: "Direito de exclusão",
        desc: "Solicite a exclusão de todos os seus dados a qualquer momento. Processamos em até 48 horas.",
    },
    {
        icon: FileWarning,
        title: "Minimização de dados",
        desc: "Só coletamos o estritamente necessário para o funcionamento do serviço. Nada a mais.",
    },
    {
        icon: ShieldCheck,
        title: "Transparência total",
        desc: "Nossa política de privacidade é clara, acessível e escrita em linguagem simples - sem juridiquês.",
    },
];

const comparisonData = [
    { criteria: "Backup", local: "Depende de você", vurp: "Automático diário" },
    { criteria: "Criptografia", local: "Nenhuma", vurp: "AES-256" },
    { criteria: "Acesso após roubo/perda", local: "Perdeu tudo", vurp: "Acesso de qualquer lugar" },
    { criteria: "Compartilhamento", local: "Link do Google Drive", vurp: "Permissões granulares" },
    { criteria: "Conformidade legal", local: "Nenhuma", vurp: "LGPD compliant" },
    { criteria: "Senhas de ads salvas", local: "Na planilha 😰", vurp: "Nunca armazenamos ✅" },
];

const LGPDPage = () => {
    return (
        <PublicLayout>
            <SEOHead
                title="LGPD & Segurança | Vurp"
                description="O Vurp não armazena senhas, pixels ou APIs dos seus clientes. Saiba como protegemos seus dados e garantimos conformidade total com a LGPD."
                path="/lgpd"
                breadcrumbs={[
                    { name: "LGPD & Segurança", path: "/lgpd" },
                ]}
            />

            {/* Hero */}
            <section className="py-16 sm:py-24 relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
                            <Shield className="w-4 h-4" />
                            Segurança & Privacidade
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
                            Seus dados estão{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                100% seguros
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            O Vurp <strong className="text-foreground">não armazena senhas, pixels ou APIs</strong> dos
                            seus clientes. Isso significa que{" "}
                            <strong className="text-foreground">não existe risco de hacking</strong> para
                            suas contas de anúncios.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Security Features */}
            <section className="pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        {securityFeatures.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="rounded-2xl bg-card border border-border/50 p-8 hover:border-green-500/20 transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-5`}>
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Big security statement */}
            <section className="py-16 sm:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" />
                        <div className="absolute inset-0 border border-green-500/20 rounded-3xl" />
                        <div className="relative px-8 py-14 sm:px-16 sm:py-20 text-center space-y-6">
                            <Shield className="w-16 h-16 text-green-400 mx-auto opacity-80" />
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                                "Mesmo que nosso servidor fosse comprometido,{" "}
                                <span className="text-green-400">suas contas de ads estariam 100% seguras</span>
                                "
                            </h2>
                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Porque simplesmente não temos acesso a elas. O Vurp é uma
                                ferramenta de <strong className="text-foreground">organização</strong>, não de{" "}
                                <strong className="text-foreground">integração</strong>.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* LGPD Compliance */}
            <section className="py-16 sm:py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Conformidade com a LGPD
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            O Vurp segue integralmente a{" "}
                            <strong className="text-foreground">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {lgpdPoints.map((item, i) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="flex gap-4 p-6 rounded-xl bg-card/50 border border-border/30"
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <item.icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-16 sm:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                            Seus dados online vs. na planilha
                        </h2>
                        <p className="text-muted-foreground">
                            Ironicamente, seus dados estão <strong className="text-foreground">mais seguros no Vurp</strong>{" "}
                            do que em uma planilha no seu computador sem backup.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-2xl overflow-hidden border border-border/50"
                    >
                        <table className="w-full">
                            <thead>
                                <tr className="bg-card border-b-2 border-primary/20">
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Critério</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-red-400">Planilha Local</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-green-400">Vurp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonData.map((row, i) => (
                                    <tr
                                        key={row.criteria}
                                        className={`border-b border-border/30 transition-colors hover:bg-card/60 ${i % 2 === 0 ? "bg-card/20" : ""
                                            }`}
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-foreground">{row.criteria}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            {row.local}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-foreground/80">
                                            <span className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                                {row.vurp}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </section>

            {/* Data handling on cancellation */}
            <section className="py-16 sm:py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                            O que acontece com meus dados se eu cancelar?
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
                            {[
                                "Ficam inacessíveis imediatamente",
                                "Guardados por 30 dias (caso mude de ideia)",
                                "Apagados permanentemente após 30 dias",
                                "Exclusão imediata disponível sob solicitação",
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-3 p-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-amber-500/10 to-transparent" />
                        <div className="absolute inset-0 border border-primary/20 rounded-2xl" />
                        <div className="relative px-8 py-12 sm:px-12 sm:py-16 text-center space-y-6">
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                Pronto para trabalhar com{" "}
                                <span className="vcd-gradient-text">segurança</span>?
                            </h2>
                            <p className="text-muted-foreground max-w-lg mx-auto">
                                Teste o Vurp gratuitamente e trabalhe com a certeza de que
                                seus dados estão protegidos.
                            </p>
                            <Link to="/signup">
                                <Button
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-105"
                                >
                                    Começar grátis
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default LGPDPage;
