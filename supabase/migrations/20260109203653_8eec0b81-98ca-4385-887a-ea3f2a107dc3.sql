-- Adicionar campos de contato na tabela gestores
ALTER TABLE public.gestores 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb;

-- Adicionar campo de telefone de contato na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS telefone_contato TEXT;