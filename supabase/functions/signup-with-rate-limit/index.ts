import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { buildWelcomeEmail, sendTransactionalEmail } from "../_shared/email.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error("Missing required environment variables for signup-with-rate-limit function.");
}

const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
const authClient = createClient(supabaseUrl, supabaseAnonKey);

const WINDOW_HOURS = Number(Deno.env.get("SIGNUP_IP_WINDOW_HOURS") ?? "24");
const MAX_SIGNUPS_PER_WINDOW = Number(Deno.env.get("SIGNUP_IP_MAX_SIGNUPS") ?? "2");

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  const cf = req.headers.get("cf-connecting-ip");
  const real = req.headers.get("x-real-ip");

  const raw = fwd?.split(",")[0]?.trim() || cf || real || "unknown";
  return raw.slice(0, 128);
}

async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email e senha são obrigatórios." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? null;
    const ipHash = await sha256(ip);

    const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();

    const { count, error: countError } = await adminClient
      .from("signup_ip_events")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", windowStart);

    if (countError) {
      console.error("signup-with-rate-limit count error", countError);
      return new Response(JSON.stringify({ error: "Não foi possível validar limite de cadastro." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((count ?? 0) >= MAX_SIGNUPS_PER_WINDOW) {
      return new Response(
        JSON.stringify({
          error: "Muitas contas criadas neste IP recentemente. Tente novamente mais tarde.",
          code: "ip_rate_limit_exceeded",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data, error: signUpError } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name ?? null,
        },
      },
    });

    if (signUpError) {
      return new Response(JSON.stringify({ error: signUpError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await adminClient.from("signup_ip_events").insert({
      ip_hash: ipHash,
      email,
      auth_user_id: data.user?.id ?? null,
      user_agent: userAgent,
    });

    const welcomeEmail = buildWelcomeEmail(name ?? email.split("@")[0] ?? "gestor", !data.session);
    await sendTransactionalEmail({
      to: email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
      tags: [
        { name: "flow", value: "signup" },
        { name: "product", value: "vurp" },
      ],
    });

    return new Response(
      JSON.stringify({
        success: true,
        userId: data.user?.id ?? null,
        needsEmailConfirmation: !data.session,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("signup-with-rate-limit unexpected error", error);
    return new Response(JSON.stringify({ error: "Erro inesperado no cadastro." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
