-- Add password field to gestores table
ALTER TABLE public.gestores 
ADD COLUMN senha text NOT NULL DEFAULT 'vcd123';

-- Add onboarding checklist fields to gestores
ALTER TABLE public.gestores 
ADD COLUMN onboarding_completo boolean NOT NULL DEFAULT false,
ADD COLUMN foto_preenchida boolean NOT NULL DEFAULT false,
ADD COLUMN dados_completos boolean NOT NULL DEFAULT false;

-- Create table for gestor session tracking
CREATE TABLE public.gestor_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gestor_id uuid NOT NULL REFERENCES public.gestores(id) ON DELETE CASCADE,
    login_at timestamp with time zone NOT NULL DEFAULT now(),
    logout_at timestamp with time zone,
    duration_seconds integer
);

-- Enable RLS
ALTER TABLE public.gestor_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for sessions
CREATE POLICY "Allow all gestor_sessions access" 
ON public.gestor_sessions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create table for client time tracking
CREATE TABLE public.client_time_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    gestor_id uuid NOT NULL REFERENCES public.gestores(id) ON DELETE CASCADE,
    cliente_id uuid NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    opened_at timestamp with time zone NOT NULL DEFAULT now(),
    closed_at timestamp with time zone,
    duration_seconds integer,
    session_id uuid REFERENCES public.gestor_sessions(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.client_time_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy for client tracking
CREATE POLICY "Allow all client_time_tracking access" 
ON public.client_time_tracking 
FOR ALL 
USING (true) 
WITH CHECK (true);