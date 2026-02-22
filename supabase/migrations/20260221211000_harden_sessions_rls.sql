-- Harden RLS Policies for Gestor Sessions

DROP POLICY IF EXISTS "Allow all sessions access" ON public.gestor_sessions; -- Checking if it existed with this name or similar

ALTER TABLE public.gestor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores can view own sessions"
ON public.gestor_sessions FOR SELECT
TO authenticated
USING (gestor_id = auth.uid());

CREATE POLICY "Gestores can insert own sessions"
ON public.gestor_sessions FOR INSERT
TO authenticated
WITH CHECK (gestor_id = auth.uid());

CREATE POLICY "Gestores can update own sessions"
ON public.gestor_sessions FOR UPDATE
TO authenticated
USING (gestor_id = auth.uid())
WITH CHECK (gestor_id = auth.uid());
