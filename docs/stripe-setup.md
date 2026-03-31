# Abacate Pay v1 + Supabase setup (Vurp)

## Modelo atual

O Vurp esta configurado para usar a API v1 do Abacate Pay com:
- cobranca avulsa de plano mensal ou anual
- compra avulsa de creditos
- confirmacao por webhook

Nao ha assinatura recorrente automatica nesta integracao.

## 1) Variaveis necessarias

Configure:
- `ABACATEPAY_API_KEY`
- `ABACATEPAY_WEBHOOK_SECRET`
- `APP_URL`

Exemplo:

```bash
supabase secrets set ABACATEPAY_API_KEY=abc_dev_...
supabase secrets set ABACATEPAY_WEBHOOK_SECRET=...
supabase secrets set APP_URL=https://vurp.vercel.app
```

## 2) Deploy das Edge Functions

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-credit-checkout
supabase functions deploy stripe-webhook
```

Nota:
- os nomes das functions continuam legados para evitar quebrar o app
- internamente elas ja usam Abacate Pay

## 3) Webhook no Abacate Pay

Adicione endpoint:

`https://wunfuxyhnxyykzzqtcgu.supabase.co/functions/v1/stripe-webhook`

Use o secret/HMAC configurado em `ABACATEPAY_WEBHOOK_SECRET`.

## 4) Banco

Aplique a migration:

- `supabase/migrations/20260330190000_abacatepay_subscription_fields.sql`

## 5) Comportamento da cobranca

- Plano mensal: gera um checkout avulso do ciclo mensal
- Plano anual: gera um checkout avulso do ciclo anual
- Creditos: gera um checkout avulso com quantidade variavel

Se quiser recorrencia automatica no futuro, sera preciso migrar para a API v2 da Abacate Pay ou para outro gateway.
