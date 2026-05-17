import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  mapAbacateFrequencyToInterval,
  verifyAbacateSignature,
} from "../_shared/abacatepay.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  buildCreditsPurchasedEmail,
  buildPlanActivatedEmail,
  sendTransactionalEmail,
} from "../_shared/email.ts";

const abacateWebhookSecret = Deno.env.get("ABACATEPAY_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!abacateWebhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing required environment variables for Abacate Pay webhook function.");
}

const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

type CheckoutWebhookData = {
  id?: string;
  amount?: number;
  externalId?: string | null;
  status?: string;
};

type LegacyEventPayload = {
  event?: string;
  data?: CheckoutWebhookData;
};

type V2EventPayload = {
  id?: string;
  event?: string;
  data?: {
    checkout?: {
      id?: string;
      externalId?: string | null;
      status?: string | null;
    };
    subscription?: {
      id?: string;
      status?: string | null;
      frequency?: string | null;
    };
    customer?: {
      id?: string | null;
    };
  };
};

function parseExternalId(externalId?: string | null) {
  if (!externalId) return null;

  const parts = externalId.split(":");
  const [kind, gestorId, third, fourth] = parts;

  if (!kind || !gestorId) return null;

  if (kind === "plan" && third && fourth) {
    return { kind, gestorId, planId: third, interval: fourth };
  }

  if (kind === "credits" && third) {
    return { kind, gestorId, creditsQty: Number(third) };
  }

  return null;
}

async function addCredits(gestorId: string, creditsQty: number, checkoutId: string) {
  const metadataProbe = {
    source: "abacatepay",
    abacatepay_checkout_id: checkoutId,
  };

  const { data: existingTx } = await adminClient
    .from("report_credit_transactions")
    .select("id")
    .eq("gestor_id", gestorId)
    .eq("tipo", "purchase")
    .contains("metadata", metadataProbe)
    .limit(1);

  if (existingTx && existingTx.length > 0) {
    return false;
  }

  await adminClient.rpc("add_report_credits", {
    p_gestor_id: gestorId,
    p_creditos: creditsQty,
    p_valor_unitario_brl: 1,
    p_descricao: `Compra Abacate Pay de ${creditsQty} crédito(s)`,
    p_metadata: {
      source: "abacatepay",
      abacatepay_checkout_id: checkoutId,
    },
  });

  return true;
}

async function getGestorContact(gestorId: string) {
  const [{ data: gestor }, authResult] = await Promise.all([
    adminClient.from("gestores").select("id, nome, agencia_id").eq("id", gestorId).maybeSingle(),
    adminClient.auth.admin.getUserById(gestorId),
  ]);

  if (!gestor || authResult.error || !authResult.data.user?.email) {
    return null;
  }

  const agencyName = gestor.agencia_id
    ? await adminClient.from("agencias").select("nome").eq("id", gestor.agencia_id).maybeSingle()
    : null;

  return {
    email: authResult.data.user.email,
    name: agencyName?.data?.nome ?? gestor.nome ?? "Gestor Vurp",
  };
}

function normalizeWebhook(rawPayload: string) {
  const parsed = JSON.parse(rawPayload) as LegacyEventPayload | V2EventPayload;
  const legacyData = (parsed as LegacyEventPayload).data;
  const v2Data = (parsed as V2EventPayload).data;
  const checkout = v2Data?.checkout;
  const subscription = v2Data?.subscription;

  return {
    raw: parsed,
    eventId: (parsed as V2EventPayload).id ?? null,
    eventType: parsed.event ?? "",
    checkoutId: checkout?.id ?? legacyData?.id ?? null,
    checkoutStatus: checkout?.status ?? legacyData?.status ?? null,
    externalId: checkout?.externalId ?? legacyData?.externalId ?? null,
    customerId: v2Data?.customer?.id ?? null,
    subscriptionId: subscription?.id ?? null,
    subscriptionStatus: subscription?.status ?? null,
    subscriptionFrequency: subscription?.frequency ?? null,
  };
}

async function registerWebhookEvent(
  eventId: string | null,
  eventType: string,
  externalId: string | null,
  rawPayload: unknown,
) {
  if (!eventId) {
    return { duplicate: false };
  }

  const { error } = await adminClient
    .from("payment_webhook_events")
    .insert({
      provider: "abacatepay",
      event_id: eventId,
      event_type: eventType || "unknown",
      external_id: externalId,
      payload: rawPayload as Record<string, unknown>,
    });

  if (!error) {
    return { duplicate: false };
  }

  if (error.message.toLowerCase().includes("duplicate")) {
    return { duplicate: true };
  }

  throw error;
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

  const rawBody = await req.text();
  const signature = req.headers.get("X-Webhook-Signature") ?? req.headers.get("x-webhook-signature");

  if (!signature || !(await verifyAbacateSignature(rawBody, abacateWebhookSecret, signature))) {
    return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const normalized = normalizeWebhook(rawBody);
    const registration = await registerWebhookEvent(
      normalized.eventId,
      normalized.eventType,
      normalized.externalId,
      normalized.raw,
    );

    if (registration.duplicate) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = parseExternalId(normalized.externalId);

    if (!parsed || !normalized.checkoutId) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (parsed.kind === "plan") {
      const { data: existingSubscription } = await adminClient
        .from("assinaturas")
        .select("status, abacate_checkout_id, abacate_subscription_id")
        .eq("gestor_id", parsed.gestorId)
        .maybeSingle();

      const isCompleted = normalized.eventType === "subscription.completed";
      const isRenewed = normalized.eventType === "subscription.renewed";
      const isCancelled = normalized.eventType === "subscription.cancelled";
      const status = isCancelled
        ? "canceled"
        : isCompleted || isRenewed || normalized.subscriptionStatus?.toUpperCase() === "ACTIVE"
        ? "active"
        : normalized.checkoutStatus?.toUpperCase() === "PAID"
        ? "active"
        : "pending";
      const billingInterval =
        parsed.interval ?? mapAbacateFrequencyToInterval(normalized.subscriptionFrequency);

      await adminClient.from("assinaturas").upsert(
        {
          gestor_id: parsed.gestorId,
          plano_id: parsed.planId,
          status,
          billing_interval: billingInterval,
          payment_provider: "abacatepay",
          abacate_customer_id: normalized.customerId,
          abacate_subscription_id: normalized.subscriptionId,
          abacate_checkout_id: normalized.checkoutId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "gestor_id" },
      );

      const shouldSendPlanEmail = isCompleted && status === "active" && (
        existingSubscription?.status !== "active" ||
        existingSubscription?.abacate_checkout_id !== normalized.checkoutId ||
        existingSubscription?.abacate_subscription_id !== normalized.subscriptionId
      );

      if (shouldSendPlanEmail) {
        const contact = await getGestorContact(parsed.gestorId);
        if (contact) {
          const intervalLabel = billingInterval === "yearly" ? "anual" : "mensal";
          const planNameMap: Record<string, string> = {
            solo: "Solo",
            agency: "Agencia",
            "agency-pro": "Agencia Pro",
          };
          const email = buildPlanActivatedEmail(
            contact.name,
            planNameMap[parsed.planId] ?? parsed.planId,
            intervalLabel,
          );
          await sendTransactionalEmail({
            to: contact.email,
            subject: email.subject,
            html: email.html,
            tags: [
              { name: "flow", value: "plan_activated" },
              { name: "plan", value: parsed.planId },
            ],
          });
        }
      }
    }

    if (parsed.kind === "credits" && Number.isInteger(parsed.creditsQty) && parsed.creditsQty > 0) {
      if (normalized.eventType === "checkout.completed" || normalized.checkoutStatus?.toUpperCase() === "PAID") {
        const creditsAdded = await addCredits(parsed.gestorId, parsed.creditsQty, normalized.checkoutId);
        if (creditsAdded) {
          const contact = await getGestorContact(parsed.gestorId);
          if (contact) {
            const email = buildCreditsPurchasedEmail(contact.name, parsed.creditsQty);
            await sendTransactionalEmail({
              to: contact.email,
              subject: email.subject,
              html: email.html,
              tags: [
                { name: "flow", value: "credits_purchase" },
              ],
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("abacatepay-webhook handler error", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
