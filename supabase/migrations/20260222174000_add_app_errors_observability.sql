-- App errors observability table (agency-scoped)
CREATE TABLE IF NOT EXISTS public.app_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  agencia_id UUID NOT NULL REFERENCES public.agencias(id) ON DELETE CASCADE,
  gestor_id UUID NOT NULL REFERENCES public.gestores(id) ON DELETE CASCADE,
  cliente_id UUID NULL REFERENCES public.clientes(id) ON DELETE SET NULL,
  route TEXT NULL,
  error_type TEXT NOT NULL DEFAULT 'runtime',
  source TEXT NOT NULL DEFAULT 'web',
  message TEXT NOT NULL,
  stack TEXT NULL,
  user_agent TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_errors_select_agency" ON public.app_errors;
CREATE POLICY "app_errors_select_agency"
ON public.app_errors
FOR SELECT
USING (
  agencia_id = (
    SELECT g.agencia_id
    FROM public.gestores g
    WHERE g.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "app_errors_insert_self_agency" ON public.app_errors;
CREATE POLICY "app_errors_insert_self_agency"
ON public.app_errors
FOR INSERT
WITH CHECK (
  gestor_id = auth.uid()
  AND agencia_id = (
    SELECT g.agencia_id
    FROM public.gestores g
    WHERE g.id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_app_errors_agencia_created_at
  ON public.app_errors (agencia_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_errors_cliente_id
  ON public.app_errors (cliente_id);
