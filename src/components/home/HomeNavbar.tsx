import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
        window.addEventListener("scroll", onScroll);
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

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 py-2.5 backdrop-blur-md transition-all duration-500 ${scrolled
                ? "md:border-border/50 md:bg-background/95 md:py-1.5 lg:py-2 md:shadow-md"
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
                                className="text-[13px] lg:text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
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
                            className="p-1.5 lg:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun className="h-4 w-4 lg:h-5 lg:w-5" /> : <Moon className="h-4 w-4 lg:h-5 lg:w-5" />}
                        </button>
                        <Link to="/login">
                            <Button variant="ghost" className="h-9 px-4 text-[14px] text-muted-foreground hover:text-foreground">
                                Entrar
                            </Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 lg:px-6 text-[14px] vcd-button-glow">
                                Começar Grátis
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-foreground"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50"
                >
                    <div className="px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                to={link.to || "/"}
                                onClick={() => handleNavClick(link)}
                                className="block w-full text-left py-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-border/50 space-y-2">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-2 w-full py-2 px-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                            </button>
                            <Link to="/login" className="block">
                                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                                    Entrar
                                </Button>
                            </Link>
                            <Link to="/signup" className="block">
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold vcd-button-glow">
                                    Começar Grátis
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default HomeNavbar;
