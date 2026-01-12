-- Create table for report templates (reusable across clients/gestores)
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_global BOOLEAN NOT NULL DEFAULT false,
  gestor_id UUID REFERENCES public.gestores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for client-specific reports (generated from templates or custom)
CREATE TABLE public.client_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.report_templates(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for report creatives/images
INSERT INTO storage.buckets (id, name, public) VALUES ('report-assets', 'report-assets', true);

-- RLS for report_templates
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all report_templates access" 
ON public.report_templates 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS for client_reports
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all client_reports access" 
ON public.client_reports 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Storage policies for report-assets
CREATE POLICY "Allow public read for report-assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'report-assets');

CREATE POLICY "Allow authenticated upload for report-assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'report-assets');

CREATE POLICY "Allow update for report-assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'report-assets');

CREATE POLICY "Allow delete for report-assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'report-assets');

-- Triggers for updated_at
CREATE TRIGGER update_report_templates_updated_at
BEFORE UPDATE ON public.report_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_reports_updated_at
BEFORE UPDATE ON public.client_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();