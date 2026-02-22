-- Emergency multi-tenant lockdown
-- Prevent cross-agency data leaks and self-assigned agency on OAuth users.

-- Ensure RLS is enabled on sensitive tables
ALTER TABLE public.gestores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_time_tracking ENABLE ROW LEVEL SECURITY;

-- Drop known permissive/legacy policies
DROP POLICY IF EXISTS "Allow all gestores access" ON public.gestores;
DROP POLICY IF EXISTS "Gestores can view own profile" ON public.gestores;
DROP POLICY IF EXISTS "Gestores can update own profile" ON public.gestores;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.gestores;

DROP POLICY IF EXISTS "Allow all clientes access" ON public.clientes;
DROP POLICY IF EXISTS "Gestores can view their agency's clients" ON public.clientes;
DROP POLICY IF EXISTS "Gestores can manage their agency's clients" ON public.clientes;

DROP POLICY IF EXISTS "Allow all checklists access" ON public.checklists;
DROP POLICY IF EXISTS "Gestores can manage their agency's checklists" ON public.checklists;

DROP POLICY IF EXISTS "Allow all relatorios access" ON public.relatorios;

DROP POLICY IF EXISTS "Allow all client_tracking access" ON public.client_tracking;

DROP POLICY IF EXISTS "Allow all client_reports access" ON public.client_reports;
DROP POLICY IF EXISTS "Gestores can view their agency's reports" ON public.client_reports;
DROP POLICY IF EXISTS "Gestores can manage their agency's reports" ON public.client_reports;

DROP POLICY IF EXISTS "Allow all report_templates access" ON public.report_templates;
DROP POLICY IF EXISTS "Gestores can view global or own templates" ON public.report_templates;
DROP POLICY IF EXISTS "Gestores can manage own templates" ON public.report_templates;

DROP POLICY IF EXISTS "Allow all client_notes access" ON public.client_notes;
DROP POLICY IF EXISTS "Allow all sessions access" ON public.gestor_sessions;
DROP POLICY IF EXISTS "Gestores can view own sessions" ON public.gestor_sessions;
DROP POLICY IF EXISTS "Gestores can insert own sessions" ON public.gestor_sessions;
DROP POLICY IF EXISTS "Gestores can update own sessions" ON public.gestor_sessions;
DROP POLICY IF EXISTS "Allow all client_time_tracking access" ON public.client_time_tracking;

-- GESTORES (critical)
CREATE POLICY "gestores_select_own"
ON public.gestores FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "gestores_insert_own_without_agency"
ON public.gestores FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
  AND agencia_id IS NULL
);

CREATE POLICY "gestores_update_own_no_agency_change"
ON public.gestores FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND agencia_id IS NOT DISTINCT FROM (
    SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid()
  )
);

-- CLIENTES
CREATE POLICY "clientes_select_agency"
ON public.clientes FOR SELECT
TO authenticated
USING (
  agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
);

CREATE POLICY "clientes_manage_agency"
ON public.clientes FOR ALL
TO authenticated
USING (
  agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
)
WITH CHECK (
  agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
);

-- CHECKLISTS (scoped via cliente_id -> clientes.agencia_id)
CREATE POLICY "checklists_manage_agency"
ON public.checklists FOR ALL
TO authenticated
USING (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
)
WITH CHECK (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
);

-- RELATORIOS (legacy table)
CREATE POLICY "relatorios_manage_agency"
ON public.relatorios FOR ALL
TO authenticated
USING (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
)
WITH CHECK (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
);

-- CLIENT_TRACKING
CREATE POLICY "client_tracking_manage_agency"
ON public.client_tracking FOR ALL
TO authenticated
USING (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
)
WITH CHECK (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
);

-- CLIENT_REPORTS
CREATE POLICY "client_reports_manage_agency"
ON public.client_reports FOR ALL
TO authenticated
USING (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
)
WITH CHECK (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
);

-- REPORT_TEMPLATES
CREATE POLICY "report_templates_select_global_or_own"
ON public.report_templates FOR SELECT
TO authenticated
USING (is_global = true OR gestor_id = auth.uid());

CREATE POLICY "report_templates_manage_own"
ON public.report_templates FOR ALL
TO authenticated
USING (gestor_id = auth.uid())
WITH CHECK (gestor_id = auth.uid());

-- CLIENT_NOTES
CREATE POLICY "client_notes_manage_agency"
ON public.client_notes FOR ALL
TO authenticated
USING (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
)
WITH CHECK (
  cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
);

-- CALENDAR_NOTES (owner-only)
CREATE POLICY "calendar_notes_owner_only"
ON public.calendar_notes FOR ALL
TO authenticated
USING (gestor_id = auth.uid())
WITH CHECK (gestor_id = auth.uid());

-- GESTOR_SESSIONS
CREATE POLICY "gestor_sessions_owner_only"
ON public.gestor_sessions FOR ALL
TO authenticated
USING (gestor_id = auth.uid())
WITH CHECK (gestor_id = auth.uid());

-- CLIENT_TIME_TRACKING
CREATE POLICY "client_time_tracking_owner_only"
ON public.client_time_tracking FOR ALL
TO authenticated
USING (
  gestor_id = auth.uid()
  AND cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
)
WITH CHECK (
  gestor_id = auth.uid()
  AND cliente_id IN (
    SELECT c.id FROM public.clientes c
    WHERE c.agencia_id = (SELECT g.agencia_id FROM public.gestores g WHERE g.id = auth.uid())
  )
);
