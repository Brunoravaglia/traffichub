import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Search, ArrowRight, TrendingUp, Flame, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { blogPosts, blogCategories } from "@/data/blogPosts";
import MarketTicker from "@/components/blog/MarketTicker";
import { AnimatePresence } from "framer-motion";
import { useBlogMetrics } from "@/hooks/useBlogMetrics";

const parsePostDate = (dateStr: string) =>
    new Date(dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`);

const BlogPage = () => {
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_viewed" | "most_liked">("newest");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [tickerIndex, setTickerIndex] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { metrics, getMetric, loading: metricsLoading } = useBlogMetrics();

    // ─── Derived: sort posts by views for featured/trending ───
    const now = new Date();
    const postsWithMetrics = blogPosts.map((post) => ({
        ...post,
        ...getMetric(post.slug),
    }));
    const publishedPostsWithMetrics = postsWithMetrics.filter(
        (post) => parsePostDate(post.date).getTime() <= now.getTime()
    );

    const postsByViews = [...publishedPostsWithMetrics].sort((a, b) => b.views - a.views);
    const postsByLikes = [...publishedPostsWithMetrics].sort((a, b) => b.likes - a.likes);

    // Hero: top 5 by views (or first 5 if no data yet)
    const heroPosts = postsByViews.slice(0, 5);
    // Ticker: top 8 by views
    const tickerPosts = postsByViews.slice(0, 8);
    // Mais Lidos: top 4 by views (excluding hero[0])
    const trendingPosts = postsByViews.slice(0, 6);
    // Secondary posts for sidebar: next 3 after hero
    const heroPost = heroPosts[heroIndex] || heroPosts[0];
    const secondaryPosts = postsByViews.filter((p) => p.slug !== heroPost?.slug).slice(0, 3);

    // ─── Hero auto-rotation ───
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % heroPosts.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [heroPosts.length]);

    // ─── Ticker auto-rotation ───
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
        ? publishedPostsWithMetrics
            .filter(
                (p) =>
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 5)
        : [];

    const filteredPosts = publishedPostsWithMetrics.filter((post) => {
        const matchesCategory =
            activeCategory === "Todos" || post.category === activeCategory;
        const matchesSearch =
            searchQuery === "" ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sortedFilteredPosts = [...filteredPosts].sort((a, b) => {
        if (sortBy === "most_viewed") return b.views - a.views;
        if (sortBy === "most_liked") return b.likes - a.likes;
        const dateA = parsePostDate(a.date).getTime();
        const dateB = parsePostDate(b.date).getTime();
        if (sortBy === "oldest") return dateA - dateB;
        return dateB - dateA; // default: newest first
    });

    const formatDate = (dateStr: string) => {
        return parsePostDate(dateStr).toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatCount = (n: number) => {
        if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
        return String(n);
    };

    const sortOptions: Array<{ value: "newest" | "oldest" | "most_viewed" | "most_liked"; label: string }> = [
        { value: "newest", label: "Mais novos" },
        { value: "oldest", label: "Mais antigos" },
        { value: "most_viewed", label: "Mais visualizados" },
        { value: "most_liked", label: "Mais curtidos" },
    ];

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
                        <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest flex items-center justify-center gap-4">
                            <span>Tráfego Pago</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>Marketing Digital</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>Gestão de Performance</span>
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mt-6 group hover:bg-primary/10 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Artigos Publicados:</span>
                            <span className="text-sm font-black text-primary px-2 py-0.5 rounded-md bg-primary/10">{blogPosts.length}</span>
                        </div>
                        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent w-full mt-4" />
                    </motion.div>

                    {/* Market Ticker - Live Prices */}
                    <div className="mb-6">
                        <MarketTicker />
                    </div>

                    {/* Breaking / Rotating Ticker — data-driven by views */}
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
                                        to={`/blog/${tickerPosts[tickerIndex]?.slug}`}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap truncate"
                                    >
                                        <span className="text-primary font-bold mr-2">•</span>
                                        {tickerPosts[tickerIndex]?.title}
                                        {tickerPosts[tickerIndex]?.views > 0 && (
                                            <span className="ml-3 text-muted-foreground/50 text-xs">
                                                <Eye className="w-3 h-3 inline mr-0.5" />
                                                {formatCount(tickerPosts[tickerIndex].views)}
                                            </span>
                                        )}
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

                    {/* Main Grid: Dynamic Hero Carousel + 3 Secondary */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-10">
                        {/* Featured Article — rotating carousel */}
                        <motion.article
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="lg:col-span-2 relative"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={heroPost?.slug}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                >
                                    <Link to={`/blog/${heroPost?.slug}`} className="group block">
                                        <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
                                            <img
                                                src={heroPost?.coverImage}
                                                alt={heroPost?.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                                                <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase mb-3">
                                                    {heroPost?.category}
                                                </span>
                                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 group-hover:text-primary transition-colors">
                                                    {heroPost?.title}
                                                </h2>
                                                <p className="text-white/70 text-sm sm:text-base max-w-xl line-clamp-2">
                                                    {heroPost?.excerpt}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 text-white/50 text-xs">
                                                    <span>{heroPost && formatDate(heroPost.date)}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {heroPost?.readTime} min
                                                    </span>
                                                    {heroPost && heroPost.views > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3 h-3" />
                                                            {formatCount(heroPost.views)}
                                                        </span>
                                                    )}
                                                    {heroPost && heroPost.likes > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Heart className="w-3 h-3" />
                                                            {formatCount(heroPost.likes)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </AnimatePresence>

                            {/* Hero navigation dots */}
                            <div className="flex justify-center gap-2 mt-4">
                                {heroPosts.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setHeroIndex(i)}
                                        className={`h-1.5 rounded-full transition-all duration-400 ${i === heroIndex
                                            ? "bg-primary w-8"
                                            : "bg-muted-foreground/20 w-1.5 hover:bg-muted-foreground/40"
                                            }`}
                                    />
                                ))}
                            </div>
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
                                            <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {post.readTime} min
                                                {post.views > 0 && (
                                                    <>
                                                        <span className="text-muted-foreground/40">·</span>
                                                        <Eye className="w-3 h-3" />
                                                        {formatCount(post.views)}
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </div>

                    {/* Trending Row — real "Mais Lidos" */}
                    <div className="border-t border-b border-border py-4 mb-10">
                        <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide">
                            <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-wider">
                                <TrendingUp className="w-4 h-4" />
                                Mais Lidos
                            </span>
                            {trendingPosts.map((post, i) => (
                                <Link
                                    key={post.slug}
                                    to={`/blog/${post.slug}`}
                                    className="flex-shrink-0 flex items-center gap-3 group"
                                >
                                    <span className="text-2xl font-black text-muted-foreground/20">{String(i + 1).padStart(2, '0')}</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors line-clamp-1 max-w-[240px]">
                                            {post.title}
                                        </span>
                                        {post.views > 0 && (
                                            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                                                <Eye className="w-2.5 h-2.5" />
                                                {formatCount(post.views)} visualizações
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ SEARCH + CATEGORIES ═══════ */}
            <section className="pb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-4">
                        {/* Autocomplete Search */}
                        <div className="flex flex-col lg:flex-row items-stretch gap-3">
                            <div ref={searchRef} className="relative flex-1">
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
                                                    alt={post.title}
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

                            <div className="flex flex-wrap gap-2">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setSortBy(option.value)}
                                        className={`px-3 py-2 rounded-full text-[11px] font-semibold tracking-wide transition-all ${sortBy === option.value
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {blogCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeCategory === cat
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
                    {sortedFilteredPosts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground text-lg">
                                Nenhum artigo encontrado.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {sortedFilteredPosts.map((post, i) => {
                                const metric = { views: post.views, likes: post.likes };
                                return (
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
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDate(post.date)}
                                                            </span>
                                                            {/* Real metrics badges */}
                                                            {(metric.views > 0 || metric.likes > 0) && (
                                                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60">
                                                                    {metric.views > 0 && (
                                                                        <span className="flex items-center gap-0.5">
                                                                            <Eye className="w-3 h-3" />
                                                                            {formatCount(metric.views)}
                                                                        </span>
                                                                    )}
                                                                    {metric.likes > 0 && (
                                                                        <span className="flex items-center gap-0.5">
                                                                            <Heart className="w-3 h-3" />
                                                                            {formatCount(metric.likes)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Ler
                                                            <ArrowRight className="w-4 h-4" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.article>
                                );
                            })}
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
