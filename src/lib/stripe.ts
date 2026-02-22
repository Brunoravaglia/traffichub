import { supabase } from "@/integrations/supabase/client";

export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

export interface PlanInfo {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  maxAccounts: number;
  maxManagers: number;
  features: string[];
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
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
    stripePriceIdMonthly: import.meta.env.VITE_STRIPE_PRICE_SOLO_MONTHLY,
    stripePriceIdYearly: import.meta.env.VITE_STRIPE_PRICE_SOLO_YEARLY,
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
    stripePriceIdMonthly: import.meta.env.VITE_STRIPE_PRICE_AGENCY_MONTHLY,
    stripePriceIdYearly: import.meta.env.VITE_STRIPE_PRICE_AGENCY_YEARLY,
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
    stripePriceIdMonthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
    stripePriceIdYearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY,
  },
];

export async function redirectToCheckout(priceId: string): Promise<void> {
  if (!priceId) {
    throw new Error("Stripe priceId ausente. Configure os IDs no .env.");
  }

  const { data, error } = await supabase.functions.invoke("stripe-checkout", {
    body: {
      priceId,
      successPath: "/account/billing",
      cancelPath: "/pricing",
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

export async function redirectToCustomerPortal(): Promise<void> {
  const { data, error } = await supabase.functions.invoke("stripe-customer-portal", {
    body: {},
  });

  if (error) {
    throw new Error(`Falha ao abrir portal Stripe: ${error.message}`);
  }

  if (!data?.url) {
    throw new Error("Portal inválido: URL não retornada.");
  }

  window.location.href = data.url;
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}
