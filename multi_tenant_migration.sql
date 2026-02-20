-- Final Migration: Fix Branding and Cleanup Duplicates

-- 1. Ensure agencias table exists
CREATE TABLE IF NOT EXISTS public.agencias (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    logo_black_url TEXT,
    cor_primaria TEXT DEFAULT '#10b981',
    cor_secundaria TEXT DEFAULT '#059669',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Ensure columns exist in agencias, gestores and clientes
ALTER TABLE public.agencias ADD COLUMN IF NOT EXISTS logo_black_url TEXT;
ALTER TABLE public.agencias ADD COLUMN IF NOT EXISTS cor_primaria TEXT DEFAULT '#10b981';
ALTER TABLE public.agencias ADD COLUMN IF NOT EXISTS cor_secundaria TEXT DEFAULT '#059669';
ALTER TABLE public.gestores ADD COLUMN IF NOT EXISTS agencia_id UUID REFERENCES public.agencias(id);
ALTER TABLE public.gestores ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS agencia_id UUID REFERENCES public.agencias(id);

-- Update Bruno Ravaglia to be an Admin
UPDATE public.gestores SET is_admin = true WHERE nome = 'Bruno Ravaglia';

-- 3. Update/Insert the "Você Digital" agency with the OFFICIAL logo and branding
INSERT INTO public.agencias (nome, slug, logo_url, logo_black_url, cor_primaria, cor_secundaria)
VALUES (
    'Você Digital Propaganda', 
    'vcd', 
    'https://vocedigitalpropaganda.com.br/wp-content/uploads/2022/02/Logo-VCD.svg',
    'https://vocedigitalpropaganda.com.br/wp-content/uploads/2022/02/Logo-VCD.svg', -- This logo is already colorful/backish
    '#EAB308', -- VCD Yellow
    '#CA8A04'
)
ON CONFLICT (slug) DO UPDATE SET 
    logo_url = EXCLUDED.logo_url,
    logo_black_url = EXCLUDED.logo_black_url,
    cor_primaria = EXCLUDED.cor_primaria,
    cor_secundaria = EXCLUDED.cor_secundaria,
    nome = EXCLUDED.nome;

-- 4. Cleanup Duplicated/Incomplete Gestores
-- We'll explicitly delete the ones mentioned by the user that lack photos
DO $$
DECLARE
    vcd_id UUID;
BEGIN
    SELECT id INTO vcd_id FROM public.agencias WHERE slug = 'vcd';
    
    -- Link all to VCD first (if not already linked)
    UPDATE public.gestores SET agencia_id = vcd_id WHERE agencia_id IS NULL;
    
    -- Delete gestores that are clearly duplicates and lack photos
    DELETE FROM public.gestores
    WHERE (
        (nome = 'Guilherme' AND EXISTS (SELECT 1 FROM public.gestores WHERE nome = 'Guilherme Sebastiani'))
        OR (nome = 'Silvio' AND EXISTS (SELECT 1 FROM public.gestores WHERE nome = 'Silvio Arena'))
    )
    AND foto_url IS NULL;

    -- Also handle any exact name duplicates that might still exist
    DELETE FROM public.gestores g1
    using public.gestores g2
    WHERE g1.nome = g2.nome
    AND g1.id <> g2.id
    AND g1.foto_url IS NULL
    AND g2.foto_url IS NOT NULL;
END $$;

-- 5. Enable RLS and public read
ALTER TABLE public.agencias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on agencias" ON public.agencias;
CREATE POLICY "Allow public read on agencias" ON public.agencias FOR SELECT USING (true);
