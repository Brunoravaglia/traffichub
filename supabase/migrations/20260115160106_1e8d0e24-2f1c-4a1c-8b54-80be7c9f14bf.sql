-- Add redes_sociais to client_tracking if not already present (for showing balances based on contracted services)
-- Check if column exists before adding
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_tracking' AND column_name = 'gtm_ids') THEN
        ALTER TABLE public.client_tracking ADD COLUMN gtm_ids text[] DEFAULT '{}'::text[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_tracking' AND column_name = 'ga4_ids') THEN
        ALTER TABLE public.client_tracking ADD COLUMN ga4_ids text[] DEFAULT '{}'::text[];
    END IF;
END $$;

-- Create report_templates_metrics table for metric configurations
CREATE TABLE IF NOT EXISTS public.report_template_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.report_templates(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT DEFAULT 'zap',
  platform TEXT NOT NULL CHECK (platform IN ('google', 'meta', 'both')),
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.report_template_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all report_template_metrics access"
ON public.report_template_metrics FOR ALL
USING (true)
WITH CHECK (true);