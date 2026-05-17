import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createSubscriptionCheckout,
  getOrCreateCustomer,
  getOrCreateProduct,
} from "../_shared/abacatepay.ts";
import { corsHeaders } from "../_shared/cors.ts";

const abacateApiKey = Deno.env.get("ABACATEPAY_API_KEY");
const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:8080";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!abacateApiKey || !supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Missing required environment variables for Abacate Pay checkout function.");
}

const planCatalog: Record<
  string,
  { name: string; monthly: number; yearly: number; description: string }
> = {
  solo: {
    name: "Plano Solo",
    monthly: 2790,
    yearly: 26784,
    description: "Plano recorrente para gestores independentes no Vurp.",
  },
  agency: {
    name: "Plano Agencia",
    monthly: 9700,
    yearly: 93120,
    description: "Plano recorrente para operação de agência no Vurp.",
  },
  "agency-pro": {
    name: "Plano Agencia Pro",
    monthly: 19700,
    yearly: 189120,
    description: "Plano recorrente premium para agências no Vurp.",
  },
};

type GestorRecord = {
  id: string;
  nome: string | null;
  telefone: string | null;
  cpf: string | null;
  agencia_id: string | null;
};

async function resolveGestor(
  req: Request,
  userClient: ReturnType<typeof createClient>,
  adminClient: ReturnType<typeof createClient>,
): Promise<{ gestor: GestorRecord | null; errorResponse?: Response }> {
  const legacyGestorId = req.headers.get("x-vurp-gestor-id");

  const { data: userData } = await userClient.auth.getUser();
  const resolvedGestorId = userData.user?.id ?? legacyGestorId;

  if (!resolvedGestorId) {
    return {
      gestor: null,
      errorResponse: new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  const { data: gestor, error } = await adminClient
    .from("gestores")
    .select("id, nome, telefone, cpf, agencia_id")
    .eq("id", resolvedGestorId)
    .single();

  if (error || !gestor) {
    return {
      gestor: null,
      errorResponse: new Response(JSON.stringify({ error: "Gestor profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }),
    };
  }

  return { gestor: gestor as GestorRecord };
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

  try {
    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: authData } = await userClient.auth.getUser();

    const { gestor, errorResponse } = await resolveGestor(req, userClient, adminClient);
    if (!gestor || errorResponse) {
      return errorResponse!;
    }

    const billingEmail = authData.user?.email ?? null;
    if (!billingEmail) {
      return new Response(JSON.stringify({ error: "Para pagar com Abacate Pay, entre com Google ou use uma conta com email autenticado." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { planId, interval } = await req.json();

    if (typeof planId !== "string" || !["solo", "agency", "agency-pro"].includes(planId)) {
      return new Response(JSON.stringify({ error: "planId inválido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (interval !== "monthly" && interval !== "yearly") {
      return new Response(JSON.stringify({ error: "interval inválido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = planCatalog[planId];
    const externalId = `plan:${gestor.id}:${planId}:${interval}:${Date.now()}`;
    const agencyDocument = gestor.agencia_id
      ? await adminClient.from("agencias").select("nome, cnpj").eq("id", gestor.agencia_id).maybeSingle()
      : null;

    const taxId = gestor.agencia_id ? agencyDocument?.data?.cnpj ?? null : gestor.cpf;
    if (!taxId) {
      return new Response(JSON.stringify({
        error: gestor.agencia_id
          ? "Cadastre o CNPJ da agência antes de cobrar este plano."
          : "Cadastre seu CPF na conta antes de iniciar o pagamento.",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!gestor.telefone) {
      return new Response(JSON.stringify({ error: "Cadastre um telefone antes de iniciar o pagamento." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customer = await getOrCreateCustomer(abacateApiKey, {
      email: billingEmail,
      name: gestor.agencia_id ? agencyDocument?.data?.nome ?? gestor.nome ?? "Agencia Vurp" : gestor.nome ?? "Gestor Vurp",
      cellphone: gestor.telefone,
      taxId,
      metadata: {
        gestorId: gestor.id,
        agencyId: gestor.agencia_id,
        source: "vurp-plan-checkout",
      },
    });

    const product = await getOrCreateProduct(abacateApiKey, {
      externalId: `vurp-plan-${planId}-${interval}`,
      name: `${plan.name} ${interval === "monthly" ? "Mensal" : "Anual"}`,
      description: plan.description,
      price: interval === "monthly" ? plan.monthly : plan.yearly,
      cycle: interval === "monthly" ? "MONTHLY" : "ANNUALLY",
    });

    const checkout = await createSubscriptionCheckout(abacateApiKey, {
      productId: product.id,
      customerId: customer.id,
      externalId,
      returnUrl: `${appUrl}/pricing?abacate=cancel`,
      completionUrl: `${appUrl}/account/billing?abacate=success`,
      metadata: {
        gestorId: gestor.id,
        planId,
        interval,
        purchaseType: "plan_subscription",
      },
    });

    if (!checkout.url || !checkout.id) {
      return new Response(JSON.stringify({ error: "Falha ao criar checkout recorrente no Abacate Pay." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient.from("assinaturas").upsert(
      {
        gestor_id: gestor.id,
        plano_id: planId,
        status: "pending",
        billing_interval: interval,
        payment_provider: "abacatepay",
        abacate_customer_id: customer.id,
        abacate_checkout_id: checkout.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "gestor_id" },
    );

    return new Response(JSON.stringify({ url: checkout.url, checkoutId: checkout.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("abacatepay-checkout error", error);
    return new Response(JSON.stringify({ error: "Failed to create Abacate Pay checkout" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
