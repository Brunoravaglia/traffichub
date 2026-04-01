DROP FUNCTION IF EXISTS public.authenticate_gestor_login(UUID, TEXT);

CREATE FUNCTION public.authenticate_gestor_login(
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
