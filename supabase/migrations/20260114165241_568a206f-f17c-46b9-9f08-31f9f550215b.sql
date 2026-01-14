-- Add observacoes column to clientes table
ALTER TABLE public.clientes 
ADD COLUMN observacoes text DEFAULT '';