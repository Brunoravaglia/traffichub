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

export function formatPrice(amount: number): string {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}
