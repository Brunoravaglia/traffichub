import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingDown, AlertTriangle, Calendar, DollarSign, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";

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
  const { data: trackingData, isLoading } = useQuery({
    queryKey: ["balance-forecast", clienteId],
    queryFn: async () => {
      let query = supabase
        .from("client_tracking")
        .select("*, clientes(nome, investimento_mensal, redes_sociais)");

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

        const googleDaysRemaining = googleDiario > 0 ? Math.ceil(googleSaldo / googleDiario) : 0;
        const metaDaysRemaining = metaDiario > 0 ? Math.ceil(metaSaldo / metaDiario) : 0;

        // Generate projection for next 30 days
        const projection: { date: string; google: number; meta: number; total: number }[] = [];
        const today = new Date();

        for (let i = 0; i <= 30; i++) {
          const date = addDays(today, i);
          const googleBalance = Math.max(0, googleSaldo - googleDiario * i);
          const metaBalance = Math.max(0, metaSaldo - metaDiario * i);

          projection.push({
            date: format(date, "dd/MM", { locale: ptBR }),
            google: Math.round(googleBalance * 100) / 100,
            meta: Math.round(metaBalance * 100) / 100,
            total: Math.round((googleBalance + metaBalance) * 100) / 100,
          });
        }

        // Find when balance reaches zero
        const googleZeroDate = googleDiario > 0 
          ? addDays(today, googleDaysRemaining) 
          : null;
        const metaZeroDate = metaDiario > 0 
          ? addDays(today, metaDaysRemaining) 
          : null;

        return {
          clienteId: tracking.cliente_id,
          clienteNome: cliente?.nome || "Cliente",
          googleSaldo,
          googleDiario,
          googleDaysRemaining,
          googleZeroDate,
          metaSaldo,
          metaDiario,
          metaDaysRemaining,
          metaZeroDate,
          projection,
          urgency: Math.min(googleDaysRemaining || 999, metaDaysRemaining || 999),
        };
      })
      .sort((a, b) => a.urgency - b.urgency);
  }, [trackingData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
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
        <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum Dado de Saldo
        </h3>
        <p className="text-muted-foreground">
          Configure os saldos e valores diários dos clientes para ver as projeções.
        </p>
      </motion.div>
    );
  }

  // Show single client view or overview
  const isSingleClient = !!clienteId;
  const clientData = isSingleClient ? forecastData[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Previsão de Saldo
          </h2>
          <p className="text-muted-foreground text-sm">
            Projeção de burnrate e quando os saldos vão acabar
          </p>
        </div>
      </div>

      {isSingleClient && clientData ? (
        // Single client detailed view
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {clientData.googleSaldo > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="vcd-card"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-muted-foreground">Google Ads</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(clientData.googleSaldo)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Saldo atual
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`vcd-card ${clientData.googleDaysRemaining <= 3 ? "border-red-500/50" : clientData.googleDaysRemaining <= 7 ? "border-orange-500/50" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {clientData.googleDaysRemaining <= 3 ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Calendar className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className={`text-2xl font-bold ${
                    clientData.googleDaysRemaining <= 3 
                      ? "text-red-500" 
                      : clientData.googleDaysRemaining <= 7 
                        ? "text-orange-500" 
                        : "text-foreground"
                  }`}>
                    {clientData.googleDaysRemaining} dias
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Google restantes
                  </p>
                </motion.div>
              </>
            )}

            {clientData.metaSaldo > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="vcd-card"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    <span className="text-sm text-muted-foreground">Meta Ads</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(clientData.metaSaldo)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Saldo atual
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`vcd-card ${clientData.metaDaysRemaining <= 3 ? "border-red-500/50" : clientData.metaDaysRemaining <= 7 ? "border-orange-500/50" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {clientData.metaDaysRemaining <= 3 ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Calendar className="w-4 h-4 text-pink-500" />
                    )}
                  </div>
                  <p className={`text-2xl font-bold ${
                    clientData.metaDaysRemaining <= 3 
                      ? "text-red-500" 
                      : clientData.metaDaysRemaining <= 7 
                        ? "text-orange-500" 
                        : "text-foreground"
                  }`}>
                    {clientData.metaDaysRemaining} dias
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Meta restantes
                  </p>
                </motion.div>
              </>
            )}
          </div>

          {/* Projection Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="vcd-card"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Projeção de Saldo (30 dias)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={clientData.projection}>
                  <defs>
                    <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    interval={4}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "google" ? "Google Ads" : "Meta Ads",
                    ]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" />
                  {clientData.googleSaldo > 0 && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="google"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#colorGoogle)"
                      />
                      <Line
                        type="monotone"
                        dataKey="google"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </>
                  )}
                  {clientData.metaSaldo > 0 && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="meta"
                        stroke="#EC4899"
                        strokeWidth={2}
                        fill="url(#colorMeta)"
                      />
                      <Line
                        type="monotone"
                        dataKey="meta"
                        stroke="#EC4899"
                        strokeWidth={2}
                        dot={false}
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Burnrate Info */}
          <div className="grid md:grid-cols-2 gap-4">
            {clientData.googleDiario > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="vcd-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Burnrate Google</h4>
                    <p className="text-sm text-muted-foreground">Taxa de consumo diário</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor diário:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(clientData.googleDiario)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saldo acabará em:</span>
                    <span className="font-medium text-foreground">
                      {clientData.googleZeroDate
                        ? format(clientData.googleZeroDate, "dd/MM/yyyy", { locale: ptBR })
                        : "-"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {clientData.metaDiario > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="vcd-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Burnrate Meta</h4>
                    <p className="text-sm text-muted-foreground">Taxa de consumo diário</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor diário:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(clientData.metaDiario)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saldo acabará em:</span>
                    <span className="font-medium text-foreground">
                      {clientData.metaZeroDate
                        ? format(clientData.metaZeroDate, "dd/MM/yyyy", { locale: ptBR })
                        : "-"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        // Overview of all clients
        <div className="space-y-4">
          {forecastData.map((client, index) => (
            <motion.div
              key={client.clienteId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`vcd-card ${
                client.urgency <= 3 
                  ? "border-red-500/50" 
                  : client.urgency <= 7 
                    ? "border-orange-500/50" 
                    : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">{client.clienteNome}</h3>
                {client.urgency <= 3 && (
                  <span className="px-2 py-1 text-xs bg-red-500/10 text-red-500 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Urgente
                  </span>
                )}
                {client.urgency > 3 && client.urgency <= 7 && (
                  <span className="px-2 py-1 text-xs bg-orange-500/10 text-orange-500 rounded-full">
                    Atenção
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {client.googleSaldo > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Google Saldo
                      </p>
                      <p className="font-medium text-foreground">
                        {formatCurrency(client.googleSaldo)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Google Restante</p>
                      <p className={`font-medium ${
                        client.googleDaysRemaining <= 3 
                          ? "text-red-500" 
                          : client.googleDaysRemaining <= 7 
                            ? "text-orange-500" 
                            : "text-foreground"
                      }`}>
                        {client.googleDaysRemaining} dias
                      </p>
                    </div>
                  </>
                )}
                {client.metaSaldo > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                        Meta Saldo
                      </p>
                      <p className="font-medium text-foreground">
                        {formatCurrency(client.metaSaldo)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Meta Restante</p>
                      <p className={`font-medium ${
                        client.metaDaysRemaining <= 3 
                          ? "text-red-500" 
                          : client.metaDaysRemaining <= 7 
                            ? "text-orange-500" 
                            : "text-foreground"
                      }`}>
                        {client.metaDaysRemaining} dias
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Mini Chart */}
              <div className="h-24 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={client.projection.slice(0, 14)}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    {client.googleSaldo > 0 && (
                      <Line
                        type="monotone"
                        dataKey="google"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {client.metaSaldo > 0 && (
                      <Line
                        type="monotone"
                        dataKey="meta"
                        stroke="#EC4899"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BalanceForecastChart;
