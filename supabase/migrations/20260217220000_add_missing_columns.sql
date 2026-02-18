-- Add missing is_admin column to gestores table
-- This column was referenced in code but never created in the database,
-- causing login to fail because PostgREST returns 400 for non-existent columns
ALTER TABLE public.gestores
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Add missing columns to agencias table
ALTER TABLE public.agencias
ADD COLUMN IF NOT EXISTS cor_primaria text,
ADD COLUMN IF NOT EXISTS cor_secundaria text,
ADD COLUMN IF NOT EXISTS logo_black_url text;
