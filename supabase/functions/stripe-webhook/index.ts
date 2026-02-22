import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing required environment variables for Stripe webhook function.");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

const priceToPlanId: Record<string, string> = {
  [Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY") ?? ""]: "solo",
  [Deno.env.get("STRIPE_PRICE_SOLO_YEARLY") ?? ""]: "solo",
  [Deno.env.get("STRIPE_PRICE_AGENCY_MONTHLY") ?? ""]: "agency",
  [Deno.env.get("STRIPE_PRICE_AGENCY_YEARLY") ?? ""]: "agency",
  [Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") ?? ""]: "agency-pro",
  [Deno.env.get("STRIPE_PRICE_PRO_YEARLY") ?? ""]: "agency-pro",
};

function resolvePlanId(priceId: string | null | undefined): string {
  if (!priceId) return "free";
  return priceToPlanId[priceId] || "free";
}

async function upsertSubscription(params: {
  gestorId: string;
  planoId: string;
  status: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  priceId?: string | null;
  periodEnd?: number | null;
}) {
  const {
    gestorId,
    planoId,
    status,
    customerId,
    subscriptionId,
    priceId,
    periodEnd,
  } = params;

  await adminClient.from("assinaturas").upsert(
    {
      gestor_id: gestorId,
      plano_id: planoId,
      status,
      stripe_customer_id: customerId ?? null,
      stripe_subscription_id: subscriptionId ?? null,
      stripe_price_id: priceId ?? null,
      data_fim: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "gestor_id" },
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
  } catch (err) {
    console.error("Webhook signature error", err);
    return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;
        const gestorId = session.metadata?.gestor_id;

        if (!gestorId) break;

        let stripeSubscription: Stripe.Subscription | null = null;
        if (subscriptionId) {
          stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        }

        const priceId = stripeSubscription?.items.data[0]?.price.id ?? null;
        const planId = resolvePlanId(priceId);
        const periodEnd = stripeSubscription?.current_period_end ?? null;

        await upsertSubscription({
          gestorId,
          planoId: planId,
          status: "active",
          customerId,
          subscriptionId,
          priceId,
          periodEnd,
        });

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const gestorId = sub.metadata?.gestor_id;
        if (!gestorId) break;

        const priceId = sub.items.data[0]?.price.id ?? null;
        await upsertSubscription({
          gestorId,
          planoId: resolvePlanId(priceId),
          status: sub.status,
          customerId: sub.customer as string,
          subscriptionId: sub.id,
          priceId,
          periodEnd: sub.current_period_end,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const gestorId = sub.metadata?.gestor_id;
        if (!gestorId) break;

        await upsertSubscription({
          gestorId,
          planoId: "free",
          status: "canceled",
          customerId: sub.customer as string,
          subscriptionId: sub.id,
          priceId: sub.items.data[0]?.price.id ?? null,
          periodEnd: sub.current_period_end,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (!subscriptionId) break;

        const { data: assinatura } = await adminClient
          .from("assinaturas")
          .select("gestor_id, plano_id, stripe_customer_id, stripe_subscription_id, stripe_price_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (!assinatura?.gestor_id) break;

        await upsertSubscription({
          gestorId: assinatura.gestor_id,
          planoId: assinatura.plano_id,
          status: "past_due",
          customerId: assinatura.stripe_customer_id,
          subscriptionId: assinatura.stripe_subscription_id,
          priceId: assinatura.stripe_price_id,
        });
        break;
      }

      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stripe-webhook handler error", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
