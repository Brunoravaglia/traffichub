import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Lucas Mendes",
        role: "Gestor de Tráfego",
        avatar: "LM",
        platforms: ["Google Ads", "Meta Ads"],
        text: "O Vurp transformou minha rotina. Antes eu gastava horas organizando planilhas, agora tudo está num lugar só. Meus clientes ficam impressionados com os relatórios.",
        stars: 5,
    },
    {
        name: "Camila Rodrigues",
        role: "Dona de Agência",
        avatar: "CR",
        platforms: ["Meta Ads", "TikTok Ads", "Google Ads"],
        text: "Gerenciar 3 gestores e 30+ clientes era um caos. Com o Vurp, tenho total controle do que cada um está fazendo. O dashboard gerencial é sensacional.",
        stars: 5,
    },
    {
        name: "Felipe Santos",
        role: "Gestor Freelancer",
        avatar: "FS",
        platforms: ["Google Ads", "LinkedIn Ads"],
        text: "O sistema de checklist mudou meu jogo. Não esqueço mais nenhuma tarefa e as conquistas me motivam a ser mais produtivo. Recomendo demais!",
        stars: 5,
    },
    {
        name: "Ana Paula Costa",
        role: "Diretora de Agência",
        avatar: "AC",
        platforms: ["Meta Ads", "TikTok Ads"],
        text: "O relatório automático economiza pelo menos 5 horas por semana da minha equipe. O ROI do Vurp se paga no primeiro mês, fácil.",
        stars: 5,
    },
];

const TestimonialsSection = () => {
    return (
        <section className="relative py-24 sm:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                        Depoimentos
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 text-foreground">
                        Quem usa, <span className="vcd-gradient-text">recomenda</span>
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
                        Veja o que gestores e agências estão falando do Vurp.
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_rgba(255,181,0,0.06)]"
                        >
                            {/* Quote icon */}
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />

                            {/* Stars */}
                            <div className="flex items-center gap-1 mb-4">
                                {Array.from({ length: t.stars }).map((_, j) => (
                                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-foreground/80 text-sm sm:text-base leading-relaxed mb-6">
                                "{t.text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                                    {t.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                                    <div className="text-xs text-muted-foreground">{t.role}</div>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5">
                                    {t.platforms.map((p, j) => (
                                        <span
                                            key={j}
                                            className="text-[10px] px-2 py-1 rounded-md bg-card border border-border/30 text-muted-foreground"
                                        >
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
