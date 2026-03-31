ALTER TABLE public.assinaturas
ADD COLUMN IF NOT EXISTS abacate_customer_id TEXT,
ADD COLUMN IF NOT EXISTS abacate_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS abacate_checkout_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS assinaturas_abacate_subscription_id_unique_idx
ON public.assinaturas (abacate_subscription_id)
WHERE abacate_subscription_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS report_credit_transactions_abacate_checkout_id_unique_idx
ON public.report_credit_transactions ((metadata->>'abacatepay_checkout_id'))
WHERE tipo = 'purchase'
  AND (metadata ? 'abacatepay_checkout_id');
