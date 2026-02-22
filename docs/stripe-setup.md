# Stripe + Supabase setup (Vurp)

## 1) Na tela "Criar uma chave secret" da Stripe
Escolha **"Fornecer esta chave para outro site"**.

## 2) Criar produtos e preços na Stripe
Crie os preços recorrentes (mensal/anual) para:
- Solo
- Agência
- Agência Pro

Copie os `price_...` IDs.

## 3) Variáveis no Frontend (`.env`)
Configure:
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRICE_SOLO_MONTHLY`
- `VITE_STRIPE_PRICE_SOLO_YEARLY`
- `VITE_STRIPE_PRICE_AGENCY_MONTHLY`
- `VITE_STRIPE_PRICE_AGENCY_YEARLY`
- `VITE_STRIPE_PRICE_PRO_MONTHLY`
- `VITE_STRIPE_PRICE_PRO_YEARLY`

## 4) Secrets no Supabase (Edge Functions)
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_SOLO_MONTHLY=price_...
supabase secrets set STRIPE_PRICE_SOLO_YEARLY=price_...
supabase secrets set STRIPE_PRICE_AGENCY_MONTHLY=price_...
supabase secrets set STRIPE_PRICE_AGENCY_YEARLY=price_...
supabase secrets set STRIPE_PRICE_PRO_MONTHLY=price_...
supabase secrets set STRIPE_PRICE_PRO_YEARLY=price_...
supabase secrets set APP_URL=https://vurp.vercel.app
```

## 5) Deploy das Edge Functions
```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-customer-portal
supabase functions deploy stripe-webhook
```

## 6) Webhook na Stripe
No Dashboard Stripe, adicione endpoint:
`https://<SEU-PROJETO>.supabase.co/functions/v1/stripe-webhook`

Eventos recomendados:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## 7) Banco de dados
Aplique a migration:
- `supabase/migrations/20260222123000_stripe_subscription_integration.sql`

Ela adiciona colunas Stripe em `assinaturas` e índices únicos.
