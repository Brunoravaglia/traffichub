import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { createEmbeddedCheckoutSession, getCheckoutSessionStatus, STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";
import { toast } from "@/hooks/use-toast";

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const EmbeddedCheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusResolved, setStatusResolved] = useState(false);

  const priceId = searchParams.get("priceId");
  const sessionId = searchParams.get("session_id");

  const stripeReady = useMemo(
    () => Boolean(STRIPE_PUBLISHABLE_KEY && stripePromise),
    [],
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        if (!stripeReady) {
          setStatusMessage("Stripe não configurado. Defina VITE_STRIPE_PUBLISHABLE_KEY.");
          return;
        }

        // Return from Stripe after checkout completion/cancel flow
        if (sessionId) {
          const status = await getCheckoutSessionStatus(sessionId);
          if (!active) return;

          setStatusResolved(true);

          if (status.status === "complete" || status.paymentStatus === "paid" || status.subscriptionStatus === "active") {
            setStatusMessage("Pagamento confirmado. Sua assinatura foi ativada.");
            return;
          }

          setStatusMessage("A sessão de checkout não foi concluída. Você pode tentar novamente.");
          return;
        }

        if (!priceId) {
          setStatusMessage("Plano inválido. Selecione um plano para continuar.");
          return;
        }

        const session = await createEmbeddedCheckoutSession(priceId, { returnPath: "/account/checkout" });
        if (!active) return;
        setClientSecret(session.clientSecret);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "Não foi possível iniciar o checkout Stripe.";
        setStatusMessage(message);
        toast({
          title: "Erro no checkout",
          description: message,
          variant: "destructive",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [priceId, sessionId, stripeReady]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout seguro</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Finalize sua assinatura sem sair do Vurp.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/50 bg-card/30 p-8 text-sm text-muted-foreground">
          Preparando checkout Stripe...
        </div>
      ) : null}

      {!loading && statusMessage ? (
        <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-4">
          <p className="text-sm text-foreground">{statusMessage}</p>
          <div className="flex flex-wrap gap-3">
            {statusResolved ? (
              <Button onClick={() => navigate("/account/billing")}>Ir para faturamento</Button>
            ) : null}
            <Button variant="outline" onClick={() => navigate("/pricing")}>
              Voltar para planos
            </Button>
          </div>
        </div>
      ) : null}

      {!loading && clientSecret && stripePromise ? (
        <div className="rounded-2xl border border-border/50 bg-card/20 p-2 sm:p-4">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      ) : null}
    </div>
  );
};

const EmbeddedCheckoutPageWithLayout = () => (
  <AppLayout>
    <EmbeddedCheckoutPage />
  </AppLayout>
);

export default EmbeddedCheckoutPageWithLayout;

