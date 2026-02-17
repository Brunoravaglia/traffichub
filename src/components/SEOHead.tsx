import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
    name: string;
    path: string;
}

interface SEOHeadProps {
    title: string;
    description: string;
    path: string;
    jsonLd?: Record<string, unknown>;
    noindex?: boolean;
    ogType?: "website" | "article";
    ogImage?: string;
    /** ISO date string for article published date */
    articleDate?: string;
    /** Blog category */
    articleSection?: string;
    /** Breadcrumb trail (excluding Home - added automatically) */
    breadcrumbs?: BreadcrumbItem[];
}

const SITE_NAME = "Vurp";
const BASE_URL = "https://vurp.com.br";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

const SEOHead = ({
    title,
    description,
    path,
    jsonLd,
    noindex = false,
    ogType = "website",
    ogImage,
    articleDate,
    articleSection,
    breadcrumbs,
}: SEOHeadProps) => {
    const fullTitle = path === "/" ? title : `${title} · ${SITE_NAME}`;
    const canonicalUrl = `${BASE_URL}${path}`;
    const resolvedImage = ogImage ? `${BASE_URL}${ogImage}` : DEFAULT_IMAGE;

    /* ── BreadcrumbList JSON-LD ── */
    const breadcrumbLd = breadcrumbs && breadcrumbs.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: BASE_URL + "/",
                },
                ...breadcrumbs.map((b, i) => ({
                    "@type": "ListItem",
                    position: i + 2,
                    name: b.name,
                    item: `${BASE_URL}${b.path}`,
                })),
            ],
        }
        : null;

    return (
        <Helmet>
            {/* Primary */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />
            {noindex
                ? <meta name="robots" content="noindex, nofollow" />
                : <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            }

            {/* Language */}
            <link rel="alternate" hrefLang="pt-BR" href={canonicalUrl} />
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={resolvedImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="pt_BR" />

            {/* Article-specific OG */}
            {ogType === "article" && articleDate && (
                <meta property="article:published_time" content={articleDate} />
            )}
            {ogType === "article" && articleDate && (
                <meta property="article:modified_time" content={articleDate} />
            )}
            {ogType === "article" && articleSection && (
                <meta property="article:section" content={articleSection} />
            )}
            {ogType === "article" && (
                <meta property="article:author" content={SITE_NAME} />
            )}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={resolvedImage} />

            {/* JSON-LD: page-specific */}
            {jsonLd && (
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            )}

            {/* JSON-LD: BreadcrumbList */}
            {breadcrumbLd && (
                <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
            )}
        </Helmet>
    );
};

export default SEOHead;
