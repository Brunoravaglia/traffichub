-- Add first_login_at to track welcome message (only show on first login)
ALTER TABLE public.gestores 
ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMP WITH TIME ZONE;

-- Create client_tracking table for GTM, GA4, etc controls
CREATE TABLE public.client_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  
  -- Tracking IDs
  gtm_id TEXT,
  ga4_id TEXT,
  
  -- Status fields
  google_ads_status TEXT,
  clarity_installed BOOLEAN DEFAULT false,
  meta_ads_active BOOLEAN DEFAULT false,
  pixel_installed BOOLEAN DEFAULT false,
  search_console_status TEXT,
  gmn_status TEXT,
  
  -- Financial fields (saldo)
  google_saldo DECIMAL(12,2) DEFAULT 0,
  google_valor_diario DECIMAL(12,2) DEFAULT 0,
  google_dias_restantes INTEGER DEFAULT 0,
  google_ultima_validacao DATE,
  google_proxima_recarga DATE,
  
  meta_saldo DECIMAL(12,2) DEFAULT 0,
  meta_valor_diario DECIMAL(12,2) DEFAULT 0,
  meta_dias_restantes INTEGER DEFAULT 0,
  meta_ultima_validacao DATE,
  meta_proxima_recarga DATE,
  
  -- Client URL
  url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(cliente_id)
);

-- Enable RLS
ALTER TABLE public.client_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all client_tracking access" 
ON public.client_tracking 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_client_tracking_updated_at
BEFORE UPDATE ON public.client_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();