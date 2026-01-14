-- Add recharge frequency fields to client_tracking
ALTER TABLE public.client_tracking 
ADD COLUMN google_recarga_tipo text DEFAULT 'mensal',
ADD COLUMN meta_recarga_tipo text DEFAULT 'mensal';

-- Add comments for documentation
COMMENT ON COLUMN public.client_tracking.google_recarga_tipo IS 'Tipo de recarga: mensal, semanal, continuo';
COMMENT ON COLUMN public.client_tracking.meta_recarga_tipo IS 'Tipo de recarga: mensal, semanal, continuo';