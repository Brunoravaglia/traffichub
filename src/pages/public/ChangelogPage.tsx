import { motion } from "framer-motion";
import HomeNavbar from "@/components/home/HomeNavbar";
import FooterSection from "@/components/home/FooterSection";
import { CheckCircle2, Rocket, Wrench, Bug, Sparkles, Activity } from "lucide-react";

interface ReleaseItem {
    id: string;
    version: string;
    date: string;
    title: string;
    description: string;
    type: "feature" | "fix" | "improvement";
    items: string[];
}

const releases: ReleaseItem[] = [
    {
        id: "v1.2.0",
        version: "v1.2.0",
        date: "Fevereiro 20, 2026",
        title: "Validação Automática e Novos Modelos",
        description: "Nesta atualização focamos em segurança e precisão para os relatórios emitidos.",
        type: "feature",
        items: [
            "ID de Validação: Agora todo relatório tem um UUID próprio e um link verificável via QR/URL.",
            "Cálculo Dinâmico de Saldo: O dashboard de clientes agora gasta perfeitamente o saldo com base nos dias corridos.",
            "Gestão de Modelos: Gestores agora podem criar, duplicar e excluir completamente os modelos de relatório."
        ]
    },
    {
        id: "v1.1.0",
        version: "v1.1.0",
        date: "Fevereiro 18, 2026",
        title: "Novas Ferramentas de Marketing",
        description: "Lançamento oficial da central de utilidades gratuitas para gestores de tráfego.",
        type: "feature",
        items: [
            "Calculadora de ROAS e ROI",
            "Simulador de Funil de Vendas",
            "Gerador de UTM para campanhas de Ads",
            "Calculadora de Markup",
            "Score de Maturidade Digital e Diagnóstico de Marketing"
        ]
    },
    {
        id: "v1.0.5",
        version: "v1.0.5",
        date: "Fevereiro 15, 2026",
        title: "Melhorias de Estabilidade no Blog",
        description: "Ajustes essenciais na estrutura de gerenciamento de cache de artigos.",
        type: "fix",
        items: [
            "Correção da tela branca (\'White screen\') que ocorria ao carregar posts antigos.",
            "Otimização no carregamento de imagens dos artigos.",
            "Melhoria na indexação SEO da plataforma."
        ]
    },
    {
        id: "v1.0.0",
        version: "v1.0.0",
        date: "Fevereiro 01, 2026",
        title: "Lançamento Oficial Vurp",
        description: "Versão inicial da plataforma completa para gestores de tráfego, agências e consultores.",
        type: "feature",
        items: [
            "Dashboard unificado de clientes.",
            "Conexão com API do Google e Meta Ads.",
            "Geração de relatórios com exportação para PDF 100% customizável."
        ]
    }
];

const getTypeIcon = (type: ReleaseItem["type"]) => {
    switch (type) {
        case "feature":
            return <Rocket className="w-5 h-5 text-blue-400" />;
        case "improvement":
            return <Sparkles className="w-5 h-5 text-purple-400" />;
        case "fix":
            return <Bug className="w-5 h-5 text-green-400" />;
        default:
            return <Wrench className="w-5 h-5 text-gray-400" />;
    }
};

const getTypeColor = (type: ReleaseItem["type"]) => {
    switch (type) {
        case "feature":
            return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        case "improvement":
            return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        case "fix":
            return "bg-green-500/10 text-green-400 border-green-500/20";
        default:
            return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
};

const getTypeName = (type: ReleaseItem["type"]) => {
    switch (type) {
        case "feature": return "Nova Funcionalidade";
        case "improvement": return "Melhoria";
        case "fix": return "Correção";
        default: return "Atualização";
    }
};

const ChangelogPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <HomeNavbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="mb-16 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-6"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-medium">Todos os sistemas operacionais</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
                        >
                            Changelog & Atualizações
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-gray-400 max-w-2xl mx-auto"
                        >
                            Acompanhe as últimas novidades, correções de bugs e melhorias lançadas na plataforma. Trabalhamos todos os dias para tornar sua vida mais fácil.
                        </motion.p>
                    </div>

                    {/* Timeline */}
                    <div className="relative border-l border-white/10 ml-4 md:ml-8 space-y-16 pb-12">
                        {releases.map((release, index) => (
                            <motion.div
                                key={release.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className="relative pl-8 md:pl-12"
                            >
                                {/* Timeline Dot */}
                                <div className="absolute -left-[5px] top-6 w-[11px] h-[11px] rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 hover:bg-white/[0.07] transition-colors relative overflow-hidden group">
                                    {/* Subtle gradient background */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                                {release.version}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getTypeColor(release.type)}`}>
                                                    {getTypeIcon(release.type)}
                                                    {getTypeName(release.type)}
                                                </span>
                                                <span className="text-sm text-gray-500 font-medium">
                                                    {release.date}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-semibold text-gray-200 mb-3 block">
                                            {release.title}
                                        </h3>

                                        <p className="text-gray-400 mb-6 leading-relaxed">
                                            {release.description}
                                        </p>

                                        <ul className="space-y-3">
                                            {release.items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                    <span className="leading-relaxed">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                        <Activity className="w-10 h-10 text-primary mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Encontrou algum problema?</h3>
                        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                            Nossa equipe de engenharia está sempre monitorando o sistema, mas se você notar algo estranho, não hesite em nos relatar.
                        </p>
                        <button
                            onClick={() => window.location.href = "mailto:suporte@vocedigitalpropaganda.com.br"}
                            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                        >
                            Reportar Bug
                        </button>
                    </motion.div>

                </div>
            </main>

            <FooterSection />
        </div>
    );
};

export default ChangelogPage;
