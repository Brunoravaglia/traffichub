-- Create gestores table
CREATE TABLE public.gestores (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert fixed gestores
INSERT INTO public.gestores (nome) VALUES 
    ('Bruno Ravaglia'),
    ('Thiago Pitaluga'),
    ('Guilherme'),
    ('João Vitor'),
    ('Silvio');

-- Create clientes table
CREATE TABLE public.clientes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    gestor_id UUID NOT NULL REFERENCES public.gestores(id),
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create checklists table
CREATE TABLE public.checklists (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Faturamento
    pagamento_ok BOOLEAN NOT NULL DEFAULT false,
    conta_sem_bloqueios BOOLEAN NOT NULL DEFAULT false,
    saldo_suficiente BOOLEAN NOT NULL DEFAULT false,
    -- Rastreamento
    pixel_tag_instalados BOOLEAN NOT NULL DEFAULT false,
    conversoes_configuradas BOOLEAN NOT NULL DEFAULT false,
    integracao_crm BOOLEAN NOT NULL DEFAULT false,
    -- Criativos
    criativos_atualizados BOOLEAN NOT NULL DEFAULT false,
    cta_claro BOOLEAN NOT NULL DEFAULT false,
    teste_ab_ativo BOOLEAN NOT NULL DEFAULT false,
    -- Pendências
    pendencias TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(cliente_id, data)
);

-- Enable RLS
ALTER TABLE public.gestores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations (internal tool, no auth)
CREATE POLICY "Allow all gestores access" ON public.gestores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all clientes access" ON public.clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all checklists access" ON public.checklists FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at
    BEFORE UPDATE ON public.checklists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();