import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, TrendingDown, Flame, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BalanceForecastChartProps {
  clienteId?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const BalanceForecastChart = ({ clienteId }: BalanceForecastChartProps) => {
  const navigate = useNavigate();
  
  const { data: trackingData, isLoading } = useQuery({
    queryKey: ["balance-forecast", clienteId],
    queryFn: async () => {
      let query = supabase
        .from("client_tracking")
        .select("*, clientes(id, nome, logo_url, investimento_mensal, redes_sociais)");

      if (clienteId) {
        query = query.eq("cliente_id", clienteId);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const forecastData = useMemo(() => {
    if (!trackingData?.length) return [];

    return trackingData
      .filter((t) => {
        const hasGoogleData = t.google_saldo && Number(t.google_saldo) > 0 && t.google_valor_diario && Number(t.google_valor_diario) > 0;
        const hasMetaData = t.meta_saldo && Number(t.meta_saldo) > 0 && t.meta_valor_diario && Number(t.meta_valor_diario) > 0;
        return hasGoogleData || hasMetaData;
      })
      .map((tracking) => {
        const cliente = tracking.clientes as any;
        const googleSaldo = Number(tracking.google_saldo) || 0;
        const googleDiario = Number(tracking.google_valor_diario) || 0;
        const metaSaldo = Number(tracking.meta_saldo) || 0;
        const metaDiario = Number(tracking.meta_valor_diario) || 0;

        const googleDaysRemaining = googleDiario > 0 ? Math.ceil(googleSaldo / googleDiario) : 999;
        const metaDaysRemaining = metaDiario > 0 ? Math.ceil(metaSaldo / metaDiario) : 999;

        const googleZeroDate = googleDiario > 0 ? addDays(new Date(), googleDaysRemaining) : null;
        const metaZeroDate = metaDiario > 0 ? addDays(new Date(), metaDaysRemaining) : null;

        // Calculate percentage remaining (assume 30 days worth is 100%)
        const googleMaxDays = 30;
        const metaMaxDays = 30;
        const googlePercentage = Math.min(100, (googleDaysRemaining / googleMaxDays) * 100);
        const metaPercentage = Math.min(100, (metaDaysRemaining / metaMaxDays) * 100);

        return {
          clienteId: tracking.cliente_id,
          clienteNome: cliente?.nome || "Cliente",
          clienteLogo: cliente?.logo_url || null,
          googleSaldo,
          googleDiario,
          googleDaysRemaining: googleDaysRemaining === 999 ? null : googleDaysRemaining,
          googleZeroDate,
          googlePercentage,
          metaSaldo,
          metaDiario,
          metaDaysRemaining: metaDaysRemaining === 999 ? null : metaDaysRemaining,
          metaZeroDate,
          metaPercentage,
          urgency: Math.min(googleDaysRemaining, metaDaysRemaining),
        };
      })
      .sort((a, b) => a.urgency - b.urgency);
  }, [trackingData]);

  const getUrgencyColor = (days: number | null) => {
    if (days === null) return "text-muted-foreground";
    if (days <= 3) return "text-red-500";
    if (days <= 7) return "text-orange-500";
    if (days <= 14) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressColor = (days: number | null) => {
    if (days === null) return "bg-muted";
    if (days <= 3) return "bg-red-500";
    if (days <= 7) return "bg-orange-500";
    if (days <= 14) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!forecastData.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="vcd-card text-center py-12"
      >
        <Flame className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum Dado de Saldo
        </h3>
        <p className="text-muted-foreground">
          Configure os saldos e valores diários dos clientes para ver as projeções.
        </p>
      </motion.div>
    );
  }

  // Stats
  const urgentCount = forecastData.filter(c => c.urgency <= 3).length;
  const warningCount = forecastData.filter(c => c.urgency > 3 && c.urgency <= 7).length;
  const healthyCount = forecastData.filter(c => c.urgency > 7).length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="vcd-card p-4 border-red-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{urgentCount}</p>
              <p className="text-xs text-muted-foreground">Crítico (≤3 dias)</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="vcd-card p-4 border-orange-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{warningCount}</p>
              <p className="text-xs text-muted-foreground">Atenção (4-7 dias)</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="vcd-card p-4 border-green-500/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{healthyCount}</p>
              <p className="text-xs text-muted-foreground">Saudável (+7 dias)</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Client Cards - Compact View */}
      <div className="grid gap-3">
        {forecastData.map((client, index) => (
          <motion.div
            key={client.clienteId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => navigate(`/cliente/${client.clienteId}`)}
            className={cn(
              "vcd-card p-4 cursor-pointer hover:border-primary/30 transition-all",
              client.urgency <= 3 && "border-red-500/50 bg-red-500/5",
              client.urgency > 3 && client.urgency <= 7 && "border-orange-500/50 bg-orange-500/5"
            )}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {client.clienteLogo ? (
                <img
                  src={client.clienteLogo}
                  alt={client.clienteNome}
                  className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {client.clienteNome.charAt(0)}
                  </span>
                </div>
              )}

              {/* Client Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-foreground truncate">{client.clienteNome}</p>
                  {client.urgency <= 3 && (
                    <span className="px-2 py-0.5 text-xs bg-red-500/10 text-red-500 rounded-full whitespace-nowrap">
                      Urgente
                    </span>
                  )}
                </div>

                {/* Platform Bars */}
                <div className="space-y-2">
                  {client.googleDaysRemaining !== null && (
                    <div className="flex items-center gap-3">
                      <div className="w-16 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-muted-foreground">Google</span>
                      </div>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", getProgressColor(client.googleDaysRemaining))}
                          style={{ width: `${client.googlePercentage}%` }}
                        />
                      </div>
                      <div className="w-24 text-right">
                        <span className={cn("text-xs font-medium", getUrgencyColor(client.googleDaysRemaining))}>
                          {client.googleDaysRemaining}d
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({formatCurrency(client.googleSaldo)})
                        </span>
                      </div>
                    </div>
                  )}

                  {client.metaDaysRemaining !== null && (
                    <div className="flex items-center gap-3">
                      <div className="w-16 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                        <span className="text-xs text-muted-foreground">Meta</span>
                      </div>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", getProgressColor(client.metaDaysRemaining))}
                          style={{ width: `${client.metaPercentage}%` }}
                        />
                      </div>
                      <div className="w-24 text-right">
                        <span className={cn("text-xs font-medium", getUrgencyColor(client.metaDaysRemaining))}>
                          {client.metaDaysRemaining}d
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({formatCurrency(client.metaSaldo)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BalanceForecastChart;
