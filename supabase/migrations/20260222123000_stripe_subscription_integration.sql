-- Stripe integration fields on subscriptions
ALTER TABLE public.assinaturas
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- One active/current subscription row per gestor (upsert target)
CREATE UNIQUE INDEX IF NOT EXISTS assinaturas_gestor_id_unique_idx
ON public.assinaturas (gestor_id);

-- Ensure uniqueness for Stripe IDs when present
CREATE UNIQUE INDEX IF NOT EXISTS assinaturas_stripe_customer_id_unique_idx
ON public.assinaturas (stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS assinaturas_stripe_subscription_id_unique_idx
ON public.assinaturas (stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;
