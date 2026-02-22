-- Harden RLS Policies for Reports

-- 1. report_templates
DROP POLICY IF EXISTS "Allow all report_templates access" ON public.report_templates;

CREATE POLICY "Gestores can view global or own templates"
ON public.report_templates FOR SELECT
TO authenticated
USING (is_global = true OR gestor_id = auth.uid());

CREATE POLICY "Gestores can manage own templates"
ON public.report_templates FOR ALL
TO authenticated
USING (gestor_id = auth.uid())
WITH CHECK (gestor_id = auth.uid());

-- 2. client_reports
DROP POLICY IF EXISTS "Allow all client_reports access" ON public.client_reports;

CREATE POLICY "Gestores can view their agency's reports"
ON public.client_reports FOR SELECT
TO authenticated
USING (
  cliente_id IN (
    SELECT id FROM public.clientes WHERE agencia_id IN (
      SELECT agencia_id FROM public.gestores WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Gestores can manage their agency's reports"
ON public.client_reports FOR ALL
TO authenticated
USING (
  cliente_id IN (
    SELECT id FROM public.clientes WHERE agencia_id IN (
      SELECT agencia_id FROM public.gestores WHERE id = auth.uid()
    )
  )
)
WITH CHECK (
  cliente_id IN (
    SELECT id FROM public.clientes WHERE agencia_id IN (
      SELECT agencia_id FROM public.gestores WHERE id = auth.uid()
    )
  )
);
