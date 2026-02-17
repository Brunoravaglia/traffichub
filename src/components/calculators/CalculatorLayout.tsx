import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";

interface CalculatorLayoutProps {
    title: string;
    subtitle: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    path: string;
    children: React.ReactNode;
    interpretation?: React.ReactNode;
}

const CalculatorLayout = ({
    title,
    subtitle,
    description,
    seoTitle,
    seoDescription,
    path,
    children,
    interpretation,
}: CalculatorLayoutProps) => {
    return (
        <PublicLayout>
            <SEOHead
                title={seoTitle}
                description={seoDescription}
                path={path}
                breadcrumbs={[
                    { name: "Utilidades", path: "/utilidades" },
                    { name: title, path },
                ]}
            />

            <div className="min-h-screen bg-background text-foreground">
                {/* Header */}
                <section className="pt-28 pb-8">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6">
                        <Link
                            to="/utilidades"
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Todas as calculadoras
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-sm text-primary font-medium mb-2">{subtitle}</p>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{title}</h1>
                            <p className="text-muted-foreground">{description}</p>
                        </motion.div>
                    </div>
                </section>

                {/* Calculator */}
                <section className="pb-8">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </section>

                {/* Interpretation */}
                {interpretation && (
                    <section className="py-12 bg-card/30">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6">
                            <h2 className="text-xl font-bold mb-6">Como interpretar o resultado</h2>
                            {interpretation}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="py-16">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                        <div className="p-8 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20">
                            <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
                            <h2 className="text-2xl font-bold mb-3">Automatize seus cálculos</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                                O Vurp gera relatórios completos com todas essas métricas automaticamente.
                            </p>
                            <Link to="/signup">
                                <Button className="h-12 px-8 font-bold bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow transition-all hover:scale-105 group">
                                    Começar Grátis
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default CalculatorLayout;
