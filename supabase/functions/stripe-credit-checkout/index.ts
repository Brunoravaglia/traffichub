import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createCheckout,
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
  throw new Error("Missing required environment variables for Abacate Pay credit checkout function.");
}

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

    const { credits } = await req.json();
    const parsedCredits = Number(credits);
    const creditsQty = Number.isInteger(parsedCredits) ? parsedCredits : 0;

    const agencyDocument = gestor.agencia_id
      ? await adminClient.from("agencias").select("nome, cnpj").eq("id", gestor.agencia_id).maybeSingle()
      : null;

    const taxId = gestor.agencia_id ? agencyDocument?.data?.cnpj ?? null : gestor.cpf;
    if (!taxId) {
      return new Response(JSON.stringify({
        error: gestor.agencia_id
          ? "Cadastre o CNPJ da agência antes de comprar créditos."
          : "Cadastre seu CPF na conta antes de comprar créditos.",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!gestor.telefone) {
      return new Response(JSON.stringify({ error: "Cadastre um telefone antes de comprar créditos." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (creditsQty <= 0 || creditsQty > 10000) {
      return new Response(JSON.stringify({ error: "Quantidade de créditos inválida." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const externalId = `credits:${gestor.id}:${creditsQty}:${Date.now()}`;

    const customer = await getOrCreateCustomer(abacateApiKey, {
      email: billingEmail,
      name: gestor.agencia_id ? agencyDocument?.data?.nome ?? gestor.nome ?? "Agencia Vurp" : gestor.nome ?? "Gestor Vurp",
      cellphone: gestor.telefone,
      taxId,
      metadata: {
        gestorId: gestor.id,
        agencyId: gestor.agencia_id,
        source: "vurp-credit-checkout",
      },
    });

    const product = await getOrCreateProduct(abacateApiKey, {
      externalId: "vurp-report-credit-unit",
      name: "Credito de Relatorio Vurp",
      description: "Credito avulso para geracao de relatorios no Vurp.",
      price: 100,
    });

    const checkout = await createCheckout(abacateApiKey, {
      items: [{ id: product.id, quantity: creditsQty }],
      customerId: customer.id,
      externalId,
      returnUrl: `${appUrl}/account/billing?credits=cancel`,
      completionUrl: `${appUrl}/account/billing?credits=success`,
      methods: ["PIX", "CARD"],
      metadata: {
        gestorId: gestor.id,
        creditsQty,
        purchaseType: "report_credits",
      },
    });

    if (!checkout.url || !checkout.id) {
      return new Response(JSON.stringify({ error: "Falha ao criar checkout de créditos no Abacate Pay." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        url: checkout.url,
        checkoutId: checkout.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("abacatepay-credit-checkout error", error);
    return new Response(JSON.stringify({ error: "Failed to create Abacate Pay credit checkout" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
