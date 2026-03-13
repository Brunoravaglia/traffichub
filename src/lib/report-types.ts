/**
 * Centralized report types, interfaces, and defaults.
 * Single source of truth — used by RelatorioCliente, TemplateSelector,
 * ReportTemplateManager, and all report sub-components.
 */

import type { AspectRatioOption } from "@/components/report/AspectRatioSelector";
import type { AdPanelImage } from "@/components/report/AdPanelGrid";
import type { CustomSection } from "@/components/report/CustomSectionGrid";

// ─── Platform union ────────────────────────────────────────────────────────
export type Platform = "google" | "meta" | "linkedin" | "tiktok" | "shopee";
export type CreativePlatform = Platform;

// ─── Creative interfaces ───────────────────────────────────────────────────
export interface Creative {
    id: string;
    url: string;
    name: string;
    platform: CreativePlatform;
    aspectRatio?: AspectRatioOption;
}

export interface RankingCreative {
    id: string;
    url: string;
    result: string;
    position: 1 | 2 | 3;
    aspectRatio?: AspectRatioOption;
}

// ─── Metrics config (boolean toggles) ──────────────────────────────────────
export interface MetricsConfig {
    // Google
    showGoogleCustoPorLead: boolean;
    showGoogleCpm: boolean;
    showGoogleCtr: boolean;
    showGoogleCpc: boolean;
    showGoogleConversoes: boolean;
    showGoogleTaxaConversao: boolean;
    showGoogleRoas: boolean;
    showGoogleRoasValor: boolean;
    showGoogleCustoConversao: boolean;
    showGoogleAlcance: boolean;
    showGoogleFrequencia: boolean;
    showGoogleVisualizacoesVideo: boolean;
    showGoogleTaxaVisualizacao: boolean;
    showGoogleInteracoes: boolean;
    showGoogleTaxaInteracao: boolean;
    showGoogleCompras: boolean;
    showGoogleVisitasProduto: boolean;
    showGoogleAdicoesCarrinho: boolean;
    showGoogleVendas: boolean;
    showGoogleCustoPorVisita: boolean;
    showGoogleCustoPorAdicaoCarrinho: boolean;
    showGoogleCustoPorVenda: boolean;
    // Meta
    showMetaEngajamento: boolean;
    showMetaConversas: boolean;
    showMetaCustoPorLead: boolean;
    showMetaCpm: boolean;
    showMetaCustoPorSeguidor: boolean;
    showMetaCliques: boolean;
    showMetaCtr: boolean;
    showMetaCpc: boolean;
    showMetaAlcance: boolean;
    showMetaFrequencia: boolean;
    showMetaLeads: boolean;
    showMetaConversoes: boolean;
    showMetaRoas: boolean;
    showMetaRoasValor: boolean;
    showMetaCurtidasPagina: boolean;
    showMetaSeguidores: boolean;
    showMetaCompartilhamentos: boolean;
    showMetaSalvos: boolean;
    showMetaComentarios: boolean;
    showMetaVisualizacoesVideo: boolean;
    showMetaRetencaoVideo: boolean;
    showMetaMensagensIniciadas: boolean;
    showMetaRespostasMensagem: boolean;
    showMetaAgendamentos: boolean;
    showMetaCheckins: boolean;
    showMetaCompras: boolean;
    showMetaVisitasProduto: boolean;
    showMetaAdicoesCarrinho: boolean;
    showMetaVendas: boolean;
    showMetaCustoPorVisita: boolean;
    showMetaCustoPorAdicaoCarrinho: boolean;
    showMetaCustoPorVenda: boolean;
    // LinkedIn
    showLinkedinCpm: boolean;
    showLinkedinCpc: boolean;
    showLinkedinCtr: boolean;
    showLinkedinCpl: boolean;
    showLinkedinLeads: boolean;
    showLinkedinConversoes: boolean;
    showLinkedinAlcance: boolean;
    // TikTok
    showTiktokCpm: boolean;
    showTiktokCpc: boolean;
    showTiktokCtr: boolean;
    showTiktokCpl: boolean;
    showTiktokLeads: boolean;
    showTiktokConversoes: boolean;
    showTiktokViews: boolean;
    // Shopee
    showShopeePedidos: boolean;
    showShopeeGmv: boolean;
    showShopeeCpm: boolean;
    showShopeeCpc: boolean;
    showShopeeCtr: boolean;
    showShopeeCpa: boolean;
    showShopeeRoas: boolean;
}

// ─── Sections config ───────────────────────────────────────────────────────
export interface SectionsConfig {
    showObjetivos: boolean;
    showGoogleAds: boolean;
    showMetaAds: boolean;
    showLinkedinAds: boolean;
    showTiktokAds: boolean;
    showShopeeAds: boolean;
    showCriativosGoogle: boolean;
    showCriativosMeta: boolean;
    showCriativosLinkedin: boolean;
    showCriativosTiktok: boolean;
    showCriativosShopee: boolean;
    showResumo: boolean;
    showSaldoRestante: boolean;
    showPaineisAnuncio: boolean;
    showCustomSections: boolean;
    showStrategicInsights: boolean;
}

// ─── Platform data shapes ──────────────────────────────────────────────────
export interface GoogleData {
    cliques: number;
    impressoes: number;
    contatos: number;
    investido: number;
    saldoRestante: number;
    diasParaRecarga: number;
    custoPorLead: number;
    cpm: number;
    ctr: number;
    cpc: number;
    conversoes: number;
    taxaConversao: number;
    roas: number;
    roasValor: number;
    custoConversao: number;
    alcance: number;
    frequencia: number;
    visualizacoesVideo: number;
    taxaVisualizacao: number;
    interacoes: number;
    taxaInteracao: number;
    compras: number;
    visitasProduto: number;
    adicoesCarrinho: number;
    vendas: number;
    custoPorVisita: number;
    custoPorAdicaoCarrinho: number;
    custoPorVenda: number;
}

export interface MetaData {
    impressoes: number;
    engajamento: number;
    conversas: number;
    investido: number;
    saldoRestante: number;
    diasParaRecarga: number;
    custoPorLead: number;
    cpm: number;
    custoPorSeguidor: number;
    cliques: number;
    ctr: number;
    cpc: number;
    alcance: number;
    frequencia: number;
    leads: number;
    conversoes: number;
    roas: number;
    roasValor: number;
    curtidasPagina: number;
    seguidores: number;
    compartilhamentos: number;
    salvos: number;
    comentarios: number;
    visualizacoesVideo: number;
    retencaoVideo: number;
    mensagensIniciadas: number;
    respostasMensagem: number;
    agendamentos: number;
    checkins: number;
    compras: number;
    visitasProduto: number;
    adicoesCarrinho: number;
    vendas: number;
    custoPorVisita: number;
    custoPorAdicaoCarrinho: number;
    custoPorVenda: number;
}

export interface LinkedinData {
    impressoes: number;
    cliques: number;
    leads: number;
    investido: number;
    cpm: number;
    cpc: number;
    ctr: number;
    cpl: number;
    conversoes: number;
    alcance: number;
}

export interface TiktokData {
    impressoes: number;
    cliques: number;
    leads: number;
    investido: number;
    cpm: number;
    cpc: number;
    ctr: number;
    cpl: number;
    conversoes: number;
    visualizacoesVideo: number;
}

export interface ShopeeData {
    impressoes: number;
    cliques: number;
    pedidos: number;
    investido: number;
    gmv: number;
    cpm: number;
    cpc: number;
    ctr: number;
    cpa: number;
    roas: number;
}

// ─── Full report data ──────────────────────────────────────────────────────
export interface ReportData {
    objetivos: string[];
    google: GoogleData;
    meta: MetaData;
    linkedin: LinkedinData;
    tiktok: TiktokData;
    shopee: ShopeeData;
    resumo: string;
    criativos: Creative[];
    criativosRanking: RankingCreative[];
    showRanking: boolean;
    creativeScaleGoogle: number;
    creativeScaleMeta: number;
    metricsConfig: MetricsConfig;
    autoFillSaldos: boolean;
    sectionsConfig: SectionsConfig;
    paineisAnuncio: AdPanelImage[];
    customSections: CustomSection[];
    validationId?: string;
    validationPassword?: string;
    validationTime?: string;
    isGeneratingPDF?: boolean;
}

// ─── Default values ────────────────────────────────────────────────────────
export const DEFAULT_METRICS_CONFIG: MetricsConfig = {
    // Google
    showGoogleCustoPorLead: true,
    showGoogleCpm: false,
    showGoogleCtr: false,
    showGoogleCpc: false,
    showGoogleConversoes: false,
    showGoogleTaxaConversao: false,
    showGoogleRoas: false,
    showGoogleRoasValor: false,
    showGoogleCustoConversao: false,
    showGoogleAlcance: false,
    showGoogleFrequencia: false,
    showGoogleVisualizacoesVideo: false,
    showGoogleTaxaVisualizacao: false,
    showGoogleInteracoes: false,
    showGoogleTaxaInteracao: false,
    showGoogleCompras: false,
    showGoogleVisitasProduto: false,
    showGoogleAdicoesCarrinho: false,
    showGoogleVendas: false,
    showGoogleCustoPorVisita: false,
    showGoogleCustoPorAdicaoCarrinho: false,
    showGoogleCustoPorVenda: false,
    // Meta
    showMetaEngajamento: false,
    showMetaConversas: false,
    showMetaCustoPorLead: true,
    showMetaCpm: false,
    showMetaCustoPorSeguidor: false,
    showMetaCliques: true,
    showMetaCtr: false,
    showMetaCpc: false,
    showMetaAlcance: true,
    showMetaFrequencia: false,
    showMetaLeads: true,
    showMetaConversoes: false,
    showMetaRoas: false,
    showMetaRoasValor: false,
    showMetaCurtidasPagina: false,
    showMetaSeguidores: false,
    showMetaCompartilhamentos: false,
    showMetaSalvos: false,
    showMetaComentarios: false,
    showMetaVisualizacoesVideo: false,
    showMetaRetencaoVideo: false,
    showMetaMensagensIniciadas: false,
    showMetaRespostasMensagem: false,
    showMetaAgendamentos: false,
    showMetaCheckins: false,
    showMetaCompras: false,
    showMetaVisitasProduto: false,
    showMetaAdicoesCarrinho: false,
    showMetaVendas: false,
    showMetaCustoPorVisita: false,
    showMetaCustoPorAdicaoCarrinho: false,
    showMetaCustoPorVenda: false,
    // LinkedIn
    showLinkedinCpm: true,
    showLinkedinCpc: true,
    showLinkedinCtr: true,
    showLinkedinCpl: true,
    showLinkedinLeads: true,
    showLinkedinConversoes: false,
    showLinkedinAlcance: true,
    // TikTok
    showTiktokCpm: true,
    showTiktokCpc: true,
    showTiktokCtr: true,
    showTiktokCpl: true,
    showTiktokLeads: true,
    showTiktokConversoes: false,
    showTiktokViews: true,
    // Shopee
    showShopeePedidos: true,
    showShopeeGmv: true,
    showShopeeCpm: true,
    showShopeeCpc: true,
    showShopeeCtr: true,
    showShopeeCpa: true,
    showShopeeRoas: true,
};

export const DEFAULT_SECTIONS_CONFIG: SectionsConfig = {
    showObjetivos: true,
    showGoogleAds: true,
    showMetaAds: true,
    showLinkedinAds: false,
    showTiktokAds: false,
    showShopeeAds: false,
    showCriativosGoogle: true,
    showCriativosMeta: true,
    showCriativosLinkedin: false,
    showCriativosTiktok: false,
    showCriativosShopee: false,
    showResumo: true,
    showSaldoRestante: true,
    showPaineisAnuncio: false,
    showCustomSections: false,
    showStrategicInsights: true,
};

export const defaultReportData: ReportData = {
    objetivos: [
        "Aumentar a visibilidade e reconhecimento da marca",
        "Aumentar o Número de Leads Qualificados",
    ],
    google: {
        cliques: 0, impressoes: 0, contatos: 0, investido: 0, custoPorLead: 0, cpm: 0,
        saldoRestante: 0, diasParaRecarga: 0,
        ctr: 0, cpc: 0, conversoes: 0, taxaConversao: 0, roas: 0, roasValor: 0, custoConversao: 0,
        alcance: 0, frequencia: 0, visualizacoesVideo: 0, taxaVisualizacao: 0, interacoes: 0, taxaInteracao: 0,
        compras: 0, visitasProduto: 0, adicoesCarrinho: 0, vendas: 0, custoPorVisita: 0, custoPorAdicaoCarrinho: 0, custoPorVenda: 0
    },
    meta: {
        impressoes: 0, engajamento: 0, conversas: 0, investido: 0, custoPorLead: 0, cpm: 0, custoPorSeguidor: 0,
        saldoRestante: 0, diasParaRecarga: 0,
        cliques: 0, ctr: 0, cpc: 0, alcance: 0, frequencia: 0, leads: 0, conversoes: 0, roas: 0, roasValor: 0,
        curtidasPagina: 0, seguidores: 0, compartilhamentos: 0, salvos: 0, comentarios: 0,
        visualizacoesVideo: 0, retencaoVideo: 0, mensagensIniciadas: 0, respostasMensagem: 0, agendamentos: 0, checkins: 0,
        compras: 0, visitasProduto: 0, adicoesCarrinho: 0, vendas: 0, custoPorVisita: 0, custoPorAdicaoCarrinho: 0, custoPorVenda: 0
    },
    linkedin: {
        impressoes: 0, cliques: 0, leads: 0, investido: 0, cpm: 0, cpc: 0, ctr: 0, cpl: 0, conversoes: 0, alcance: 0
    },
    tiktok: {
        impressoes: 0, cliques: 0, leads: 0, investido: 0, cpm: 0, cpc: 0, ctr: 0, cpl: 0, conversoes: 0, visualizacoesVideo: 0
    },
    shopee: {
        impressoes: 0, cliques: 0, pedidos: 0, investido: 0, gmv: 0, cpm: 0, cpc: 0, ctr: 0, cpa: 0, roas: 0
    },
    resumo: "",
    criativos: [],
    criativosRanking: [],
    showRanking: false,
    creativeScaleGoogle: 200,
    creativeScaleMeta: 200,
    metricsConfig: { ...DEFAULT_METRICS_CONFIG },
    autoFillSaldos: false,
    sectionsConfig: { ...DEFAULT_SECTIONS_CONFIG },
    paineisAnuncio: [],
    customSections: [],
};

// ─── Normalization helpers ─────────────────────────────────────────────────
const VALID_ASPECT_RATIOS = new Set<AspectRatioOption>(["auto", "1:1", "5:4", "9:16", "16:9"]);
const VALID_SCALE_VALUES = ["100", "110", "120", "130", "140", "150"] as const;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

export const toFiniteNumber = (value: unknown, fallback = 0): number => {
    const parsed = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeNumericRecord = <T extends Record<string, number>>(defaults: T, value: unknown): T => {
    const source = isRecord(value) ? value : {};
    const normalized = { ...defaults };
    for (const key of Object.keys(defaults)) {
        (normalized as Record<string, number>)[key] = toFiniteNumber(
            (source as Record<string, unknown>)[key],
            (defaults as Record<string, number>)[key],
        );
    }
    return normalized;
};

export const normalizeBooleanRecord = <T extends Record<string, boolean>>(defaults: T, value: unknown): T => {
    const source = isRecord(value) ? value : {};
    const normalized = { ...defaults };
    for (const key of Object.keys(defaults)) {
        const rawValue = (source as Record<string, unknown>)[key];
        (normalized as Record<string, boolean>)[key] = typeof rawValue === "boolean" ? rawValue : (defaults as Record<string, boolean>)[key];
    }
    return normalized;
};

export const normalizeAspectRatio = (value: unknown): AspectRatioOption | undefined => {
    if (typeof value !== "string" || !VALID_ASPECT_RATIOS.has(value as AspectRatioOption)) {
        return undefined;
    }
    return value as AspectRatioOption;
};

export const normalizeScale = (value: unknown): (typeof VALID_SCALE_VALUES)[number] | undefined => {
    if (typeof value !== "string") return undefined;
    return VALID_SCALE_VALUES.includes(value as (typeof VALID_SCALE_VALUES)[number])
        ? (value as (typeof VALID_SCALE_VALUES)[number])
        : undefined;
};

export const normalizeCreatives = (value: unknown): Creative[] => {
    if (!Array.isArray(value)) return [];
    return value
        .map((item, index) => {
            if (!isRecord(item)) return null;
            const url = typeof item.url === "string" ? item.url.trim() : "";
            if (!url) return null;
            const rawPlatform = item.platform;
            const platform: Creative["platform"] =
                rawPlatform === "meta" ||
                    rawPlatform === "linkedin" ||
                    rawPlatform === "tiktok" ||
                    rawPlatform === "shopee"
                    ? rawPlatform
                    : "google";
            const aspectRatio = normalizeAspectRatio(item.aspectRatio);
            return {
                id: typeof item.id === "string" && item.id.trim() ? item.id : `creative-${index}`,
                url,
                name: typeof item.name === "string" && item.name.trim() ? item.name : `Criativo ${index + 1}`,
                platform,
                ...(aspectRatio ? { aspectRatio } : {}),
            } as Creative;
        })
        .filter((item): item is Creative => !!item);
};

export const normalizeRankingCreatives = (value: unknown): RankingCreative[] => {
    if (!Array.isArray(value)) return [];
    return value
        .map((item, index) => {
            if (!isRecord(item)) return null;
            const position = item.position;
            if (position !== 1 && position !== 2 && position !== 3) return null;
            const url = typeof item.url === "string" ? item.url.trim() : "";
            if (!url) return null;
            const aspectRatio = normalizeAspectRatio(item.aspectRatio);
            return {
                id: typeof item.id === "string" && item.id.trim() ? item.id : `ranking-${position}-${index}`,
                url,
                position,
                result: typeof item.result === "string" ? item.result : "",
                ...(aspectRatio ? { aspectRatio } : {}),
            } as RankingCreative;
        })
        .filter((item): item is RankingCreative => !!item);
};

export const normalizeAdPanels = (value: unknown): AdPanelImage[] => {
    if (!Array.isArray(value)) return [];
    return value
        .map((item, index) => {
            if (!isRecord(item)) return null;
            const url = typeof item.url === "string" ? item.url.trim() : "";
            if (!url) return null;
            const platform: AdPanelImage["platform"] = item.platform === "meta" ? "meta" : "google";
            const aspectRatio = normalizeAspectRatio(item.aspectRatio);
            const scale = normalizeScale(item.scale);
            return {
                id: typeof item.id === "string" && item.id.trim() ? item.id : `panel-${platform}-${index}`,
                url,
                name: typeof item.name === "string" && item.name.trim() ? item.name : `Painel ${index + 1}`,
                platform,
                ...(aspectRatio ? { aspectRatio } : {}),
                ...(scale ? { scale } : {}),
            } as AdPanelImage;
        })
        .filter((item): item is AdPanelImage => !!item);
};

export const normalizeCustomSections = (value: unknown): CustomSection[] => {
    if (!Array.isArray(value)) return [];
    return value
        .map((section, sectionIndex) => {
            if (!isRecord(section)) return null;
            const imagesValue = Array.isArray(section.images) ? section.images : [];
            const images = imagesValue
                .map((image, imageIndex) => {
                    if (!isRecord(image)) return null;
                    const url = typeof image.url === "string" ? image.url.trim() : "";
                    if (!url) return null;
                    return {
                        id:
                            typeof image.id === "string" && image.id.trim()
                                ? image.id
                                : `custom-image-${sectionIndex}-${imageIndex}`,
                        url,
                        name:
                            typeof image.name === "string" && image.name.trim()
                                ? image.name
                                : `Imagem ${imageIndex + 1}`,
                        width: toFiniteNumber(image.width, 0) || undefined,
                        height: toFiniteNumber(image.height, 0) || undefined,
                    };
                })
                .filter(Boolean) as CustomSection["images"];
            return {
                id:
                    typeof section.id === "string" && section.id.trim()
                        ? section.id
                        : `custom-section-${sectionIndex}`,
                title:
                    typeof section.title === "string" && section.title.trim()
                        ? section.title
                        : `Seção ${sectionIndex + 1}`,
                images,
            } as CustomSection;
        })
        .filter((section): section is CustomSection => !!section);
};

export const normalizeReportPayload = (value: unknown): ReportData => {
    let rawValue = value;
    if (typeof rawValue === "string") {
        try {
            rawValue = JSON.parse(rawValue);
        } catch {
            rawValue = {};
        }
    }

    const data = isRecord(rawValue) ? rawValue : {};
    const metricsSource = isRecord(data.metricsConfig) ? data.metricsConfig : {};
    const normalizedMetricsConfig = normalizeBooleanRecord(DEFAULT_METRICS_CONFIG as any, metricsSource) as MetricsConfig;

    // Legacy compatibility for old key names
    if (typeof metricsSource.showGoogleCustoLead === "boolean" && metricsSource.showGoogleCustoPorLead === undefined) {
        normalizedMetricsConfig.showGoogleCustoPorLead = metricsSource.showGoogleCustoLead as boolean;
    }
    if (typeof metricsSource.showMetaCustoLead === "boolean" && metricsSource.showMetaCustoPorLead === undefined) {
        normalizedMetricsConfig.showMetaCustoPorLead = metricsSource.showMetaCustoLead as boolean;
    }

    return {
        objetivos: Array.isArray(data.objetivos)
            ? data.objetivos.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
            : [],
        google: normalizeNumericRecord(defaultReportData.google as any, data.google) as GoogleData,
        meta: normalizeNumericRecord(defaultReportData.meta as any, data.meta) as MetaData,
        linkedin: normalizeNumericRecord(defaultReportData.linkedin as any, data.linkedin) as LinkedinData,
        tiktok: normalizeNumericRecord(defaultReportData.tiktok as any, data.tiktok) as TiktokData,
        shopee: normalizeNumericRecord(defaultReportData.shopee as any, data.shopee) as ShopeeData,
        resumo: typeof data.resumo === "string" ? data.resumo : "",
        criativos: normalizeCreatives(data.criativos),
        criativosRanking: normalizeRankingCreatives(data.criativosRanking),
        showRanking: typeof data.showRanking === "boolean" ? data.showRanking : defaultReportData.showRanking,
        creativeScaleGoogle: Math.min(280, Math.max(100, toFiniteNumber(data.creativeScaleGoogle, defaultReportData.creativeScaleGoogle))),
        creativeScaleMeta: Math.min(280, Math.max(100, toFiniteNumber(data.creativeScaleMeta, defaultReportData.creativeScaleMeta))),
        metricsConfig: normalizedMetricsConfig,
        sectionsConfig: normalizeBooleanRecord(DEFAULT_SECTIONS_CONFIG as any, data.sectionsConfig) as SectionsConfig,
        paineisAnuncio: normalizeAdPanels(data.paineisAnuncio),
        customSections: normalizeCustomSections(data.customSections),
        validationId: typeof data.validationId === "string" && data.validationId.trim() ? data.validationId : undefined,
        validationPassword:
            typeof data.validationPassword === "string" && data.validationPassword.trim()
                ? data.validationPassword
                : undefined,
        validationTime: typeof data.validationTime === "string" && data.validationTime.trim() ? data.validationTime : undefined,
        autoFillSaldos: false,
    };
};

export const parseTemplateLayout = (layout: unknown): Record<string, any> => {
    if (!layout) return {};
    if (typeof layout === "string") {
        try {
            const parsed = JSON.parse(layout);
            return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : {};
        } catch {
            return {};
        }
    }
    return typeof layout === "object" ? (layout as Record<string, any>) : {};
};

export const generateValidationId = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `vld-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const generateValidationPassword = (): string =>
    Math.random().toString(36).slice(2, 8).toUpperCase();
