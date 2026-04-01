import { corsHeaders } from "../_shared/cors.ts";
import {
  buildSupportAutoReplyEmail,
  buildSupportInboxEmail,
  sendTransactionalEmail,
} from "../_shared/email.ts";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const { name, email, topic, message } = await req.json();

    if (!name || !email || !topic || !message) {
      return new Response(JSON.stringify({ error: "Todos os campos sao obrigatorios." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Email invalido." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supportEmail = buildSupportInboxEmail(name, email, topic, message);
    const autoReplyEmail = buildSupportAutoReplyEmail(name, topic);

    await Promise.all([
      sendTransactionalEmail({
        to: supportEmail.to,
        subject: supportEmail.subject,
        html: supportEmail.html,
        replyTo: supportEmail.replyTo,
        tags: [
          { name: "flow", value: "support_inbox" },
          { name: "topic", value: topic.toLowerCase().replaceAll(/\s+/g, "_") },
        ],
      }),
      sendTransactionalEmail({
        to: email,
        subject: autoReplyEmail.subject,
        html: autoReplyEmail.html,
        tags: [
          { name: "flow", value: "support_autoreply" },
        ],
      }),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("support-contact error", error);
    return new Response(JSON.stringify({ error: "Nao foi possivel enviar a mensagem." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
