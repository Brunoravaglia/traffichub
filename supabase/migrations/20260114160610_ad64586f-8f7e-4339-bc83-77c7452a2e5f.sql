-- Add columns for report sending notification
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS relatorio_semanal_enviado boolean DEFAULT false;
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS relatorio_semanal_data timestamp with time zone;

-- Create a table to store saved client reports with all data
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS google_cliques integer DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS google_impressoes integer DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS google_contatos integer DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS google_investido numeric DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS google_custo_por_lead numeric DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS google_cpm numeric DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS meta_impressoes integer DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS meta_engajamento integer DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS meta_conversas integer DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS meta_investido numeric DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS meta_custo_por_lead numeric DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS meta_cpm numeric DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS meta_custo_por_seguidor numeric DEFAULT 0;
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS objetivos text[] DEFAULT '{}';
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS resumo text DEFAULT '';
ALTER TABLE client_reports ADD COLUMN IF NOT EXISTS criativos jsonb DEFAULT '[]';

-- Add column for gestor to track if welcome modal was dismissed
ALTER TABLE gestores ADD COLUMN IF NOT EXISTS welcome_modal_dismissed boolean DEFAULT false;