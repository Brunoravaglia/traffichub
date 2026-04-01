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
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPPORT_INBOX_EMAIL`

Exemplo:

```bash
supabase secrets set ABACATEPAY_API_KEY=abc_dev_...
supabase secrets set ABACATEPAY_WEBHOOK_SECRET=...
supabase secrets set APP_URL=https://vurp.space
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set RESEND_FROM_EMAIL="Vurp <noreply@vurp.space>"
supabase secrets set SUPPORT_INBOX_EMAIL=suporte@vurp.com.br
```

## 2) Deploy das Edge Functions

```bash
supabase functions deploy stripe-checkout
supabase functions deploy stripe-credit-checkout
supabase functions deploy stripe-webhook
supabase functions deploy signup-with-rate-limit
supabase functions deploy support-contact
```

Nota:
- os nomes das functions continuam legados para evitar quebrar o app
- internamente elas ja usam Abacate Pay
- emails transacionais sao enviados via Resend no cadastro, pagamento aprovado, compra de creditos e suporte

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
