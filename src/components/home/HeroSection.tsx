import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { FaGoogle, FaMeta, FaTiktok, FaLinkedin } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ParticleNetwork from "./ParticleNetwork";
import { useEffect, useState } from "react";

const badges = [
    { label: "Google Ads", icon: FaGoogle, delay: 0.8 },
    { label: "Meta Ads", icon: FaMeta, delay: 1.0 },
    { label: "TikTok Ads", icon: FaTiktok, delay: 1.2 },
    { label: "LinkedIn Ads", icon: FaLinkedin, delay: 1.4 },
];

const counters = [
    { label: "Contas gerenciadas", target: 2500, suffix: "+" },
    { label: "Relatórios gerados", target: 12000, suffix: "+" },
    { label: "Gestores ativos", target: 350, suffix: "+" },
];

function useAnimatedCounter(target: number, duration = 2000, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count;
}

const HeroSection = () => {
    const [inView, setInView] = useState(false);

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            {/* Particle Background */}
            <ParticleNetwork />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background pointer-events-none z-[1]" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-[1]" />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
                <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
                    {/* ─── Left: Text & CTA ─── */}
                    <div className="space-y-6">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
                        >
                            <Sparkles className="w-4 h-4" />
                            Plataforma #1 para Gestores de Tráfego
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight"
                        >
                            Chega de caos.
                            <br />
                            <span className="vcd-gradient-text">Gerencie tudo</span>
                            <br />
                            num só lugar.
                        </motion.h1>

                        {/* Sub-headline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="text-lg text-muted-foreground max-w-lg leading-relaxed"
                        >
                            Clientes, checklists, relatórios, financeiro e equipe - organizado do jeito que gestor de tráfego precisa.
                            <strong className="text-foreground"> Sem planilha. Sem improviso.</strong>
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="flex flex-col sm:flex-row items-start gap-4 pt-2"
                        >
                            <Link to="/signup">
                                <Button
                                    size="lg"
                                    className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow transition-all duration-300 hover:scale-105 group"
                                >
                                    Começar Agora - Grátis
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <button
                                onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}
                                className="h-14 px-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium rounded-xl border border-border/50 hover:border-border hover:bg-card/50"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Ver como funciona
                            </button>
                        </motion.div>

                        {/* Platform Badges */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="flex flex-wrap lg:flex-nowrap items-center gap-3 pt-2"
                        >
                            <span className="text-xs text-muted-foreground mr-1">Integrações:</span>
                            {badges.map((badge) => (
                                <motion.div
                                    key={badge.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: badge.delay }}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50 text-[11px] font-medium text-foreground cursor-default whitespace-nowrap"
                                >
                                    <badge.icon className="w-3 h-3 text-primary shrink-0" />
                                    {badge.label}
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* ─── Right: Dashboard Screenshot ─── */}
                    <motion.div
                        initial={{ opacity: 0, x: 60, rotateY: -8 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="relative hidden lg:block"
                    >
                        {/* Glow behind */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-3xl blur-3xl" />
                        <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl" />

                        {/* Browser frame */}
                        <div className="relative rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm shadow-2xl overflow-hidden">
                            {/* Browser chrome bar */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-background/60 border-b border-border/40">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                </div>
                                <div className="flex-1 mx-8">
                                    <div className="bg-background/80 rounded-md px-3 py-1.5 text-xs text-muted-foreground text-center border border-border/30">
                                        app.vurp.com.br
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard screenshot */}
                            <img
                                src="/hero-dashboard.png"
                                alt="Dashboard real do Vurp - gestão de clientes, checklists e relatórios"
                                className="w-full h-auto"
                                loading="eager"
                            />
                        </div>

                        {/* Floating stat cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.6 }}
                            className="absolute -bottom-4 -left-6 px-4 py-3 rounded-xl bg-card border border-border/60 shadow-xl backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <span className="text-green-400 text-lg">📈</span>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Clientes ativos</p>
                                    <p className="text-lg font-bold text-foreground">48</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4, duration: 0.6 }}
                            className="absolute -top-3 -right-4 px-4 py-3 rounded-xl bg-card border border-border/60 shadow-xl backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary text-lg">🏆</span>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Relatórios / mês</p>
                                    <p className="text-lg font-bold text-foreground">127</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Counters - full width below */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    onViewportEnter={() => setInView(true)}
                    viewport={{ once: true }}
                    transition={{ delay: 1.6, duration: 0.8 }}
                    className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 pt-16 mt-8 border-t border-border/30"
                >
                    {counters.map((counter) => (
                        <CounterItem
                            key={counter.label}
                            label={counter.label}
                            target={counter.target}
                            suffix={counter.suffix}
                            inView={inView}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

function CounterItem({
    label,
    target,
    suffix,
    inView,
}: {
    label: string;
    target: number;
    suffix: string;
    inView: boolean;
}) {
    const count = useAnimatedCounter(target, 2000, inView);
    return (
        <div className="text-center">
            <div className="text-3xl sm:text-4xl font-extrabold vcd-gradient-text tabular-nums">
                {count.toLocaleString("pt-BR")}
                {suffix}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{label}</div>
        </div>
    );
}

export default HeroSection;
