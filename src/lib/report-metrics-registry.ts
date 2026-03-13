/**
 * Unified metrics registry — single source of truth for all metric definitions.
 * Replaces the brittle if/else chain in applyMetricsFromTemplate and the
 * duplicated array in handleSaveAsTemplate.
 */

import type { MetricsConfig, Platform } from "./report-types";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface MetricDefinition {
    /** Template key, e.g. "google_cpl" */
    key: string;
    /** Corresponding boolean key in MetricsConfig, e.g. "showGoogleCustoPorLead" */
    configKey: keyof MetricsConfig;
    /** Display label */
    label: string;
    /** Platform this metric belongs to */
    platform: Platform;
    /** Icon hint (used by template cards) */
    icon: string;
    /** Alternative template keys that should map to the same configKey */
    aliases?: string[];
    /** If true, this is a "core" metric always shown (not togglable) */
    alwaysVisible?: boolean;
}

export interface TemplateMetric {
    key: string;
    label: string;
    icon: string;
    platform: string;
    visible: boolean;
}

// ─── Registry ──────────────────────────────────────────────────────────────

export const METRICS_REGISTRY: MetricDefinition[] = [
    // ── Google Ads ──────────────────────────────────────────────────────────
    { key: "google_cliques", configKey: "showGoogleCustoPorLead", label: "Cliques", platform: "google", icon: "click", alwaysVisible: true },
    { key: "google_impressoes", configKey: "showGoogleCustoPorLead", label: "Impressões", platform: "google", icon: "eye", alwaysVisible: true },
    { key: "google_contatos", configKey: "showGoogleCustoPorLead", label: "Conversões", platform: "google", icon: "message", alwaysVisible: true },
    { key: "google_investido", configKey: "showGoogleCustoPorLead", label: "Investido", platform: "google", icon: "dollar", alwaysVisible: true },
    { key: "google_cpl", configKey: "showGoogleCustoPorLead", label: "Custo por Lead", platform: "google", icon: "target", aliases: ["google_custo_por_lead", "google_custo_lead"] },
    { key: "google_cpm", configKey: "showGoogleCpm", label: "CPM", platform: "google", icon: "trending" },
    { key: "google_ctr", configKey: "showGoogleCtr", label: "CTR (%)", platform: "google", icon: "percent" },
    { key: "google_cpc", configKey: "showGoogleCpc", label: "CPC", platform: "google", icon: "dollar" },
    { key: "google_conversoes", configKey: "showGoogleConversoes", label: "Conversões", platform: "google", icon: "check" },
    { key: "google_taxa_conversao", configKey: "showGoogleTaxaConversao", label: "Taxa de Conversão", platform: "google", icon: "percent" },
    { key: "google_roas", configKey: "showGoogleRoas", label: "ROAS", platform: "google", icon: "trending" },
    { key: "google_roas_valor", configKey: "showGoogleRoasValor", label: "ROAS (Valor)", platform: "google", icon: "trending" },
    { key: "google_custo_conversao", configKey: "showGoogleCustoConversao", label: "Custo por Conversão", platform: "google", icon: "target" },
    { key: "google_alcance", configKey: "showGoogleAlcance", label: "Alcance", platform: "google", icon: "users" },
    { key: "google_frequencia", configKey: "showGoogleFrequencia", label: "Frequência", platform: "google", icon: "repeat" },
    { key: "google_visualizacoes_video", configKey: "showGoogleVisualizacoesVideo", label: "Visualizações de Vídeo", platform: "google", icon: "play" },
    { key: "google_taxa_visualizacao", configKey: "showGoogleTaxaVisualizacao", label: "Taxa de Visualização", platform: "google", icon: "percent" },
    { key: "google_interacoes", configKey: "showGoogleInteracoes", label: "Interações", platform: "google", icon: "mouse" },
    { key: "google_taxa_interacao", configKey: "showGoogleTaxaInteracao", label: "Taxa de Interação", platform: "google", icon: "percent" },
    { key: "google_compras", configKey: "showGoogleCompras", label: "Compras", platform: "google", icon: "cart" },
    { key: "google_visitas_produto", configKey: "showGoogleVisitasProduto", label: "Visitas ao Produto", platform: "google", icon: "eye" },
    { key: "google_adicoes_carrinho", configKey: "showGoogleAdicoesCarrinho", label: "Adições ao Carrinho", platform: "google", icon: "cart" },
    { key: "google_vendas", configKey: "showGoogleVendas", label: "Vendas", platform: "google", icon: "dollar" },
    { key: "google_custo_por_visita", configKey: "showGoogleCustoPorVisita", label: "Custo por Visita", platform: "google", icon: "target" },
    { key: "google_custo_por_adicao_carrinho", configKey: "showGoogleCustoPorAdicaoCarrinho", label: "Custo por Adição ao Carrinho", platform: "google", icon: "target" },
    { key: "google_custo_por_venda", configKey: "showGoogleCustoPorVenda", label: "Custo por Venda", platform: "google", icon: "target" },

    // ── Meta Ads ────────────────────────────────────────────────────────────
    { key: "meta_impressoes", configKey: "showMetaCustoPorLead", label: "Impressões", platform: "meta", icon: "eye", alwaysVisible: true },
    { key: "meta_investido", configKey: "showMetaCustoPorLead", label: "Investido", platform: "meta", icon: "dollar", alwaysVisible: true },
    { key: "meta_engajamento", configKey: "showMetaEngajamento", label: "Engajamento", platform: "meta", icon: "trending" },
    { key: "meta_conversas", configKey: "showMetaConversas", label: "Conversas", platform: "meta", icon: "message" },
    { key: "meta_cpl", configKey: "showMetaCustoPorLead", label: "Custo por Lead", platform: "meta", icon: "target", aliases: ["meta_custo_por_lead", "meta_custo_lead"] },
    { key: "meta_cpm", configKey: "showMetaCpm", label: "CPM", platform: "meta", icon: "trending" },
    { key: "meta_custo_seguidor", configKey: "showMetaCustoPorSeguidor", label: "Custo por Seguidor", platform: "meta", icon: "users", aliases: ["meta_custo_por_seguidor"] },
    { key: "meta_cliques", configKey: "showMetaCliques", label: "Cliques no Link", platform: "meta", icon: "click" },
    { key: "meta_ctr", configKey: "showMetaCtr", label: "CTR (%)", platform: "meta", icon: "percent" },
    { key: "meta_cpc", configKey: "showMetaCpc", label: "CPC", platform: "meta", icon: "dollar" },
    { key: "meta_alcance", configKey: "showMetaAlcance", label: "Alcance", platform: "meta", icon: "users" },
    { key: "meta_frequencia", configKey: "showMetaFrequencia", label: "Frequência", platform: "meta", icon: "repeat" },
    { key: "meta_leads", configKey: "showMetaLeads", label: "Leads Gerados", platform: "meta", icon: "user-plus" },
    { key: "meta_conversoes", configKey: "showMetaConversoes", label: "Conversões", platform: "meta", icon: "check" },
    { key: "meta_roas", configKey: "showMetaRoas", label: "ROAS", platform: "meta", icon: "trending" },
    { key: "meta_roas_valor", configKey: "showMetaRoasValor", label: "ROAS (Valor)", platform: "meta", icon: "trending" },
    { key: "meta_curtidas_pagina", configKey: "showMetaCurtidasPagina", label: "Curtidas na Página", platform: "meta", icon: "thumbs-up" },
    { key: "meta_seguidores", configKey: "showMetaSeguidores", label: "Novos Seguidores", platform: "meta", icon: "user-plus" },
    { key: "meta_compartilhamentos", configKey: "showMetaCompartilhamentos", label: "Compartilhamentos", platform: "meta", icon: "share" },
    { key: "meta_salvos", configKey: "showMetaSalvos", label: "Salvos", platform: "meta", icon: "bookmark" },
    { key: "meta_comentarios", configKey: "showMetaComentarios", label: "Comentários", platform: "meta", icon: "message-circle" },
    { key: "meta_visualizacoes_video", configKey: "showMetaVisualizacoesVideo", label: "Visualizações de Vídeo", platform: "meta", icon: "play" },
    { key: "meta_retencao_video", configKey: "showMetaRetencaoVideo", label: "Retenção de Vídeo (%)", platform: "meta", icon: "percent" },
    { key: "meta_mensagens_iniciadas", configKey: "showMetaMensagensIniciadas", label: "Mensagens Iniciadas", platform: "meta", icon: "send" },
    { key: "meta_respostas_mensagem", configKey: "showMetaRespostasMensagem", label: "Respostas de Mensagem", platform: "meta", icon: "reply" },
    { key: "meta_agendamentos", configKey: "showMetaAgendamentos", label: "Agendamentos", platform: "meta", icon: "calendar" },
    { key: "meta_checkins", configKey: "showMetaCheckins", label: "Check-ins", platform: "meta", icon: "map-pin" },
    { key: "meta_compras", configKey: "showMetaCompras", label: "Compras", platform: "meta", icon: "cart" },
    { key: "meta_visitas_produto", configKey: "showMetaVisitasProduto", label: "Visitas ao Produto", platform: "meta", icon: "eye" },
    { key: "meta_adicoes_carrinho", configKey: "showMetaAdicoesCarrinho", label: "Adições ao Carrinho", platform: "meta", icon: "cart" },
    { key: "meta_vendas", configKey: "showMetaVendas", label: "Vendas", platform: "meta", icon: "dollar" },
    { key: "meta_custo_por_visita", configKey: "showMetaCustoPorVisita", label: "Custo por Visita", platform: "meta", icon: "target" },
    { key: "meta_custo_por_adicao_carrinho", configKey: "showMetaCustoPorAdicaoCarrinho", label: "Custo por Adição ao Carrinho", platform: "meta", icon: "target" },
    { key: "meta_custo_por_venda", configKey: "showMetaCustoPorVenda", label: "Custo por Venda", platform: "meta", icon: "target" },

    // ── LinkedIn Ads ────────────────────────────────────────────────────────
    { key: "linkedin_impressoes", configKey: "showLinkedinCpm", label: "Impressões", platform: "linkedin", icon: "eye", alwaysVisible: true },
    { key: "linkedin_cliques", configKey: "showLinkedinCpc", label: "Cliques", platform: "linkedin", icon: "click", alwaysVisible: true },
    { key: "linkedin_investido", configKey: "showLinkedinCpm", label: "Investido", platform: "linkedin", icon: "dollar", alwaysVisible: true },
    { key: "linkedin_cpm", configKey: "showLinkedinCpm", label: "CPM", platform: "linkedin", icon: "trending" },
    { key: "linkedin_cpc", configKey: "showLinkedinCpc", label: "CPC", platform: "linkedin", icon: "dollar" },
    { key: "linkedin_ctr", configKey: "showLinkedinCtr", label: "CTR (%)", platform: "linkedin", icon: "percent" },
    { key: "linkedin_cpl", configKey: "showLinkedinCpl", label: "CPL", platform: "linkedin", icon: "target" },
    { key: "linkedin_leads", configKey: "showLinkedinLeads", label: "Leads", platform: "linkedin", icon: "user-plus" },
    { key: "linkedin_conversoes", configKey: "showLinkedinConversoes", label: "Conversões", platform: "linkedin", icon: "check" },
    { key: "linkedin_alcance", configKey: "showLinkedinAlcance", label: "Alcance", platform: "linkedin", icon: "users" },

    // ── TikTok Ads ──────────────────────────────────────────────────────────
    { key: "tiktok_impressoes", configKey: "showTiktokCpm", label: "Impressões", platform: "tiktok", icon: "eye", alwaysVisible: true },
    { key: "tiktok_cliques", configKey: "showTiktokCpc", label: "Cliques", platform: "tiktok", icon: "click", alwaysVisible: true },
    { key: "tiktok_investido", configKey: "showTiktokCpm", label: "Investido", platform: "tiktok", icon: "dollar", alwaysVisible: true },
    { key: "tiktok_cpm", configKey: "showTiktokCpm", label: "CPM", platform: "tiktok", icon: "trending" },
    { key: "tiktok_cpc", configKey: "showTiktokCpc", label: "CPC", platform: "tiktok", icon: "dollar" },
    { key: "tiktok_ctr", configKey: "showTiktokCtr", label: "CTR (%)", platform: "tiktok", icon: "percent" },
    { key: "tiktok_cpl", configKey: "showTiktokCpl", label: "CPL", platform: "tiktok", icon: "target" },
    { key: "tiktok_leads", configKey: "showTiktokLeads", label: "Leads", platform: "tiktok", icon: "user-plus" },
    { key: "tiktok_conversoes", configKey: "showTiktokConversoes", label: "Conversões", platform: "tiktok", icon: "check" },
    { key: "tiktok_views", configKey: "showTiktokViews", label: "Views de Vídeo", platform: "tiktok", icon: "eye" },

    // ── Shopee Ads ──────────────────────────────────────────────────────────
    { key: "shopee_impressoes", configKey: "showShopeeCpm", label: "Impressões", platform: "shopee", icon: "eye", alwaysVisible: true },
    { key: "shopee_cliques", configKey: "showShopeeCpc", label: "Cliques", platform: "shopee", icon: "click", alwaysVisible: true },
    { key: "shopee_investido", configKey: "showShopeeCpm", label: "Investido", platform: "shopee", icon: "dollar", alwaysVisible: true },
    { key: "shopee_pedidos", configKey: "showShopeePedidos", label: "Pedidos", platform: "shopee", icon: "check" },
    { key: "shopee_gmv", configKey: "showShopeeGmv", label: "GMV", platform: "shopee", icon: "trending" },
    { key: "shopee_cpm", configKey: "showShopeeCpm", label: "CPM", platform: "shopee", icon: "trending" },
    { key: "shopee_cpc", configKey: "showShopeeCpc", label: "CPC", platform: "shopee", icon: "dollar" },
    { key: "shopee_ctr", configKey: "showShopeeCtr", label: "CTR (%)", platform: "shopee", icon: "percent" },
    { key: "shopee_cpa", configKey: "showShopeeCpa", label: "CPA", platform: "shopee", icon: "target" },
    { key: "shopee_roas", configKey: "showShopeeRoas", label: "ROAS", platform: "shopee", icon: "trending" },
];

// ─── Lookup maps (built once) ──────────────────────────────────────────────

/** Map from template key (including aliases) → MetricDefinition */
const _keyToDefinition = new Map<string, MetricDefinition>();
for (const def of METRICS_REGISTRY) {
    _keyToDefinition.set(def.key, def);
    if (def.aliases) {
        for (const alias of def.aliases) {
            _keyToDefinition.set(alias, def);
        }
    }
}

/** Get togglable (non-alwaysVisible) metrics for a given platform */
export function getTogglableMetrics(platform?: Platform): MetricDefinition[] {
    const filtered = METRICS_REGISTRY.filter((m) => !m.alwaysVisible);
    if (!platform) return filtered;
    return filtered.filter((m) => m.platform === platform);
}

/** Get all metrics for a given platform */
export function getMetricsForPlatform(platform: Platform): MetricDefinition[] {
    return METRICS_REGISTRY.filter((m) => m.platform === platform);
}

// ─── Conversion functions ──────────────────────────────────────────────────

/**
 * Convert template metric array → MetricsConfig.
 * Replaces the 70-line if/else chain in applyMetricsFromTemplate.
 */
export function applyMetricsFromRegistry(
    templateMetrics: TemplateMetric[],
    baseConfig: MetricsConfig,
): MetricsConfig {
    const config = { ...baseConfig };

    for (const tm of templateMetrics) {
        const key = typeof tm?.key === "string" ? tm.key : "";
        if (!key) continue;

        const def = _keyToDefinition.get(key);
        if (def && !def.alwaysVisible) {
            config[def.configKey] = !!tm.visible;
        }
    }

    return config;
}

/**
 * Convert current MetricsConfig → template metrics array.
 * Replaces the duplicated array in handleSaveAsTemplate.
 */
export function metricsConfigToTemplate(config: MetricsConfig): TemplateMetric[] {
    return METRICS_REGISTRY
        .filter((def) => !def.alwaysVisible)
        .map((def) => ({
            key: def.key,
            label: def.label,
            icon: def.icon,
            platform: def.platform,
            visible: config[def.configKey],
        }));
}

/**
 * Build the full metrics array for template save (including always-visible).
 * Used by handleSaveAsTemplate in RelatorioCliente.
 */
export function metricsConfigToFullTemplate(config: MetricsConfig): TemplateMetric[] {
    return METRICS_REGISTRY.map((def) => ({
        key: def.key,
        label: def.label,
        icon: def.icon,
        platform: def.platform,
        visible: def.alwaysVisible ? true : config[def.configKey],
    }));
}
