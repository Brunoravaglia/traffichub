/**
 * Stripe client-side utilities for Vurp SaaS.
 *
 * NOTE: Actual Stripe operations (creating checkout sessions, managing subscriptions)
 * require server-side code (Supabase Edge Functions). This module provides:
 * 1. Client-side Stripe.js initialization
 * 2. Helper functions to call your backend endpoints
 * 3. Type definitions for plan data
 */

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
        priceYearly: 267.84, // 20% off
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
        stripePriceIdMonthly: "price_solo_monthly",
        stripePriceIdYearly: "price_solo_yearly",
    },
    {
        id: "agency",
        name: "Agência",
        description: "Para donos de agência",
        priceMonthly: 97,
        priceYearly: 931.2, // 20% off
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
        stripePriceIdMonthly: "price_agency_monthly",
        stripePriceIdYearly: "price_agency_yearly",
    },
    {
        id: "agency-pro",
        name: "Agência Pro",
        description: "Para agências maiores",
        priceMonthly: 197,
        priceYearly: 1891.2, // 20% off
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
        stripePriceIdMonthly: "price_pro_monthly",
        stripePriceIdYearly: "price_pro_yearly",
    },
];

/**
 * Redirect to Stripe Checkout.
 * In production, call your backend to create a Checkout Session,
 * then redirect to the returned URL.
 */
export async function redirectToCheckout(priceId: string): Promise<void> {
    // TODO: Replace with actual API call to your Supabase Edge Function
    // const response = await fetch('/api/stripe/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ priceId }),
    // });
    // const { url } = await response.json();
    // window.location.href = url;

    console.log(`[Stripe] Would create checkout session for price: ${priceId}`);
    alert("Integração Stripe será ativada em breve! Price ID: " + priceId);
}

/**
 * Redirect to Stripe Customer Portal for subscription management.
 */
export async function redirectToCustomerPortal(): Promise<void> {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/stripe/customer-portal', { method: 'POST' });
    // const { url } = await response.json();
    // window.location.href = url;

    console.log("[Stripe] Would redirect to customer portal");
    alert("Portal do cliente Stripe será ativado em breve!");
}

/**
 * Format price for display in Brazilian Real.
 */
export function formatPrice(amount: number): string {
    return amount.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    });
}
