import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import VCDLogo from "@/components/VCDLogo";

const footerLinks = {
    product: [
        { label: "Funcionalidades", to: "/features" },
        { label: "Preços", to: "/pricing" },
        { label: "Blog", to: "/blog" },
        { label: "Changelog", to: "/changelog" },
        { label: "Sobre", to: "/about" },
        { label: "FAQ", to: "/faq" },
    ],
    support: [
        { label: "Central de Suporte", to: "/support" },
        { label: "Validar Relatório", to: "/validar-relatorio" },
        { label: "Contato", to: "/support" },
    ],
    legal: [
        { label: "Termos de Uso", to: "/terms" },
        { label: "Privacidade", to: "/privacy" },
        { label: "LGPD & Segurança", to: "/lgpd" },
    ],
};

const FooterSection = () => {
    return (
        <footer className="relative overflow-hidden">
            {/* Final CTA Banner */}
            <section className="relative py-20 sm:py-24">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[600px] h-[300px] bg-primary/8 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                        Pronto para{" "}
                        <span className="vcd-gradient-text">revolucionar</span>
                        <br />
                        sua gestão de tráfego?
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Junte-se a centenas de gestores que já transformaram sua rotina
                        com o Vurp.
                    </p>
                    <Link to="/signup">
                        <Button
                            size="lg"
                            className="h-14 px-10 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground vcd-button-glow transition-all duration-300 hover:scale-105 group mt-2"
                        >
                            Começar Agora - É Grátis
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                        7 dias grátis · Sem cartão de crédito · Cancele quando quiser
                    </p>
                </motion.div>
            </section>

            {/* Footer - improved contrast & hierarchy */}
            <div className="border-t border-border/40 bg-gradient-to-b from-card/40 to-card/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
                        {/* Brand */}
                        <div className="col-span-2">
                            <VCDLogo size="sm" showText />
                            <p className="text-sm text-foreground/60 mt-4 max-w-xs leading-relaxed">
                                A plataforma completa para gestores de tráfego pago organizarem,
                                reportarem e crescerem seus negócios.
                            </p>
                            <div className="flex items-center gap-1 mt-4">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-green-400 font-medium">100% Online</span>
                            </div>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider">Produto</h4>
                            <ul className="space-y-3">
                                {footerLinks.product.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.to} className="text-sm text-foreground/50 hover:text-primary transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider">Suporte</h4>
                            <ul className="space-y-3">
                                {footerLinks.support.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.to} className="text-sm text-foreground/50 hover:text-primary transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-wider">Legal</h4>
                            <ul className="space-y-3">
                                {footerLinks.legal.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.to} className="text-sm text-foreground/50 hover:text-primary transition-colors duration-200">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-foreground/40">
                            © {new Date().getFullYear()} Vurp. Todos os direitos reservados.
                        </p>
                        <div className="flex items-center gap-6 text-xs text-foreground/40">
                            <Link to="/terms" className="hover:text-primary transition-colors">Termos</Link>
                            <Link to="/privacy" className="hover:text-primary transition-colors">Privacidade</Link>
                            <Link to="/lgpd" className="hover:text-primary transition-colors">LGPD</Link>
                            <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
