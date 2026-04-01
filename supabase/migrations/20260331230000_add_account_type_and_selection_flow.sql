ALTER TABLE public.gestores
ADD COLUMN IF NOT EXISTS account_type TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'gestores_account_type_check'
  ) THEN
    ALTER TABLE public.gestores
    ADD CONSTRAINT gestores_account_type_check
    CHECK (account_type IS NULL OR account_type IN ('solo', 'agency_owner', 'agency_member'));
  END IF;
END $$;

UPDATE public.gestores
SET account_type = CASE
  WHEN agencia_id IS NOT NULL THEN 'agency_owner'
  ELSE 'solo'
END
WHERE account_type IS NULL
  AND created_at < timezone('utc', now()) - interval '5 minutes';

CREATE OR REPLACE FUNCTION public.authenticate_gestor_login(
  p_gestor_id UUID,
  p_password TEXT
)
RETURNS TABLE (
  session_id UUID,
  id UUID,
  nome TEXT,
  foto_url TEXT,
  telefone TEXT,
  cpf TEXT,
  account_type TEXT,
  onboarding_completo BOOLEAN,
  foto_preenchida BOOLEAN,
  dados_completos BOOLEAN,
  first_login_at TIMESTAMPTZ,
  welcome_modal_dismissed BOOLEAN,
  agencia_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gestor public.gestores%ROWTYPE;
  v_session_id UUID;
BEGIN
  SELECT *
  INTO v_gestor
  FROM public.gestores g
  WHERE g.id = p_gestor_id
    AND g.senha = p_password
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  INSERT INTO public.gestor_sessions (gestor_id, duration_seconds)
  VALUES (v_gestor.id, 0)
  RETURNING gestor_sessions.id INTO v_session_id;

  RETURN QUERY
  SELECT
    v_session_id,
    v_gestor.id,
    v_gestor.nome,
    v_gestor.foto_url,
    v_gestor.telefone,
    v_gestor.cpf,
    v_gestor.account_type,
    v_gestor.onboarding_completo,
    v_gestor.foto_preenchida,
    v_gestor.dados_completos,
    v_gestor.first_login_at,
    v_gestor.welcome_modal_dismissed,
    v_gestor.agencia_id;
END;
$$;

REVOKE ALL ON FUNCTION public.authenticate_gestor_login(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.authenticate_gestor_login(UUID, TEXT) TO anon, authenticated;
