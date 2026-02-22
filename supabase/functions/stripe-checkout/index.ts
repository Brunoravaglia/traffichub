import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { corsHeaders } from "../_shared/cors.ts";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecretKey || !supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Missing required environment variables for Stripe checkout function.");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

const priceToPlanId: Record<string, string> = {
  [Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY") ?? ""]: "solo",
  [Deno.env.get("STRIPE_PRICE_SOLO_YEARLY") ?? ""]: "solo",
  [Deno.env.get("STRIPE_PRICE_AGENCY_MONTHLY") ?? ""]: "agency",
  [Deno.env.get("STRIPE_PRICE_AGENCY_YEARLY") ?? ""]: "agency",
  [Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") ?? ""]: "agency-pro",
  [Deno.env.get("STRIPE_PRICE_PRO_YEARLY") ?? ""]: "agency-pro",
};

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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { priceId, successPath, cancelPath } = await req.json();

    if (!priceId || typeof priceId !== "string") {
      return new Response(JSON.stringify({ error: "priceId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: gestor, error: gestorError } = await adminClient
      .from("gestores")
      .select("id, nome")
      .eq("id", userData.user.id)
      .single();

    if (gestorError || !gestor) {
      return new Response(JSON.stringify({ error: "Gestor profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: assinatura } = await adminClient
      .from("assinaturas")
      .select("id, stripe_customer_id")
      .eq("gestor_id", gestor.id)
      .maybeSingle();

    let stripeCustomerId = assinatura?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.user.email ?? undefined,
        name: gestor.nome ?? undefined,
        metadata: {
          gestor_id: gestor.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    const origin = req.headers.get("origin") ?? Deno.env.get("APP_URL") ?? "http://localhost:8080";
    const successUrl = `${origin}${successPath || "/account/billing"}?stripe=success`;
    const cancelUrl = `${origin}${cancelPath || "/pricing"}?stripe=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        gestor_id: gestor.id,
        plan_id: priceToPlanId[priceId] || "free",
      },
      subscription_data: {
        metadata: {
          gestor_id: gestor.id,
          plan_id: priceToPlanId[priceId] || "free",
        },
      },
    });

    await adminClient.from("assinaturas").upsert(
      {
        gestor_id: gestor.id,
        plano_id: priceToPlanId[priceId] || "free",
        status: "pending",
        stripe_customer_id: stripeCustomerId,
        stripe_price_id: priceId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "gestor_id" },
    );

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stripe-checkout error", error);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
