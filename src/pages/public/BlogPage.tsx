import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Search, ArrowRight, TrendingUp, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { blogPosts, blogCategories } from "@/data/blogPosts";
import MarketTicker from "@/components/blog/MarketTicker";
import { AnimatePresence } from "framer-motion";

const BlogPage = () => {
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [tickerIndex, setTickerIndex] = useState(0);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Rotating news ticker
    const tickerPosts = blogPosts.slice(0, 8);
    useEffect(() => {
        const interval = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % tickerPosts.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [tickerPosts.length]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const suggestions = searchQuery.length >= 2
        ? blogPosts
            .filter(
                (p) =>
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 5)
        : [];

    const filteredPosts = blogPosts.filter((post) => {
        const matchesCategory =
            activeCategory === "Todos" || post.category === activeCategory;
        const matchesSearch =
            searchQuery === "" ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Newsroom hero: featured article + secondary articles
    const featuredPost = blogPosts[0];
    const secondaryPosts = blogPosts.slice(1, 4);
    const latestPosts = blogPosts.slice(4, 8);

    return (
        <PublicLayout>
            <SEOHead
                title="Blog | Vurp - Jornal do Gestor de Tráfego"
                description="Artigos, guias e dicas para gestores de tráfego pago. Produtividade, relatórios, escalabilidade e melhores práticas para Google, Meta, TikTok e LinkedIn Ads."
                path="/blog"
                breadcrumbs={[
                    { name: "Blog", path: "/blog" },
                ]}
            />

            {/* ═══════ NEWSROOM HERO ═══════ */}
            <section className="pt-8 sm:pt-14 pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Masthead */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-center mb-8"
                    >
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="h-px flex-1 max-w-[100px] bg-border" />
                            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                                Edição {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                            </span>
                            <div className="h-px flex-1 max-w-[100px] bg-border" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight font-serif" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                            Jornal do Gestor
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">
                            Tráfego Pago · Marketing Digital · Gestão de Performance
                        </p>
                        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent w-full mt-4" />
                    </motion.div>

                    {/* Market Ticker - Live Prices */}
                    <div className="mb-6">
                        <MarketTicker />
                    </div>

                    {/* Breaking / Rotating Ticker */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <span className="flex-shrink-0 px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase rounded">
                            <Flame className="w-3 h-3 inline mr-1" />
                            Destaque
                        </span>
                        <div className="relative overflow-hidden flex-1 h-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={tickerIndex}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16 }}
                                    transition={{ duration: 0.35, ease: "easeInOut" }}
                                    className="absolute inset-0 flex items-center"
                                >
                                    <Link
                                        to={`/blog/${tickerPosts[tickerIndex].slug}`}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap truncate"
                                    >
                                        <span className="text-primary font-bold mr-2">•</span>
                                        {tickerPosts[tickerIndex].title}
                                    </Link>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="flex-shrink-0 flex gap-1">
                            {tickerPosts.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTickerIndex(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === tickerIndex
                                            ? "bg-primary w-4"
                                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                        }`}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Main Grid: Featured + 3 Secondary */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-10">
                        {/* Featured Article - spans 2 cols */}
                        <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="lg:col-span-2"
                        >
                            <Link to={`/blog/${featuredPost.slug}`} className="group block">
                                <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
                                    <img
                                        src={featuredPost.coverImage}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                                        <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase mb-3">
                                            {featuredPost.category}
                                        </span>
                                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 group-hover:text-primary transition-colors">
                                            {featuredPost.title}
                                        </h2>
                                        <p className="text-white/70 text-sm sm:text-base max-w-xl line-clamp-2">
                                            {featuredPost.excerpt}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-white/50 text-xs">
                                            <span>{formatDate(featuredPost.date)}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {featuredPost.readTime} min
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.article>

                        {/* 3 Secondary Articles - stacked */}
                        <div className="flex flex-col gap-4">
                            {secondaryPosts.map((post, i) => (
                                <motion.article
                                    key={post.slug}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                                >
                                    <Link to={`/blog/${post.slug}`} className="group flex gap-4">
                                        <div className="w-28 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                                                {post.category}
                                            </span>
                                            <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors mt-0.5">
                                                {post.title}
                                            </h3>
                                            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {post.readTime} min · {formatDate(post.date)}
                                            </span>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </div>

                    {/* Trending Row */}
                    <div className="border-t border-b border-border py-4 mb-10">
                        <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
                            <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-wider">
                                <TrendingUp className="w-4 h-4" />
                                Mais Lidos
                            </span>
                            {latestPosts.map((post, i) => (
                                <Link
                                    key={post.slug}
                                    to={`/blog/${post.slug}`}
                                    className="flex-shrink-0 flex items-center gap-3 group"
                                >
                                    <span className="text-2xl font-black text-muted-foreground/20">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors line-clamp-1 max-w-[240px]">
                                        {post.title}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ SEARCH + CATEGORIES ═══════ */}
            <section className="pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between">
                        {/* Autocomplete Search */}
                        <div ref={searchRef} className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                            <input
                                type="text"
                                placeholder="Buscar artigos..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(e.target.value.length >= 2);
                                }}
                                onFocus={() => {
                                    if (searchQuery.length >= 2) setShowSuggestions(true);
                                }}
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl shadow-black/20 overflow-hidden z-50">
                                    {suggestions.map((post) => (
                                        <button
                                            key={post.slug}
                                            onClick={() => {
                                                setShowSuggestions(false);
                                                setSearchQuery("");
                                                navigate(`/blog/${post.slug}`);
                                            }}
                                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left border-b border-border/50 last:border-0"
                                        >
                                            <img
                                                src={post.coverImage}
                                                alt=""
                                                className="w-12 h-8 rounded object-cover flex-shrink-0 mt-0.5"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {post.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                                                        {post.category}
                                                    </span>
                                                    <span>{post.readTime} min de leitura</span>
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            {blogCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeCategory === cat
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ POST GRID ═══════ */}
            <section className="pb-20 sm:pb-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground text-lg">
                                Nenhum artigo encontrado.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPosts.map((post, i) => (
                                <motion.article
                                    key={post.slug}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.4,
                                        delay: i * 0.05,
                                    }}
                                >
                                    <Link
                                        to={`/blog/${post.slug}`}
                                        className="group block h-full"
                                    >
                                        <div className="h-full rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                                            <div className="aspect-[16/9] overflow-hidden">
                                                <img
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="p-6 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                        {post.category}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {post.readTime} min
                                                    </span>
                                                </div>
                                                <h2 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {post.title}
                                                </h2>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(post.date)}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Ler
                                                        <ArrowRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Newsletter CTA */}
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
                                Pronto para{" "}
                                <span className="vcd-gradient-text">
                                    transformar
                                </span>{" "}
                                sua gestão?
                            </h2>
                            <p className="text-muted-foreground max-w-lg mx-auto">
                                Junte-se a centenas de gestores que já
                                sistematizaram suas rotinas com o Vurp.
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

export default BlogPage;
