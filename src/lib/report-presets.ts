/**
 * Pre-built report template presets organised by use-case.
 * Each preset defines which sections and metrics should be active,
 * ready to be applied as a starting point in the template selector.
 */

import type { MetricsConfig, SectionsConfig } from "./report-types";
import { DEFAULT_METRICS_CONFIG, DEFAULT_SECTIONS_CONFIG } from "./report-types";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ReportPreset {
    id: string;
    nome: string;
    descricao: string;
    /** Emoji or lucide icon hint */
    icon: string;
    /** Gradient class for the card */
    gradient: string;
    /** Accent color for the icon badge */
    accentColor: string;
    sectionsConfig: SectionsConfig;
    metricsConfig: MetricsConfig;
}

// ─── Helper ────────────────────────────────────────────────────────────────

function preset(
    overrides: Partial<MetricsConfig>,
    sectionsOverrides: Partial<SectionsConfig>,
): { metricsConfig: MetricsConfig; sectionsConfig: SectionsConfig } {
    // Start with all optional metrics OFF (clean slate per preset)
    const cleanMetrics: MetricsConfig = Object.keys(DEFAULT_METRICS_CONFIG).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {} as MetricsConfig,
    );

    return {
        metricsConfig: { ...cleanMetrics, ...overrides },
        sectionsConfig: {
            ...DEFAULT_SECTIONS_CONFIG,
            // Turn off everything first
            showGoogleAds: false,
            showMetaAds: false,
            showLinkedinAds: false,
            showTiktokAds: false,
            showShopeeAds: false,
            showCriativosGoogle: false,
            showCriativosMeta: false,
            showCriativosLinkedin: false,
            showCriativosTiktok: false,
            showCriativosShopee: false,
            showSaldoRestante: false,
            showPaineisAnuncio: false,
            showCustomSections: false,
            showStrategicInsights: false,
            showResumo: false,
            showObjetivos: false,
            // Then apply the specific overrides
            ...sectionsOverrides,
        },
    };
}

// ─── Presets ────────────────────────────────────────────────────────────────

export const REPORT_PRESETS: ReportPreset[] = [
    // ── Captação / Lead Gen ─────
    {
        id: "preset-captacao",
        nome: "Captação de Leads",
        descricao: "Foco em geração de leads: CPL, conversões, CTR e custo por resultado.",
        icon: "Target",
        gradient: "from-emerald-500/20 to-emerald-600/5",
        accentColor: "text-emerald-500",
        ...preset(
            {
                showGoogleCustoPorLead: true,
                showGoogleCtr: true,
                showGoogleConversoes: true,
                showGoogleCustoConversao: true,
                showMetaCustoPorLead: true,
                showMetaCliques: true,
                showMetaLeads: true,
                showMetaConversas: true,
                showMetaAlcance: true,
            },
            {
                showObjetivos: true,
                showGoogleAds: true,
                showMetaAds: true,
                showResumo: true,
                showStrategicInsights: true,
                showSaldoRestante: true,
            },
        ),
    },

    // ── E-commerce ──────────────
    {
        id: "preset-ecommerce",
        nome: "E-commerce",
        descricao: "Otimizado para lojas: ROAS, compras, GMV, CPA e funil de vendas.",
        icon: "ShoppingCart",
        gradient: "from-blue-500/20 to-blue-600/5",
        accentColor: "text-blue-500",
        ...preset(
            {
                showGoogleRoas: true,
                showGoogleRoasValor: true,
                showGoogleCompras: true,
                showGoogleVisitasProduto: true,
                showGoogleAdicoesCarrinho: true,
                showGoogleVendas: true,
                showGoogleCustoPorVisita: true,
                showGoogleCustoPorAdicaoCarrinho: true,
                showGoogleCustoPorVenda: true,
                showMetaRoas: true,
                showMetaRoasValor: true,
                showMetaCompras: true,
                showMetaVisitasProduto: true,
                showMetaAdicoesCarrinho: true,
                showMetaVendas: true,
                showMetaCustoPorVisita: true,
                showMetaCustoPorAdicaoCarrinho: true,
                showMetaCustoPorVenda: true,
                showShopeePedidos: true,
                showShopeeGmv: true,
                showShopeeCpa: true,
                showShopeeRoas: true,
            },
            {
                showObjetivos: true,
                showGoogleAds: true,
                showMetaAds: true,
                showShopeeAds: true,
                showCriativosGoogle: true,
                showCriativosMeta: true,
                showResumo: true,
                showPaineisAnuncio: true,
                showStrategicInsights: true,
            },
        ),
    },

    // ── Institucional ───────────
    {
        id: "preset-institucional",
        nome: "Institucional",
        descricao: "Relatório de branding: alcance, impressões, engajamento e awareness.",
        icon: "Building2",
        gradient: "from-violet-500/20 to-violet-600/5",
        accentColor: "text-violet-500",
        ...preset(
            {
                showMetaAlcance: true,
                showMetaEngajamento: true,
                showMetaCurtidasPagina: true,
                showMetaSeguidores: true,
                showMetaCompartilhamentos: true,
                showMetaComentarios: true,
                showGoogleAlcance: true,
                showGoogleCpm: true,
            },
            {
                showObjetivos: true,
                showMetaAds: true,
                showGoogleAds: true,
                showCriativosMeta: true,
                showResumo: true,
                showStrategicInsights: true,
            },
        ),
    },

    // ── Social Proof ────────────
    {
        id: "preset-social-proof",
        nome: "Social Proof",
        descricao: "Prova social: seguidores, curtidas, views de vídeo e engajamento.",
        icon: "Heart",
        gradient: "from-pink-500/20 to-pink-600/5",
        accentColor: "text-pink-500",
        ...preset(
            {
                showMetaSeguidores: true,
                showMetaCurtidasPagina: true,
                showMetaComentarios: true,
                showMetaSalvos: true,
                showMetaCompartilhamentos: true,
                showMetaVisualizacoesVideo: true,
                showMetaRetencaoVideo: true,
                showMetaEngajamento: true,
                showTiktokViews: true,
                showTiktokLeads: true,
            },
            {
                showObjetivos: true,
                showMetaAds: true,
                showTiktokAds: true,
                showCriativosMeta: true,
                showCriativosTiktok: true,
                showResumo: true,
            },
        ),
    },

    // ── Full Funnel ─────────────
    {
        id: "preset-full-funnel",
        nome: "Full Funnel",
        descricao: "Relatório completo com todas as plataformas e métricas ativas.",
        icon: "Layers",
        gradient: "from-amber-500/20 to-amber-600/5",
        accentColor: "text-amber-500",
        ...preset(
            // Turn everything ON
            Object.keys(DEFAULT_METRICS_CONFIG).reduce(
                (acc, key) => ({ ...acc, [key]: true }),
                {} as MetricsConfig,
            ),
            {
                showObjetivos: true,
                showGoogleAds: true,
                showMetaAds: true,
                showLinkedinAds: true,
                showTiktokAds: true,
                showShopeeAds: true,
                showCriativosGoogle: true,
                showCriativosMeta: true,
                showCriativosLinkedin: true,
                showCriativosTiktok: true,
                showCriativosShopee: true,
                showResumo: true,
                showSaldoRestante: true,
                showPaineisAnuncio: true,
                showCustomSections: true,
                showStrategicInsights: true,
            },
        ),
    },
];
