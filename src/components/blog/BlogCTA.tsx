import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Rocket } from "lucide-react";
import { motion } from "framer-motion";

interface BlogCTAProps {
    title?: string;
    subtitle?: string;
    buttonLabel?: string;
    to?: string;
    variant?: "inline" | "banner" | "image";
    imageSrc?: string;
}

/**
 * 3D tilt effect helper - tracks mouse position relative to card center
 * and applies perspective + rotateX/Y transform.
 */
const use3DTilt = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    };

    const handleMouseLeave = () => {
        setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)");
    };

    return { ref, transform, handleMouseMove, handleMouseLeave };
};

const BlogCTA = ({
    title = "Pronto para organizar sua gestão?",
    subtitle = "Teste o Vurp grátis por 7 dias - sem cartão de crédito.",
    buttonLabel = "Começar grátis",
    to = "/signup",
    variant = "inline",
    imageSrc,
}: BlogCTAProps) => {
    const tilt = use3DTilt();
    const fallbackCover = "/blog/cover-1.png";
    const handleCoverError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        if (img.src.includes(fallbackCover)) return;
        img.src = fallbackCover;
    };

    // ═══════ VARIANT: IMAGE (with side image + 3D hover) ═══════
    if (variant === "image") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-12"
            >
                <div
                    ref={tilt.ref}
                    onMouseMove={tilt.handleMouseMove}
                    onMouseLeave={tilt.handleMouseLeave}
                    style={{ transform: tilt.transform, transition: "transform 0.15s ease-out" }}
                    className="rounded-2xl overflow-hidden border border-border/50 bg-card shadow-lg"
                >
                    <div className="grid sm:grid-cols-5">
                        {/* Image */}
                        <div className="sm:col-span-2 relative overflow-hidden">
                            <img
                                src={imageSrc || "/blog/cover-1.png"}
                                alt={title}
                                className="w-full h-full object-cover min-h-[200px]"
                                onError={handleCoverError}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/60 sm:block hidden" />
                        </div>
                        {/* Content */}
                        <div className="sm:col-span-3 p-8 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium w-fit mb-4">
                                <Rocket className="w-4 h-4" />
                                Impulsione seus resultados
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                                {title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                {subtitle}
                            </p>
                            <Link to={to} className="w-fit">
                                <Button
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
                                >
                                    {buttonLabel}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ═══════ VARIANT: BANNER (full-width prominent, 3D hover) ═══════
    if (variant === "banner") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="my-12"
            >
                <div
                    ref={tilt.ref}
                    onMouseMove={tilt.handleMouseMove}
                    onMouseLeave={tilt.handleMouseLeave}
                    style={{ transform: tilt.transform, transition: "transform 0.15s ease-out" }}
                    className="relative rounded-2xl overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-amber-500/10 to-transparent" />
                    <div className="absolute inset-0 border border-primary/20 rounded-2xl" />
                    <div className="relative px-8 py-10 sm:px-12 sm:py-14 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                        <div className="flex-1 text-center sm:text-left space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                <Sparkles className="w-4 h-4" />
                                7 dias grátis
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {title}
                            </h3>
                            <p className="text-muted-foreground text-base max-w-lg">
                                {subtitle}
                            </p>
                        </div>
                        <Link to={to} className="shrink-0">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:scale-105"
                            >
                                {buttonLabel}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    // ═══════ VARIANT: INLINE (compact, subtle, 3D hover) ═══════
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="my-8"
        >
            <div
                ref={tilt.ref}
                onMouseMove={tilt.handleMouseMove}
                onMouseLeave={tilt.handleMouseLeave}
                style={{ transform: tilt.transform, transition: "transform 0.15s ease-out" }}
                className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-amber-500/5 border border-primary/10 flex flex-col sm:flex-row items-center gap-4"
            >
                <div className="flex items-center gap-3 flex-1 text-center sm:text-left">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0 hidden sm:block" />
                    <div>
                        <p className="text-foreground font-semibold">{title}</p>
                        <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
                    </div>
                </div>
                <Link to={to} className="shrink-0">
                    <Button
                        variant="outline"
                        className="border-primary/30 text-primary hover:bg-primary/10 font-medium"
                    >
                        {buttonLabel}
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
};

export default BlogCTA;
