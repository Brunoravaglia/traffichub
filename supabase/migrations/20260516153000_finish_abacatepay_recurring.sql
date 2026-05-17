ALTER TABLE public.assinaturas
ADD COLUMN IF NOT EXISTS billing_interval TEXT CHECK (billing_interval IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'abacatepay';

CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  external_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_webhook_events_provider_event_id_unique_idx
ON public.payment_webhook_events (provider, event_id);

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages webhook events" ON public.payment_webhook_events;
CREATE POLICY "Service role manages webhook events"
ON public.payment_webhook_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
