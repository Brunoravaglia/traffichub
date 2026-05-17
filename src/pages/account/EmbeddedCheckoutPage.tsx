import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { redirectToSubscriptionCheckout } from "@/lib/billing";
import { toast } from "@/hooks/use-toast";

const EmbeddedCheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const planId = searchParams.get("planId");
  const interval = searchParams.get("interval");
  const paymentState = searchParams.get("abacate");

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        if (paymentState === "success") {
          setStatusMessage("Pagamento confirmado. Seu plano foi enviado para ativacao.");
          return;
        }

        if (paymentState === "cancel") {
          setStatusMessage("O checkout foi cancelado. Você pode tentar novamente quando quiser.");
          return;
        }

        if (!planId || (interval !== "monthly" && interval !== "yearly")) {
          setStatusMessage("Plano inválido. Selecione um plano para continuar.");
          return;
        }

        if (!active) return;
        await redirectToSubscriptionCheckout(planId, interval);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "Não foi possível iniciar o checkout.";
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
  }, [interval, paymentState, planId]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout seguro</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estamos preparando sua assinatura segura no Abacate Pay.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/50 bg-card/30 p-8 text-sm text-muted-foreground">
          Redirecionando para o checkout...
        </div>
      ) : null}

      {!loading && statusMessage ? (
        <div className="rounded-2xl border border-border/50 bg-card/30 p-6 space-y-4">
          <p className="text-sm text-foreground">{statusMessage}</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/account/billing")}>Ir para faturamento</Button>
            <Button variant="outline" onClick={() => navigate("/pricing")}>
              Voltar para planos
            </Button>
          </div>
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
