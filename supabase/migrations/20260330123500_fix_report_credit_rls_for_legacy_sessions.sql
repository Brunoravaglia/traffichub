-- Fix report export credit enforcement for legacy password sessions.
-- The export flow inserts into client_reports, which triggers credit
-- consumption for free plans. Under legacy sessions the caller runs as anon,
-- so the trigger must execute with definer privileges and wallet reads must
-- respect the effective gestor helper instead of auth.uid().

DROP POLICY IF EXISTS "Gestores can view own credit wallet" ON public.report_credit_wallets;
CREATE POLICY "Gestores can view own credit wallet"
ON public.report_credit_wallets FOR SELECT
USING (gestor_id = public.current_effective_gestor_id());

DROP POLICY IF EXISTS "Gestores can view own credit transactions" ON public.report_credit_transactions;
CREATE POLICY "Gestores can view own credit transactions"
ON public.report_credit_transactions FOR SELECT
USING (gestor_id = public.current_effective_gestor_id());

CREATE OR REPLACE FUNCTION public.enforce_report_generation_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gestor_id UUID;
  v_is_paid BOOLEAN;
  v_total_reports BIGINT;
  v_wallet_consumed BOOLEAN;
BEGIN
  SELECT c.gestor_id
  INTO v_gestor_id
  FROM public.clientes c
  WHERE c.id = NEW.cliente_id;

  IF v_gestor_id IS NULL THEN
    RAISE EXCEPTION 'Cliente inválido para geração de relatório.';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.assinaturas a
    WHERE a.gestor_id = v_gestor_id
      AND a.status IN ('active', 'trialing')
      AND a.plano_id <> 'free'
  )
  INTO v_is_paid;

  IF v_is_paid THEN
    RETURN NEW;
  END IF;

  SELECT (
    COALESCE((
      SELECT COUNT(*)
      FROM public.relatorios r
      JOIN public.clientes c1 ON c1.id = r.cliente_id
      WHERE c1.gestor_id = v_gestor_id
    ), 0)
    +
    COALESCE((
      SELECT COUNT(*)
      FROM public.client_reports cr
      JOIN public.clientes c2 ON c2.id = cr.cliente_id
      WHERE c2.gestor_id = v_gestor_id
    ), 0)
  )
  INTO v_total_reports;

  IF v_total_reports < 3 THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.report_credit_wallets (gestor_id, saldo_creditos, total_comprados, total_consumidos, updated_at)
  VALUES (v_gestor_id, 0, 0, 0, now())
  ON CONFLICT (gestor_id) DO NOTHING;

  UPDATE public.report_credit_wallets
  SET
    saldo_creditos = saldo_creditos - 1,
    total_consumidos = total_consumidos + 1,
    updated_at = now()
  WHERE gestor_id = v_gestor_id
    AND saldo_creditos > 0
  RETURNING true INTO v_wallet_consumed;

  IF COALESCE(v_wallet_consumed, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Limite gratuito de 3 relatórios atingido. Compre créditos ou assine um plano para continuar.';
  END IF;

  INSERT INTO public.report_credit_transactions (
    gestor_id,
    tipo,
    creditos_delta,
    valor_brl,
    descricao,
    metadata
  )
  VALUES (
    v_gestor_id,
    'consume',
    -1,
    0,
    'Consumo de 1 crédito na geração de relatório',
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'cliente_id', NEW.cliente_id
    )
  );

  RETURN NEW;
END;
$$;
