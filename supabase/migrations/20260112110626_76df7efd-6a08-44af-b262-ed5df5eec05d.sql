-- Add edited tracking columns to relatorios table
ALTER TABLE public.relatorios
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;