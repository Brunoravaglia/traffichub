import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import VCDLogo from "@/components/VCDLogo";
import { useTheme } from "@/components/ThemeProvider";

interface NavLink {
    label: string;
    href?: string;   // anchor on homepage
    to?: string;     // route link
}

const navLinks: NavLink[] = [
    { label: "Funcionalidades", to: "/features" },
    { label: "Preços", to: "/pricing" },
    { label: "Utilidades", to: "/utilidades" },
    { label: "Blog", to: "/blog" },
    { label: "Afiliados", to: "/afiliados" },
    { label: "FAQ", to: "/faq" },
];

const HomeNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === "/";
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleNavClick = (link: NavLink) => {
        setMobileOpen(false);
        // On homepage, try anchor scroll for features/pricing sections
        if (isHome && link.href) {
            const el = document.querySelector(link.href);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                return;
            }
        }
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, y: -16, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
        },
        exit: {
            opacity: 0,
            y: -12,
            scale: 0.98,
            transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
        },
    };

    const mobileItemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: { duration: 0.2, delay: i * 0.03 },
        }),
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 py-2.5 backdrop-blur-md transition-all duration-500 ${scrolled
                ? "md:border-border/60 md:bg-background/95 md:py-2 md:shadow-sm"
                : "md:border-transparent md:bg-transparent md:py-2.5 lg:py-3"
                }`}
        >
            <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 md:h-16 lg:h-[68px]">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <VCDLogo size="sm" showText />
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-6 lg:gap-7">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.to || "/"}
                                onClick={() => handleNavClick(link)}
                                className="relative text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:text-[14px]"
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="rounded-lg p-1.5 text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:p-2"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun className="h-4 w-4 lg:h-5 lg:w-5" /> : <Moon className="h-4 w-4 lg:h-5 lg:w-5" />}
                        </button>
                        <Link to="/login">
                            <Button variant="ghost" className="h-9 px-4 text-[14px] text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/70">
                                Entrar
                            </Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="h-10 bg-primary px-5 text-[14px] font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/70 lg:px-6 vcd-button-glow">
                                Começar Grátis
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden rounded-xl border border-border/75 bg-card/85 p-2 text-foreground shadow-[0_8px_26px_hsl(var(--background)/0.35)] backdrop-blur-xl transition-all duration-200 hover:border-primary/45 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-black/45 dark:border-white/20"
                        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? (
                            <X className="h-6 w-6 stroke-[2.5]" />
                        ) : (
                            <Menu className="h-6 w-6 stroke-[2.5]" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Fechar menu"
                            className="fixed inset-0 z-40 bg-background/55 backdrop-blur-[2px] md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={mobileMenuVariants}
                            className="absolute left-3 right-3 top-[calc(100%-4px)] z-50 overflow-hidden rounded-2xl border border-border/75 bg-background/95 shadow-2xl shadow-black/20 backdrop-blur-2xl md:hidden dark:bg-black/85 dark:border-white/20"
                        >
                            <div className="space-y-1 px-3 py-3">
                                {navLinks.map((link, i) => (
                                    <motion.div key={link.label} custom={i} initial="hidden" animate="visible" variants={mobileItemVariants}>
                                        <Link
                                            to={link.to || "/"}
                                            onClick={() => handleNavClick(link)}
                                            className="block rounded-xl border border-transparent px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                                <div className="mt-2 space-y-2 border-t border-border/60 pt-3">
                                    <button
                                        onClick={toggleTheme}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[15px] text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    >
                                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                                        {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                                    </button>
                                    <Link to="/login" className="block" onClick={() => setMobileOpen(false)}>
                                        <Button variant="ghost" className="h-10 w-full justify-start rounded-xl border border-border/40 text-[15px] text-muted-foreground hover:bg-card">
                                            Entrar
                                        </Button>
                                    </Link>
                                    <Link to="/signup" className="block" onClick={() => setMobileOpen(false)}>
                                        <Button className="h-10 w-full rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground hover:bg-primary/90 vcd-button-glow">
                                            Começar Grátis
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default HomeNavbar;
