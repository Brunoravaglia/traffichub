-- Prevent stale Google OAuth sessions from overriding valid legacy agency sessions.
-- This is critical for VCD/admin password login, which sends signed legacy headers.
CREATE OR REPLACE FUNCTION public.current_effective_gestor_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_valid_legacy_session() THEN
    RETURN public.current_legacy_gestor_id();
  END IF;

  IF auth.uid() IS NOT NULL THEN
    RETURN auth.uid();
  END IF;

  RETURN NULL;
END;
$$;

-- Hide solo/OAuth-only records from agency login pickers.
-- Only explicit agency team records should appear under /gestores or the login selector.
CREATE OR REPLACE FUNCTION public.get_agency_login_profiles(p_agencia_id UUID)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  foto_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (lower(g.nome))
    g.id,
    g.nome,
    g.foto_url
  FROM public.gestores g
  WHERE g.agencia_id = p_agencia_id
    AND g.account_type IN ('agency_owner', 'agency_member')
  ORDER BY
    lower(g.nome),
    CASE WHEN COALESCE(g.senha, '') = 'google-oauth' THEN 1 ELSE 0 END,
    g.created_at DESC,
    g.id;
$$;

-- Clean up any solo Google profiles that were accidentally linked to an agency.
UPDATE public.gestores
SET agencia_id = NULL
WHERE COALESCE(senha, '') = 'google-oauth'
  AND COALESCE(account_type, 'solo') = 'solo'
  AND agencia_id IS NOT NULL;

DROP POLICY IF EXISTS "gestores_insert_agency_member_effective" ON public.gestores;

CREATE POLICY "gestores_insert_agency_member_effective"
ON public.gestores FOR INSERT
WITH CHECK (
  public.current_effective_agencia_id() IS NOT NULL
  AND agencia_id = public.current_effective_agencia_id()
  AND account_type = 'agency_member'
);

REVOKE ALL ON FUNCTION public.current_effective_gestor_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_agency_login_profiles(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_effective_gestor_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_agency_login_profiles(UUID) TO anon, authenticated;
