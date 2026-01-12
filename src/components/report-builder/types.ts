export type ReportBlockType = 
  | 'header'
  | 'section-title'
  | 'metric-card'
  | 'metric-row'
  | 'image'
  | 'creative-gallery'
  | 'chart'
  | 'text'
  | 'objectives'
  | 'footer'
  | 'balance-info';

export interface ReportBlock {
  id: string;
  type: ReportBlockType;
  config: Record<string, unknown>;
}

export interface MetricCardConfig {
  icon: string;
  label: string;
  value: string;
  valueKey?: string; // For dynamic data binding
}

export interface MetricRowConfig {
  title: string;
  platform: 'google' | 'meta';
  metrics: MetricCardConfig[];
}

export interface HeaderConfig {
  clientName: string;
  clientLogo?: string;
  periodStart: string;
  periodEnd: string;
  title?: string;
}

export interface SectionTitleConfig {
  title: string;
  platform?: 'google' | 'meta';
}

export interface ImageConfig {
  url: string;
  caption?: string;
  aspectRatio?: string;
}

export interface CreativeGalleryConfig {
  images: {
    url: string;
    likes?: number;
    comments?: number;
    date?: string;
    views?: number;
    engagement?: string;
  }[];
  title?: string;
}

export interface TextConfig {
  content: string;
  variant: 'paragraph' | 'highlight' | 'note';
}

export interface ObjectivesConfig {
  objectives: string[];
  description?: string;
}

export interface BalanceInfoConfig {
  googleBalance?: string;
  metaBalance?: string;
}

export interface FooterConfig {
  companyName: string;
  companyLogo?: string;
  instagram?: string;
  website?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area';
  title: string;
  data: { name: string; value: number }[];
}

export interface ReportTemplate {
  id: string;
  nome: string;
  descricao?: string;
  layout: ReportBlock[];
  is_global: boolean;
  gestor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientReport {
  id: string;
  cliente_id: string;
  template_id?: string;
  nome: string;
  periodo_inicio: string;
  periodo_fim: string;
  layout: ReportBlock[];
  data_values: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
