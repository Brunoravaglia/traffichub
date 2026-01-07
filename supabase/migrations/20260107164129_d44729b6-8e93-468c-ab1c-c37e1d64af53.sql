-- Adicionar coluna logo_url na tabela clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS logo_url TEXT;