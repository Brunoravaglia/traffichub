const resendApiKey = Deno.env.get("RESEND_API_KEY");
const appUrl = Deno.env.get("APP_URL") ?? "https://vurp.space";
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "Vurp <noreply@vurp.space>";
const supportInboxEmail = Deno.env.get("SUPPORT_INBOX_EMAIL") ?? "suporte@vurp.com.br";

type EmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
};

type EmailLayoutOptions = {
  eyebrow: string;
  title: string;
  intro: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderEmailLayout(options: EmailLayoutOptions) {
  const ctaBlock = options.ctaLabel && options.ctaUrl
    ? `
      <div style="margin:32px 0;">
        <a href="${options.ctaUrl}" style="display:inline-block;background:#89f05b;color:#0d1a12;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;">
          ${escapeHtml(options.ctaLabel)}
        </a>
      </div>
    `
    : "";

  const footnote = options.footnote
    ? `<p style="margin:28px 0 0;color:#91a39c;font-size:13px;line-height:1.6;">${options.footnote}</p>`
    : "";

  return `
    <!doctype html>
    <html lang="pt-BR">
      <body style="margin:0;padding:0;background:#07110c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f4f8f5;">
        <div style="padding:32px 16px;background:
          radial-gradient(circle at top left, rgba(137,240,91,0.16), transparent 32%),
          radial-gradient(circle at top right, rgba(39,86,57,0.32), transparent 28%),
          #07110c;">
          <div style="max-width:620px;margin:0 auto;background:#0f1d16;border:1px solid rgba(137,240,91,0.12);border-radius:28px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.28);">
            <div style="padding:20px 28px;border-bottom:1px solid rgba(255,255,255,0.08);">
              <div style="display:inline-flex;align-items:center;gap:10px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#89f05b;">
                ${escapeHtml(options.eyebrow)}
              </div>
            </div>
            <div style="padding:34px 28px 30px;">
              <h1 style="margin:0 0 14px;font-size:34px;line-height:1.05;color:#f4f8f5;">${escapeHtml(options.title)}</h1>
              <p style="margin:0 0 24px;color:#c7d3cd;font-size:16px;line-height:1.7;">${options.intro}</p>
              <div style="color:#e8efeb;font-size:15px;line-height:1.8;">
                ${options.bodyHtml}
              </div>
              ${ctaBlock}
              ${footnote}
            </div>
            <div style="padding:20px 28px;background:#0b1510;border-top:1px solid rgba(255,255,255,0.06);color:#8ea097;font-size:12px;line-height:1.7;">
              Vurp · Operação, relatórios e rotina comercial para gestores de tráfego.<br />
              <a href="${appUrl}" style="color:#89f05b;text-decoration:none;">${appUrl}</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendTransactionalEmail(options: EmailOptions) {
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not configured. Skipping email send.");
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
      tags: options.tags,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("resend send email failed", payload);
    throw new Error(payload?.message ?? "Failed to send email via Resend.");
  }

  return payload;
}

export function buildWelcomeEmail(name: string, needsEmailConfirmation: boolean) {
  return {
    subject: needsEmailConfirmation
      ? "Confirme seu email e ative sua conta no Vurp"
      : "Sua conta no Vurp ja esta pronta",
    html: renderEmailLayout({
      eyebrow: "Boas-vindas",
      title: needsEmailConfirmation ? "Confirme seu email e entre no jogo" : "Sua estrutura comecou a sair do caos",
      intro: needsEmailConfirmation
        ? `Oi, <strong>${escapeHtml(name)}</strong>. Sua conta foi criada. Agora falta confirmar seu email para liberar tudo no Vurp.`
        : `Oi, <strong>${escapeHtml(name)}</strong>. Sua conta no Vurp ja esta ativa e pronta para o primeiro setup.`,
      bodyHtml: needsEmailConfirmation
        ? `
          <p>Assim que voce confirmar o email, ja pode organizar clientes, gerar relatorios e comecar a usar os checklists da operacao.</p>
          <p>Depois da confirmacao, recomendamos esta ordem:</p>
          <ol style="padding-left:18px;">
            <li>complete seus dados de conta;</li>
            <li>cadastre o primeiro cliente;</li>
            <li>gere o primeiro relatorio em PDF.</li>
          </ol>
        `
        : `
          <p>Seu ambiente ja esta liberado. Em menos de 10 minutos voce consegue montar o primeiro fluxo profissional de entrega.</p>
          <p>O caminho mais rapido agora e:</p>
          <ol style="padding-left:18px;">
            <li>terminar o onboarding;</li>
            <li>adicionar seu primeiro cliente;</li>
            <li>publicar o primeiro relatorio.</li>
          </ol>
        `,
      ctaLabel: needsEmailConfirmation ? "Abrir meu email" : "Entrar no Vurp",
      ctaUrl: needsEmailConfirmation ? "https://mail.google.com" : `${appUrl}/login`,
      footnote: "Se nao foi voce quem criou essa conta, pode ignorar este email com seguranca.",
    }),
  };
}

export function buildPlanActivatedEmail(name: string, planName: string, intervalLabel: string) {
  return {
    subject: `Plano ${planName} confirmado no Vurp`,
    html: renderEmailLayout({
      eyebrow: "Pagamento aprovado",
      title: `${planName} ativo no seu workspace`,
      intro: `Boa, <strong>${escapeHtml(name)}</strong>. Confirmamos o pagamento do seu plano <strong>${escapeHtml(planName)}</strong> no ciclo <strong>${escapeHtml(intervalLabel)}</strong>.`,
      bodyHtml: `
        <p>Seu acesso pago ja esta liberado e a operacao pode seguir normalmente.</p>
        <p>Agora vale aproveitar este momento para:</p>
        <ul style="padding-left:18px;">
          <li>organizar sua equipe ou clientes ativos;</li>
          <li>padronizar checklists e rotinas;</li>
          <li>subir o nivel das entregas comerciais.</li>
        </ul>
      `,
      ctaLabel: "Abrir faturamento",
      ctaUrl: `${appUrl}/account/billing`,
      footnote: "Se voce precisar revisar dados fiscais ou documentos de cobranca, faça isso pela area de faturamento.",
    }),
  };
}

export function buildCreditsPurchasedEmail(name: string, creditsQty: number) {
  return {
    subject: `${creditsQty} credito(s) adicionados ao Vurp`,
    html: renderEmailLayout({
      eyebrow: "Creditos adicionados",
      title: "Seus creditos ja estao na carteira",
      intro: `Tudo certo, <strong>${escapeHtml(name)}</strong>. Sua compra de <strong>${creditsQty} credito(s)</strong> foi confirmada.`,
      bodyHtml: `
        <p>Os creditos ja podem ser usados nas geracoes de relatorio e nas proximas entregas.</p>
        <p>Se quiser acompanhar o saldo e o historico, a carteira foi atualizada automaticamente na sua conta.</p>
      `,
      ctaLabel: "Ver faturamento",
      ctaUrl: `${appUrl}/account/billing`,
    }),
  };
}

export function buildSupportInboxEmail(name: string, email: string, topic: string, message: string) {
  return {
    to: supportInboxEmail,
    subject: `[Suporte Vurp] ${topic}`,
    html: renderEmailLayout({
      eyebrow: "Novo ticket",
      title: `Mensagem de ${escapeHtml(name)}`,
      intro: `Novo contato recebido pelo formulario publico do Vurp.`,
      bodyHtml: `
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Assunto:</strong> ${escapeHtml(topic)}</p>
        <p><strong>Mensagem:</strong></p>
        <div style="padding:18px;border-radius:18px;background:#13251b;border:1px solid rgba(255,255,255,0.08);white-space:pre-wrap;">${escapeHtml(message)}</div>
      `,
      ctaLabel: "Responder contato",
      ctaUrl: `mailto:${encodeURIComponent(email)}`,
    }),
    replyTo: email,
  };
}

export function buildSupportAutoReplyEmail(name: string, topic: string) {
  return {
    subject: "Recebemos sua mensagem no Vurp",
    html: renderEmailLayout({
      eyebrow: "Suporte Vurp",
      title: "Seu pedido entrou na fila certa",
      intro: `Oi, <strong>${escapeHtml(name)}</strong>. Recebemos sua mensagem sobre <strong>${escapeHtml(topic)}</strong>.`,
      bodyHtml: `
        <p>Nosso time vai analisar o contexto e responder o mais rapido possivel, normalmente em ate 1 dia util.</p>
        <p>Se for algo urgente ligado a acesso, faturamento ou erro em entrega, responda este email com mais detalhes para acelerar o atendimento.</p>
      `,
      ctaLabel: "Abrir Vurp",
      ctaUrl: appUrl,
    }),
  };
}
