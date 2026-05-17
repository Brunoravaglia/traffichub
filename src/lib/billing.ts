import { supabase } from "@/integrations/supabase/client";

export type BillingInterval = "monthly" | "yearly";

export interface PlanInfo {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxAccounts: number;
  maxManagers: number;
  features: string[];
}

export interface BillingOverview {
  subscription: {
    planId: string;
    status: string;
    interval: BillingInterval | null;
  };
  wallet: {
    saldoCreditos: number;
    totalComprados: number;
    totalConsumidos: number;
  };
  freeReportsRemaining: number;
  reportsGenerated: number;
}

export interface AgencyAccessLike {
  slug?: string | null;
  nome?: string | null;
}

export const FOUNDER_ACCESS_BADGE = "Founder Access";

const normalizeAgencyAccessValue = (value?: string | null) =>
  (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function isFounderPartnerAgency(agency?: AgencyAccessLike | null): boolean {
  const slug = normalizeAgencyAccessValue(agency?.slug);
  const nome = normalizeAgencyAccessValue(agency?.nome);

  return slug === "vcd" || nome.includes("voce digital");
}

export const PLANS: PlanInfo[] = [
  {
    id: "solo",
    name: "Solo",
    description: "Para gestores independentes",
    priceMonthly: 27.9,
    priceYearly: 267.84,
    maxAccounts: 5,
    maxManagers: 1,
    features: [
      "Até 5 contas de anúncios",
      "1 gestor de tráfego",
      "Checklist por cliente",
      "Relatórios profissionais",
      "Exportação em PDF",
      "Calendário de entregas",
      "Gamificação e conquistas",
    ],
  },
  {
    id: "agency",
    name: "Agência",
    description: "Para donos de agência",
    priceMonthly: 97,
    priceYearly: 931.2,
    maxAccounts: 50,
    maxManagers: 3,
    features: [
      "Até 50 contas de anúncios",
      "Até 3 gestores de tráfego",
      "Tudo do plano Solo",
      "Dashboard gerencial",
      "Gestão multi-gestor",
      "Controle de clientes avançado",
      "Previsão de saldo",
      "Modelos customizáveis",
    ],
  },
  {
    id: "agency-pro",
    name: "Agência Pro",
    description: "Para agências maiores",
    priceMonthly: 197,
    priceYearly: 1891.2,
    maxAccounts: 50,
    maxManagers: 5,
    features: [
      "Até 50 contas de anúncios",
      "Até 5 gestores de tráfego",
      "Tudo do plano Agência",
      "Monitoramento de tempo",
      "Controle de acessos da equipe",
      "Relatórios de produtividade",
      "Dashboard de performance por gestor",
      "Suporte prioritário",
    ],
  },
];

export async function redirectToSubscriptionCheckout(
  planId: string,
  interval: BillingInterval,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke("stripe-checkout", {
    body: {
      planId,
      interval,
    },
  });

  if (error) {
    throw new Error(`Falha ao iniciar checkout: ${error.message}`);
  }

  if (!data?.url) {
    throw new Error("Checkout inválido: URL não retornada.");
  }

  window.location.href = data.url;
}

export async function redirectToCreditCheckout(credits: number): Promise<void> {
  const qty = Number(credits);
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new Error("Quantidade de créditos inválida.");
  }

  const { data, error } = await supabase.functions.invoke("stripe-credit-checkout", {
    body: {
      credits: qty,
    },
  });

  if (error) {
    throw new Error(`Falha ao iniciar compra de créditos: ${error.message}`);
  }

  if (!data?.url) {
    throw new Error("Checkout de créditos inválido: URL não retornada.");
  }

  window.location.href = data.url;
}

export async function getCreditWallet(): Promise<{
  saldoCreditos: number;
  totalComprados: number;
  totalConsumidos: number;
}> {
  const { data, error } = await (supabase
    .from("report_credit_wallets" as never)
    .select("saldo_creditos, total_comprados, total_consumidos")
    .maybeSingle() as Promise<{
      data: {
        saldo_creditos?: number | null;
        total_comprados?: number | null;
        total_consumidos?: number | null;
      } | null;
      error: { message: string } | null;
    }>);

  if (error) {
    throw new Error(`Falha ao carregar carteira de créditos: ${error.message}`);
  }

  return {
    saldoCreditos: data?.saldo_creditos ?? 0,
    totalComprados: data?.total_comprados ?? 0,
    totalConsumidos: data?.total_consumidos ?? 0,
  };
}

export async function getBillingOverview(
  gestorId?: string | null,
  agency?: AgencyAccessLike | null,
): Promise<BillingOverview> {
  const wallet = await getCreditWallet();

  const { data: subscriptionData, error: subscriptionError } = await (supabase
    .from("assinaturas" as never)
    .select("plano_id, status, billing_interval")
    .maybeSingle() as Promise<{
      data: {
        plano_id?: string | null;
        status?: string | null;
        billing_interval?: BillingInterval | null;
      } | null;
      error: { message: string } | null;
    }>);

  if (subscriptionError) {
    throw new Error(`Falha ao carregar assinatura: ${subscriptionError.message}`);
  }

  let reportsGenerated = 0;
  if (gestorId) {
    const { data: clients, error: clientsError } = await (supabase
      .from("clientes" as never)
      .select("id")
      .eq("gestor_id", gestorId) as Promise<{
        data: Array<{ id: string }> | null;
        error: { message: string } | null;
      }>);

    if (clientsError) {
      throw new Error(`Falha ao carregar clientes para billing: ${clientsError.message}`);
    }

    const clientIds = (clients ?? []).map((client) => client.id);
    if (clientIds.length > 0) {
      const [relatorios, legacyReports] = await Promise.all([
        supabase
          .from("relatorios" as never)
          .select("id", { count: "exact", head: true })
          .in("cliente_id", clientIds) as Promise<{ count: number | null; error: { message: string } | null }>,
        supabase
          .from("client_reports" as never)
          .select("id", { count: "exact", head: true })
          .in("cliente_id", clientIds) as Promise<{ count: number | null; error: { message: string } | null }>,
      ]);

      if (relatorios.error) {
        throw new Error(`Falha ao contar relatórios: ${relatorios.error.message}`);
      }

      if (legacyReports.error) {
        throw new Error(`Falha ao contar relatórios legados: ${legacyReports.error.message}`);
      }

      reportsGenerated = (relatorios.count ?? 0) + (legacyReports.count ?? 0);
    }
  }

  if (isFounderPartnerAgency(agency)) {
    return {
      subscription: {
        planId: "agency-pro",
        status: "active",
        interval: null,
      },
      wallet,
      freeReportsRemaining: 999999,
      reportsGenerated,
    };
  }

  return {
    subscription: {
      planId: subscriptionData?.plano_id ?? "free",
      status: subscriptionData?.status ?? "active",
      interval: subscriptionData?.billing_interval ?? null,
    },
    wallet,
    freeReportsRemaining: Math.max(0, 3 - reportsGenerated),
    reportsGenerated,
  };
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}
