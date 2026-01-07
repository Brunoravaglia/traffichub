
-- Create reports table for storing metrics
CREATE TABLE public.relatorios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Google Ads metrics
  investimento_google NUMERIC DEFAULT 0,
  impressoes_google INTEGER DEFAULT 0,
  cliques_google INTEGER DEFAULT 0,
  conversoes_google INTEGER DEFAULT 0,
  topo_pesquisas NUMERIC DEFAULT 0,
  taxa_superacao NUMERIC DEFAULT 0,
  top_palavras_chaves TEXT[] DEFAULT '{}',
  
  -- Facebook metrics
  investimento_facebook NUMERIC DEFAULT 0,
  cliques_facebook INTEGER DEFAULT 0,
  conversoes_facebook INTEGER DEFAULT 0,
  alcance_facebook INTEGER DEFAULT 0,
  impressoes_facebook INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;

-- Create policy for all access (since no auth)
CREATE POLICY "Allow all relatorios access"
ON public.relatorios
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_relatorios_updated_at
BEFORE UPDATE ON public.relatorios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
