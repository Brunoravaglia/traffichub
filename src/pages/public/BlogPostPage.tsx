import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Clock,
    ArrowLeft,
    ArrowRight,
    Calendar,
    Share2,
    BookOpen,
    Eye,
    Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/home/PublicLayout";
import SEOHead from "@/components/SEOHead";
import BlogCTA from "@/components/blog/BlogCTA";
import { blogPosts } from "@/data/blogPosts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/components/ThemeProvider";
import { useTrackView, useLike } from "@/hooks/useBlogMetrics";

const BlogPostPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const post = blogPosts.find((p) => p.slug === slug);
    const { theme } = useTheme();

    // Track view + like
    useTrackView(slug);
    const { liked, likeCount, toggleLike } = useLike(slug);

    // Scroll to top when article changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }, [slug]);

    // Reading progress bar
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const relatedPosts = blogPosts
        .filter((p) => p.slug !== slug)
        .slice(0, 3);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.excerpt,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    // Split content in half for mid-article CTA insertion
    const paragraphs = post.content.split("\n\n");
    const midPoint = Math.floor(paragraphs.length / 2);
    const firstHalf = paragraphs.slice(0, midPoint).join("\n\n");
    const secondHalf = paragraphs.slice(midPoint).join("\n\n");

    const proseClasses = `prose ${theme === "dark" ? "prose-invert" : ""} prose-lg max-w-none
        prose-headings:text-foreground prose-headings:font-bold
        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-muted-foreground prose-p:leading-relaxed
        prose-strong:text-foreground prose-strong:font-semibold
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-ul:text-muted-foreground prose-ol:text-muted-foreground
        prose-li:marker:text-primary/60
        prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground
        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
        [&_table]:w-full [&_table]:border-collapse [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:my-8
        [&_thead]:bg-card [&_thead]:border-b-2 [&_thead]:border-primary/20
        [&_th]:text-foreground [&_th]:font-semibold [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:border [&_th]:border-border/60
        [&_td]:text-muted-foreground [&_td]:px-4 [&_td]:py-3 [&_td]:text-sm [&_td]:border [&_td]:border-border/60
        [&_tr]:border-b [&_tr]:border-border/40 [&_tr:hover]:bg-card/50 [&_tr]:transition-colors
        [&_tbody_tr:nth-child(even)]:bg-card/30
    `;

    return (
        <PublicLayout>
            <SEOHead
                title={post.title}
                description={post.metaDescription}
                path={`/blog/${post.slug}`}
                ogType="article"
                ogImage={post.coverImage}
                articleDate={post.date}
                articleSection={post.category}
                breadcrumbs={[
                    { name: "Blog", path: "/blog" },
                    { name: post.title, path: `/blog/${post.slug}` },
                ]}
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    headline: post.title,
                    description: post.metaDescription,
                    image: `https://vurp.com.br${post.coverImage}`,
                    datePublished: post.date,
                    dateModified: post.date,
                    wordCount: post.content.split(/\s+/).length,
                    mainEntityOfPage: {
                        "@type": "WebPage",
                        "@id": `https://vurp.com.br/blog/${post.slug}`,
                    },
                    articleSection: post.category,
                    inLanguage: "pt-BR",
                    author: {
                        "@type": "Organization",
                        name: "Vurp",
                        url: "https://vurp.com.br",
                    },
                    publisher: {
                        "@type": "Organization",
                        name: "Vurp",
                        logo: {
                            "@type": "ImageObject",
                            url: "https://vurp.com.br/og-image.png",
                        },
                    },
                }}
            />

            {/* ═══════ Reading Progress Bar ═══════ */}
            <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary to-amber-400"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            <article className="pt-4 sm:pt-8 pb-12 sm:pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-12">
                        {/* Main Content */}
                        <div className="max-w-none">
                            {/* Breadcrumbs */}
                            <motion.nav
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
                            >
                                <Link
                                    to="/blog"
                                    className="hover:text-primary transition-colors flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Blog
                                </Link>
                                <span>/</span>
                                <span className="text-foreground truncate">
                                    {post.title}
                                </span>
                            </motion.nav>

                            {/* Header */}
                            <motion.header
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6 mb-10"
                            >
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                        {post.category}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        {post.readTime} min de leitura
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(post.date)}
                                    </span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                                    {post.title}
                                </h1>

                                <p className="text-lg text-muted-foreground max-w-2xl">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleLike}
                                        className={`border-border transition-all ${liked
                                                ? "text-red-500 border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
                                                : "text-muted-foreground hover:text-red-500 hover:border-red-500/30"
                                            }`}
                                    >
                                        <Heart
                                            className={`w-4 h-4 mr-1.5 transition-all ${liked ? "fill-red-500" : ""}`}
                                        />
                                        {likeCount > 0 ? likeCount : "Curtir"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleShare}
                                        className="border-border text-muted-foreground hover:text-foreground"
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Compartilhar
                                    </Button>
                                </div>
                            </motion.header>

                            {/* Cover Image */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="aspect-[16/9] rounded-2xl overflow-hidden mb-12"
                            >
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Top CTA - inline variant */}
                            <BlogCTA
                                title="Organize sua gestão hoje mesmo"
                                subtitle="7 dias grátis, sem cartão de crédito."
                                buttonLabel="Testar grátis"
                                to="/signup"
                                variant="inline"
                            />

                            {/* Article Body - First Half */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className={proseClasses}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {firstHalf}
                                </ReactMarkdown>
                            </motion.div>

                            {/* Mid CTA - image variant */}
                            <BlogCTA
                                title={post.ctaLabel}
                                subtitle="Veja como o Vurp pode ajudar sua operação."
                                buttonLabel={post.ctaLabel}
                                to={post.ctaTarget}
                                variant="image"
                                imageSrc={post.coverImage}
                            />

                            {/* Article Body - Second Half */}
                            <div className={proseClasses}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {secondHalf}
                                </ReactMarkdown>
                            </div>

                            {/* Bottom CTA - banner variant */}
                            <BlogCTA
                                title="Teste o Vurp agora - 7 dias grátis"
                                subtitle="Sem cartão, sem contrato, sem risco. Cancele quando quiser."
                                buttonLabel="Começar grátis"
                                to="/signup"
                                variant="banner"
                            />
                        </div>

                        {/* Sidebar */}
                        <aside className="hidden lg:block mt-24">
                            <div className="sticky top-28 space-y-8">
                                {/* Author Card */}
                                <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground text-sm">
                                                Equipe Vurp
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Conteúdo por especialistas
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Produzimos conteúdo prático para
                                        gestores de tráfego pago que querem
                                        escalar suas operações.
                                    </p>
                                </div>

                                {/* Related Posts */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                                        Mais artigos
                                    </h3>
                                    {relatedPosts.map((rPost) => (
                                        <Link
                                            key={rPost.slug}
                                            to={`/blog/${rPost.slug}`}
                                            className="group block"
                                        >
                                            <div className="rounded-xl bg-card border border-border p-4 transition-all hover:border-primary/30 hover:shadow-md">
                                                <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3">
                                                    <img
                                                        src={rPost.coverImage}
                                                        alt={rPost.title}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                    {rPost.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {rPost.readTime} min ·{" "}
                                                    {rPost.category}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Quick CTA */}
                                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-amber-500/5 border border-primary/20 p-6 text-center space-y-4">
                                    <h3 className="font-bold text-foreground">
                                        Pronto para testar?
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        7 dias grátis, sem cartão.
                                    </p>
                                    <Link to="/signup" className="block">
                                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                                            Começar grátis
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </article>
        </PublicLayout>
    );
};

export default BlogPostPage;
